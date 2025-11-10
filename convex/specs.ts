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

// Internal mutation to update the spec with the parsed data
export const updateWithParsedData = internalMutation({
  args: { specId: v.id("specs"), parsed: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.specId, { parsed: args.parsed });
  },
});

// Public query to get a spec by its ID
export const get = query({
  args: { id: v.optional(v.id("specs")) },
  handler: async (ctx, args) => {
    if (!args.id) return null;
    const spec = await ctx.db.get(args.id);

    if (!spec) return null;

    // The document from Convex is read-only, so we create a new object
    // to hold the modified data.
    const result: any = { ...spec };

    // The raw spec content is also stored as a string, but the client
    // might expect an object if it was originally JSON.
    try {
      result.content = JSON.parse(spec.content);
    } catch (e) {
      // If it's not valid JSON (e.g., YAML string), leave it as is.
      result.content = spec.content;
    }

    if (spec.parsed) {
      try {
        result.parsed = JSON.parse(spec.parsed);
      } catch (e) {
        console.error("Failed to parse 'parsed' field from spec:", spec._id, e);
        // If parsing fails, remove the malformed field.
        delete result.parsed;
      }
    }

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