"use node";

import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { v } from "convex/values";
import OpenAI from "openai";
import { Id } from "./_generated/dataModel";
import { Endpoint } from "../types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PLAN_GOAL_FUNCTION = {
  name: "planGoal",
  description: "Parses a user's goal and the provided API spec to create a detailed execution plan for building a UI component.",
  parameters: {
    type: "object",
    properties: {
      description: {
        type: "string",
        description: "A concise summary of the user's goal.",
      },
      plan: {
        type: "object",
        description: "The detailed execution plan.",
        properties: {
          endpoints: { type: "array", items: { type: "string" }, description: "A list of API endpoint IDs (e.g., 'GET /users') needed to achieve the goal." },
          uiStructure: { type: "object", properties: { type: { type: "string", enum: ["table", "form", "chart", "dashboard"] } } },
        },
        required: ["endpoints", "uiStructure"],
      },
    },
    required: ["description", "plan"],
  },
};

export const sendMessage = action({
  args: {
    message: v.string(),
    sessionId: v.string(),
    context: v.object({
      activeTab: v.string(),
      specId: v.optional(v.id("specs")),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.chat.addMessage, {
      sessionId: args.sessionId,
      role: "user",
      content: args.message,
      timestamp: new Date().toISOString(),
    });

    if (!process.env.OPENAI_API_KEY) {
      const errorMsg = "OpenAI API key is not set. Please set the OPENAI_API_KEY environment variable.";
      await ctx.runMutation(internal.chat.addMessage, { sessionId: args.sessionId, role: "assistant", content: errorMsg, timestamp: new Date().toISOString() });
      return { error: errorMsg };
    }

    if (args.context.activeTab === 'goal' && args.context.specId) {
      const spec = await ctx.runQuery(api.specs.get, { id: args.context.specId });
      if (!spec || !spec.parsed) return { error: "Spec not found or not parsed." };

      const systemPrompt = `You are an expert AI assistant. Your task is to help a developer build a UI component based on an API specification. The user will describe their goal. You must create a plan by selecting the correct API endpoints from the spec provided.
      
      API Specification Summary:
      - Base URL: ${spec.parsed.baseUrl}
      - Endpoints: ${JSON.stringify(spec.parsed.endpoints.map((e: Endpoint) => ({ id: `${e.method} ${e.path}`, description: e.summary })), null, 2)}
      
      Based on the user's request, call the 'planGoal' function with the appropriate parameters.`;

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: args.message },
          ],
          tools: [{ type: "function", function: PLAN_GOAL_FUNCTION }],
          tool_choice: { type: "function", function: { name: "planGoal" } },
        });

        const toolCall = response.choices[0].message.tool_calls?.[0];
        if (toolCall?.type === "function" && toolCall.function.name === "planGoal") {
          const { description, plan } = JSON.parse(toolCall.function.arguments);
          
          const fullPlan = { ...plan, dataFlow: [], functions: [], uiStructure: { ...plan.uiStructure, components: [] } };

          const goalId = await ctx.runMutation(internal.goals.create, {
            sessionId: args.sessionId,
            specId: args.context.specId,
            description,
            plan: JSON.stringify(fullPlan),
          });

          const assistantMessage = `OK, I've created a plan to build that. I'll use the following endpoints: ${plan.endpoints.join(', ')}. You can review the full plan in the Goal tab. Ready to proceed to the Test tab?`;
          await ctx.runMutation(internal.chat.addMessage, { sessionId: args.sessionId, role: "assistant", content: assistantMessage, timestamp: new Date().toISOString() });
          
          return { newGoalId: goalId };
        }
      } catch (error: any) {
        console.error("OpenAI API error:", error.message);
        const errorMsg = "Sorry, I encountered an error while creating the plan. Please check the console for details.";
        await ctx.runMutation(internal.chat.addMessage, { sessionId: args.sessionId, role: "assistant", content: errorMsg, timestamp: new Date().toISOString() });
        return { error: error.message };
      }
    }

    const defaultResponse = "I can help with that. What would you like to do next?";
    await ctx.runMutation(internal.chat.addMessage, { sessionId: args.sessionId, role: "assistant", content: defaultResponse, timestamp: new Date().toISOString() });
    return {};
  },
});