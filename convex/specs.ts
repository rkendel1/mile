"use node"; // Specify that this function runs in a Node.js environment

import { v } from "convex/values";
import { action, internalAction, internalMutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import SwaggerParser from "swagger-parser";
import { ParsedSpec, Endpoint, Model, AuthMethod, Parameter, RequestBody, Response, Schema } from "../types";

// Helper class for parsing, moved to the backend
class SpecParser {
  async parse(content: any): Promise<ParsedSpec> {
    const api = await SwaggerParser.validate(content, {
      dereference: { circular: "ignore" },
    });
    return {
      endpoints: this.parseEndpoints(api.paths),
      models: this.parseModels(api.components?.schemas),
      authMethods: this.parseAuthMethods(api.components?.securitySchemes),
      baseUrl: api.servers?.[0]?.url || "",
    };
  }
  private parseEndpoints = (paths: any): Endpoint[] => Object.entries(paths || {}).flatMap(([path, pathItem]) => Object.entries(pathItem as object).map(([method, op]: [string, any]) => ({ id: op.operationId || `${method}-${path}`.replace(/[^a-zA-Z0-9]/g, "-"), path, method: method.toUpperCase(), summary: op.summary, description: op.description, parameters: this.parseParameters(op.parameters), requestBody: this.parseRequestBody(op.requestBody), responses: this.parseResponses(op.responses), tags: op.tags, })));
  private parseModels = (schemas: any): Model[] => Object.entries(schemas || {}).map(([name, schema]: [string, any]) => ({ name, description: schema.description, properties: this.parseProperties(schema.properties), required: schema.required || [], }));
  private parseAuthMethods = (schemes: any): AuthMethod[] => Object.entries(schemes || {}).map(([name, s]: [string, any]) => ({ type: s.type === "http" ? (s.scheme === "bearer" ? "bearer" : "basic") : s.type, name: s.name || name, in: s.in, }));
  private parseParameters = (params: any[] = []): Parameter[] => params.map(p => ({ name: p.name, in: p.in, description: p.description, required: p.required || false, schema: this.parseSchema(p.schema), }));
  private parseRequestBody = (body: any): RequestBody | undefined => body ? { description: body.description, required: body.required || false, content: this.parseContent(body.content), } : undefined;
  private parseResponses = (responses: any): Response[] => Object.entries(responses || {}).map(([statusCode, r]: [string, any]) => ({ statusCode, description: r.description || "", content: this.parseContent(r.content), }));
  private parseContent = (content: any): any => { const jsonType = Object.keys(content || {}).find(mt => mt.includes("json")); return jsonType ? { [jsonType]: { schema: this.parseSchema(content[jsonType].schema) } } : undefined; };
  private parseSchema = (schema: any): Schema => schema ? { type: schema.type || "object", description: schema.description, format: schema.format, required: schema.required, enum: schema.enum, properties: this.parseProperties(schema.properties), items: schema.items ? this.parseSchema(schema.items) : undefined, } : { type: "any" };
  private parseProperties = (props: any): any => props ? Object.fromEntries(Object.entries(props).map(([name, schema]) => [name, this.parseSchema(schema)])) : {};
}

// Public action the client calls to start the parsing process
export const parseSpec = action({
  args: {
    content: v.any(),
    type: v.union(v.literal("openapi"), v.literal("swagger"), v.literal("graphql")),
    name: v.string(),
    version: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const specId = await ctx.runMutation(internal.specs.createPlaceholder, {
      name: args.name,
      type: args.type,
      version: args.version,
      content: args.content,
      userId: args.sessionId,
    });

    await ctx.scheduler.runAfter(0, internal.specs.performParsing, {
      specId,
      content: args.content,
    });

    return specId;
  },
});

// Internal action to do the heavy lifting of parsing
export const performParsing = internalAction({
  args: { specId: v.id("specs"), content: v.any() },
  handler: async (ctx, args) => {
    const parser = new SpecParser();
    try {
      const parsed = await parser.parse(args.content);
      await ctx.runMutation(internal.specs.updateWithParsedData, {
        specId: args.specId,
        parsed,
      });
    } catch (error: any) {
      console.error(`Failed to parse spec ${args.specId}:`, error);
      // Optionally, update the spec with an error state
    }
  },
});

// Internal mutation to create the initial spec document
export const createPlaceholder = internalMutation({
  args: {
    name: v.string(),
    version: v.string(),
    type: v.string(),
    content: v.any(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("specs", {
      name: args.name,
      version: args.version,
      type: args.type as any,
      content: args.content,
      userId: args.userId,
    });
  },
});

// Internal mutation to update the spec with the parsed data
export const updateWithParsedData = internalMutation({
  args: { specId: v.id("specs"), parsed: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.specId, { parsed: args.parsed });
  },
});

// Public query to get a spec by its ID
export const get = query({
  args: { id: v.optional(v.id("specs")) },
  handler: async (ctx, args) => {
    if (!args.id) return null;
    return await ctx.db.get(args.id);
  },
});

// Public mutation to save an API key
export const setApiKey = action({
    args: { id: v.id("specs"), apiKey: v.string() },
    handler: async (ctx, args) => {
        await ctx.runMutation(internal.specs.patchApiKey, {
            id: args.id,
            apiKey: args.apiKey,
        });
    },
});

export const patchApiKey = internalMutation({
    args: { id: v.id("specs"), apiKey: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { apiKey: args.apiKey });
    },
});