import { v } from "convex/values";
import { action, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Public action the client calls to start the parsing process
export const parseSpec = action({
  args: {
    content: v.any(),
    type: v.union(v.literal("openapi"), v.literal("swagger"), v.literal("graphql")),
    name: v.string(),
    version: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"specs">> => {
    const specId = await ctx.runMutation(internal.specs.createPlaceholder, {
      name: args.name,
      type: args.type,
      version: args.version,
      content: JSON.stringify(args.content),
      userId: args.sessionId,
    });

    await ctx.scheduler.runAfter(0, (internal as any).specs_node.performParsing, {
      specId,
      content: args.content,
    });

    return specId;
  },
});

// Internal mutation to create the initial spec document
export const createPlaceholder = internalMutation({
  args: {
    name: v.string(),
    version: v.string(),
    type: v.string(),
    content: v.string(),
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

// Internal mutations to store the parsed data chunks
export const updateSpecDetails = internalMutation({
  args: {
    specId: v.id("specs"),
    baseUrl: v.optional(v.string()),
    authMethods: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { specId, ...rest } = args;
    await ctx.db.patch(specId, rest);
  },
});

export const addEndpoint = internalMutation({
  args: { specId: v.id("specs"), endpointData: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("spec_endpoints", args);
  },
});

export const addModel = internalMutation({
  args: { specId: v.id("specs"), modelData: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("spec_models", args);
  },
});

// Public query to get a spec by its ID and reassemble it
export const get = query({
  args: { id: v.optional(v.id("specs")) },
  handler: async (ctx, args) => {
    if (!args.id) return null;
    const spec = await ctx.db.get(args.id);
    if (!spec) return null;

    // Fetch related endpoints and models
    const endpointDocs = await ctx.db
      .query("spec_endpoints")
      .withIndex("by_specId", (q) => q.eq("specId", args.id!))
      .collect();
    
    const modelDocs = await ctx.db
      .query("spec_models")
      .withIndex("by_specId", (q) => q.eq("specId", args.id!))
      .collect();

    // Assemble the final object for the client
    const result: any = { ...spec };

    try {
      result.content = JSON.parse(spec.content);
    } catch (e) {
      result.content = spec.content;
    }

    // Reconstruct the 'parsed' field
    result.parsed = {
      baseUrl: spec.baseUrl || "",
      authMethods: spec.authMethods ? JSON.parse(spec.authMethods) : [],
      endpoints: endpointDocs.map(doc => JSON.parse(doc.endpointData)),
      models: modelDocs.map(doc => JSON.parse(doc.modelData)),
    };

    return result;
  },
});

// Public action to save an API key
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