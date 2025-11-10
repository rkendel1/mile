import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const create = internalMutation({
  args: {
    sessionId: v.string(),
    specId: v.id("specs"),
    description: v.string(),
    plan: v.string(), // JSON string of GoalPlan
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("goals", {
      ...args,
      status: "pending",
    });
  },
});

export const get = query({
    args: { id: v.optional(v.id("goals")) },
    handler: async (ctx, args) => {
        if (!args.id) return null;
        const goal = await ctx.db.get(args.id);
        if (!goal) return null;

        try {
            const result = { ...goal, plan: JSON.parse(goal.plan) };
            return result;
        } catch (e) {
            console.error("Failed to parse goal plan:", e);
            return null;
        }
    }
});