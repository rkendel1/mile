import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  specs: defineTable({
    name: v.string(),
    version: v.string(),
    type: v.union(
      v.literal("openapi"),
      v.literal("swagger"),
      v.literal("graphql")
    ),
    content: v.string(), // Store raw spec as a string
    authMethods: v.optional(v.string()), // Store as JSON string
    baseUrl: v.optional(v.string()),
    suggestedFlows: v.optional(v.array(v.string())),
    apiKey: v.optional(v.string()),
    userId: v.string(), // To associate specs with a user session
  }).index("by_userId", ["userId"]),

  spec_endpoints: defineTable({
    specId: v.id("specs"),
    endpointData: v.string(), // JSON string of a single Endpoint object
  }).index("by_specId", ["specId"]),

  spec_models: defineTable({
    specId: v.id("specs"),
    modelData: v.string(), // JSON string of a single Model object
  }).index("by_specId", ["specId"]),
});