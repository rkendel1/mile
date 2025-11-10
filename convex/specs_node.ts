"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import * as SwaggerParser from "swagger-parser";
import { ParsedSpec, Endpoint, Model, AuthMethod, Parameter, RequestBody, Response, Schema } from "../types";

// Helper class for parsing, moved to its own Node.js environment file
class SpecParser {
  async parse(content: any): Promise<ParsedSpec> {
    const api: any = await (SwaggerParser as any).validate(content, {
      dereference: { circular: "ignore" },
    });
    return {
      endpoints: this.parseEndpoints(api.paths),
      models: this.parseModels(api.components?.schemas),
      authMethods: this.parseAuthMethods(api.components?.securitySchemes),
      baseUrl: api.servers?.[0]?.url || "",
    };
  }
  private parseEndpoints = (paths: any): Endpoint[] => Object.entries(paths || {}).flatMap(([path, pathItem]) => Object.entries(pathItem as object).map(([method, op]: [string, any]) => ({ id: op.operationId || `${method}-${path}`.replace(/[^a-zA-Z0-G]/g, "-"), path, method: method.toUpperCase(), summary: op.summary, description: op.description, parameters: this.parseParameters(op.parameters), requestBody: this.parseRequestBody(op.requestBody), responses: this.parseResponses(op.responses), tags: op.tags, })));
  private parseModels = (schemas: any): Model[] => Object.entries(schemas || {}).map(([name, schema]: [string, any]) => ({ name, description: schema.description, properties: this.parseProperties(schema.properties), required: schema.required || [], }));
  private parseAuthMethods = (schemes: any): AuthMethod[] => Object.entries(schemes || {}).map(([name, s]: [string, any]) => ({ type: s.type === "http" ? (s.scheme === "bearer" ? "bearer" : "basic") : s.type, name: s.name || name, in: s.in, }));
  private parseParameters = (params: any[] = []): Parameter[] => params.map(p => ({ name: p.name, in: p.in, description: p.description, required: p.required || false, schema: this.parseSchema(p.schema), }));
  private parseRequestBody = (body: any): RequestBody | undefined => body ? { description: body.description, required: body.required || false, content: this.parseContent(body.content), } : undefined;
  private parseResponses = (responses: any): Response[] => Object.entries(responses || {}).map(([statusCode, r]: [string, any]) => ({ statusCode, description: r.description || "", content: this.parseContent(r.content), }));
  private parseContent = (content: any): any => { const jsonType = Object.keys(content || {}).find(mt => mt.includes("json")); return jsonType ? { [jsonType]: { schema: this.parseSchema(content[jsonType].schema) } } : undefined; };
  private parseSchema = (schema: any): Schema => schema ? { type: schema.type || "object", description: schema.description, format: schema.format, required: schema.required, enum: schema.enum, properties: this.parseProperties(schema.properties), items: schema.items ? this.parseSchema(schema.items) : undefined, } : { type: "any" };
  private parseProperties = (props: any): any => props ? Object.fromEntries(Object.entries(props).map(([name, schema]) => [name, this.parseSchema(schema)])) : {};
}

// Internal action to do the heavy lifting of parsing in a Node.js environment
export const performParsing = internalAction({
  args: { specId: v.id("specs"), content: v.any() },
  handler: async (ctx, args) => {
    const parser = new SpecParser();
    try {
      const parsed = await parser.parse(args.content);
      
      // Store baseUrl and authMethods on the main spec doc
      await ctx.runMutation(internal.specs.updateSpecDetails, {
        specId: args.specId,
        baseUrl: parsed.baseUrl,
        authMethods: JSON.stringify(parsed.authMethods),
      });

      // Store each endpoint and model in its own document
      for (const endpoint of parsed.endpoints) {
        await ctx.runMutation(internal.specs.addEndpoint, {
          specId: args.specId,
          endpointData: JSON.stringify(endpoint),
        });
      }
      for (const model of parsed.models) {
        await ctx.runMutation(internal.specs.addModel, {
          specId: args.specId,
          modelData: JSON.stringify(model),
        });
      }
    } catch (error: any) {
      console.error(`Failed to parse spec ${args.specId}:`, error);
      // Optionally, update the spec with an error state
    }
  },
});