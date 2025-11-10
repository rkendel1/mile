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
    parsed: v.optional(v.string()), // Store parsed spec as a JSON string
    suggestedFlows: v.optional(v.array(v.string())),
    apiKey: v.optional(v.string()),
    userId: v.string(), // To associate specs with a user session
  }).index("by_userId", ["userId"]),
});