import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addMessage = internalMutation({
  args: {
    sessionId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    timestamp: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("chatMessages", args);
  },
});

export const getMessagesForSession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .order("asc")
      .collect();
    return messages.map(({ _id, _creationTime, ...rest }) => ({
      id: _id,
      ...rest,
    }));
  },
});