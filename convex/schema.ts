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

  goals: defineTable({
    sessionId: v.string(),
    specId: v.id("specs"),
    description: v.string(),
    plan: v.string(), // JSON string of GoalPlan
    status: v.union(
      v.literal("pending"),
      v.literal("in-progress"),
      v.literal("completed")
    ),
  }).index("by_sessionId", ["sessionId"]),

  tests: defineTable({
    goalId: v.id("goals"),
    testData: v.string(), // JSON string of a single TestResult
  }).index("by_goalId", ["goalId"]),

  components: defineTable({
    goalId: v.id("goals"),
    name: v.string(),
    code: v.string(),
    framework: v.union(v.literal("react"), v.literal("vue"), v.literal("angular")),
    preview: v.optional(v.string()),
    bindings: v.string(), // JSON string of DataBinding[]
    functions: v.string(), // JSON string of FunctionBinding[]
  }).index("by_goalId", ["goalId"]),

  chatMessages: defineTable({
    sessionId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    timestamp: v.string(),
  }).index("by_sessionId", ["sessionId"]),
});