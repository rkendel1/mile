import { GoalPlan, APISpec } from '../types';
import { openAIService } from './openai';

export class GoalPlannerService {
  async generatePlan(description: string, spec: APISpec): Promise<GoalPlan> {
    // Use OpenAI to generate the plan
    try {
      const plan = await openAIService.generatePlanFromSpec(description, spec.parsed);
      return plan;
    } catch (error) {
      console.error("AI plan generation failed, falling back to basic plan.", error);
      return this.generateFallbackPlan(description, spec.parsed.endpoints);
    }
  }

  private generateFallbackPlan(description: string, endpoints: any[]): GoalPlan {
    // A very simple fallback if AI fails
    const relevantEndpoints = endpoints
      .filter(ep => {
        const epText = `${ep.path} ${ep.summary || ''}`.toLowerCase();
        return description.toLowerCase().split(' ').some(word => word.length > 3 && epText.includes(word));
      })
      .slice(0, 2);

    return {
      endpoints: relevantEndpoints.map(ep => ep.id),
      uiStructure: {
        type: 'custom',
        components: [{ id: 'main-component', type: 'div', props: {}, bindings: [] }],
      },
      functions: relevantEndpoints.map(ep => ({
        name: `fetch_${ep.id.replace(/-/g, '_')}`,
        endpoint: ep.id,
        parameters: {},
      })),
      dataFlow: relevantEndpoints.map(ep => ({
        source: ep.id,
        target: 'main-component',
      })),
    };
  }

  explainPlan(plan: GoalPlan, spec: APISpec): string {
    let explanation = `Okay, I've created a plan to build this for you. Here's how I'll do it:\n\n`;
    
    explanation += `**1. UI Structure:**\nI'll create a main component structured as a **${plan.uiStructure.type}**. It will contain ${plan.uiStructure.components.length} sub-component(s).\n\n`;

    explanation += `**2. API Endpoints:**\nTo get the data, I will use the following ${plan.endpoints.length} endpoint(s):\n`;
    plan.functions.forEach((fn) => {
      const endpoint = spec.parsed.endpoints.find(e => e.id === fn.endpoint);
      if (endpoint) {
        explanation += `   - \`${endpoint.method} ${endpoint.path}\` (for ${endpoint.summary || 'data retrieval'})\n`;
      }
    });

    explanation += `\nThis plan seems solid. Shall we proceed to the **Test** tab to validate these endpoints?`;

    return explanation;
  }
}

export const goalPlannerService = new GoalPlannerService();