import { Goal, GoalPlan, UIStructure, FunctionBinding, DataFlow } from '../types';

export class GoalPlannerService {
  generatePlan(description: string, endpoints: any[]): GoalPlan {
    // AI-like logic to generate a plan based on user's goal description
    // In production, this would use LLM API
    
    const plan: GoalPlan = {
      endpoints: [],
      dataFlow: [],
      uiStructure: {
        type: 'custom',
        components: [],
      },
      functions: [],
    };

    // Analyze description for intent
    const lowerDesc = description.toLowerCase();

    // Determine UI type
    if (lowerDesc.includes('dashboard') || lowerDesc.includes('metrics')) {
      plan.uiStructure.type = 'dashboard';
    } else if (lowerDesc.includes('form') || lowerDesc.includes('create') || lowerDesc.includes('update')) {
      plan.uiStructure.type = 'form';
    } else if (lowerDesc.includes('table') || lowerDesc.includes('list')) {
      plan.uiStructure.type = 'table';
    } else if (lowerDesc.includes('chart') || lowerDesc.includes('graph')) {
      plan.uiStructure.type = 'chart';
    }

    // Match relevant endpoints
    plan.endpoints = this.matchEndpoints(description, endpoints);

    // Generate data flow
    plan.dataFlow = this.generateDataFlow(plan.endpoints, plan.uiStructure.type);

    // Generate function bindings
    plan.functions = this.generateFunctionBindings(plan.endpoints);

    // Generate UI components
    plan.uiStructure.components = this.generateUIComponents(plan.uiStructure.type, plan.endpoints);

    return plan;
  }

  private matchEndpoints(description: string, endpoints: any[]): string[] {
    const matched: string[] = [];
    const keywords = description.toLowerCase().split(' ');

    endpoints.forEach((endpoint) => {
      const endpointText = `${endpoint.path} ${endpoint.summary || ''} ${endpoint.description || ''}`.toLowerCase();
      
      // Check if endpoint is relevant to the description
      const relevanceScore = keywords.filter(keyword => 
        keyword.length > 3 && endpointText.includes(keyword)
      ).length;

      if (relevanceScore > 0) {
        matched.push(endpoint.id);
      }
    });

    return matched.slice(0, 5); // Limit to top 5 most relevant
  }

  private generateDataFlow(endpointIds: string[], uiType: string): DataFlow[] {
    const flows: DataFlow[] = [];
    
    endpointIds.forEach((endpointId, index) => {
      flows.push({
        source: endpointId,
        target: `ui-component-${index}`,
        transformation: 'map-to-props',
      });
    });

    return flows;
  }

  private generateFunctionBindings(endpointIds: string[]): FunctionBinding[] {
    return endpointIds.map((endpointId) => ({
      name: `fetch_${endpointId.replace(/-/g, '_')}`,
      endpoint: endpointId,
      parameters: {},
      onSuccess: 'updateUI',
      onError: 'showError',
    }));
  }

  private generateUIComponents(uiType: string, endpointIds: string[]): any[] {
    const components: any[] = [];

    switch (uiType) {
      case 'dashboard':
        components.push({
          id: 'dashboard-container',
          type: 'Container',
          props: { layout: 'grid', columns: 2 },
          bindings: [],
          children: endpointIds.map((id, idx) => ({
            id: `metric-card-${idx}`,
            type: 'MetricCard',
            props: { title: `Metric ${idx + 1}` },
            bindings: [{ source: id, target: 'data', transform: 'identity' }],
          })),
        });
        break;

      case 'form':
        components.push({
          id: 'form-container',
          type: 'Form',
          props: { method: 'POST' },
          bindings: endpointIds.map(id => ({ source: 'form-data', target: id, transform: 'serialize' })),
          children: [
            { id: 'submit-button', type: 'Button', props: { text: 'Submit' }, bindings: [] },
          ],
        });
        break;

      case 'table':
        components.push({
          id: 'data-table',
          type: 'Table',
          props: { sortable: true, filterable: true },
          bindings: endpointIds.map(id => ({ source: id, target: 'rows', transform: 'flatten' })),
        });
        break;

      case 'chart':
        components.push({
          id: 'chart-container',
          type: 'Chart',
          props: { type: 'line' },
          bindings: endpointIds.map(id => ({ source: id, target: 'data', transform: 'to-chart-data' })),
        });
        break;

      default:
        components.push({
          id: 'custom-container',
          type: 'Container',
          props: {},
          bindings: [],
        });
    }

    return components;
  }

  explainPlan(plan: GoalPlan): string {
    let explanation = `I'll create a ${plan.uiStructure.type} using ${plan.endpoints.length} API endpoint(s).\n\n`;
    
    explanation += `**Endpoints to use:**\n`;
    plan.endpoints.forEach((ep, idx) => {
      explanation += `${idx + 1}. ${ep}\n`;
    });

    explanation += `\n**Data Flow:**\n`;
    plan.dataFlow.forEach((flow, idx) => {
      explanation += `${idx + 1}. ${flow.source} → ${flow.target}\n`;
    });

    explanation += `\n**UI Structure:**\n`;
    explanation += `Type: ${plan.uiStructure.type}\n`;
    explanation += `Components: ${plan.uiStructure.components.length}\n`;

    return explanation;
  }
}

export const goalPlannerService = new GoalPlannerService();
