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
    // We use v.any() for complex, nested objects that don't need to be indexed
    content: v.any(),
    parsed: v.optional(v.any()),
    suggestedFlows: v.optional(v.array(v.string())),
    apiKey: v.optional(v.string()),
    userId: v.string(), // To associate specs with a user session
  }).index("by_userId", ["userId"]),
});