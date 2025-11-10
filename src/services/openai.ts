import OpenAI from 'openai';
import { ChatContext, ContextState, ParsedSpec } from '../types';
import { EmbedContext } from '../types/contexts';

/**
 * OpenAI-powered LLM Service for Conversational AI
 * Provides context-aware responses for building API experiences
 */
export class OpenAIService {
  private openai: OpenAI | null = null;
  private enabled: boolean = false;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.enabled = true;
    } else {
      console.warn('OpenAI API key not found. LLM features will use fallback responses.');
    }
  }

  /**
   * Generate a conversational response based on user message and context
   */
  async generateResponse(
    message: string,
    context: ChatContext,
    state: ContextState,
    embedContext?: EmbedContext
  ): Promise<{ response: string; actions?: any[] }> {
    if (!this.enabled || !this.openai) {
      return this.getFallbackResponse(message, context, state);
    }

    try {
      const systemPrompt = this.buildSystemPrompt(context, state, embedContext);
      const conversationHistory = this.buildConversationHistory(state);

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.';
      const actions = this.extractActions(response, context);

      return { response, actions };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getFallbackResponse(message, context, state);
    }
  }

  /**
   * Analyze a parsed API spec and suggest potential application flows.
   */
  async analyzeSpecAndSuggestFlows(parsedSpec: ParsedSpec): Promise<string[]> {
    if (!this.enabled || !this.openai) {
      return this.getFallbackFlows(parsedSpec);
    }

    try {
      const endpointSummary = parsedSpec.endpoints
        .map(e => `${e.method} ${e.path} - ${e.summary || 'No summary'}`)
        .slice(0, 20) // Limit for prompt size
        .join('\n');

      const modelSummary = parsedSpec.models
        .map(m => m.name)
        .slice(0, 20)
        .join(', ');

      const prompt = `Given the following API specification summary, suggest 3-5 high-level application flows or features that a developer could build.

Endpoints:
${endpointSummary}

Models:
${modelSummary}

Based on this API, what are some useful UI flows or components to build?
Examples: "A dashboard to view sales metrics", "A user profile page with an order history", "A product catalog with search and filtering".

Respond ONLY with a valid JSON array of strings, where each string is a suggested flow. For example: ["flow 1", "flow 2"].
Do not include any other text, markdown, or explanation.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are an expert API analyst. Your task is to suggest application ideas based on an API spec and return them as a JSON array.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 500,
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        return this.getFallbackFlows(parsedSpec);
      }

      try {
        const suggestions = JSON.parse(responseContent);
        if (Array.isArray(suggestions) && suggestions.every(s => typeof s === 'string')) {
          return suggestions;
        }
      } catch (e) {
        console.error("Failed to parse AI suggestions as JSON array:", e);
      }

      return this.getFallbackFlows(parsedSpec);

    } catch (error) {
      console.error('OpenAI API error during flow suggestion:', error);
      return this.getFallbackFlows(parsedSpec);
    }
  }

  private getFallbackFlows(parsedSpec: ParsedSpec): string[] {
    const flows = new Set<string>();
    const keywords = {
      'dashboard': ['metric', 'analytic', 'summary', 'report'],
      'catalog': ['product', 'item', 'listing'],
      'management': ['user', 'order', 'customer', 'account'],
      'form': ['create', 'new', 'add'],
    };

    const allPaths = parsedSpec.endpoints.map(e => e.path).join(' ').toLowerCase();

    if (keywords.dashboard.some(k => allPaths.includes(k))) {
      flows.add('Create a dashboard to view key metrics');
    }
    if (keywords.catalog.some(k => allPaths.includes(k))) {
      flows.add('Build a product catalog with search and filtering');
    }
    if (keywords.management.some(k => allPaths.includes(k))) {
      const resource = keywords.management.find(k => allPaths.includes(k)) || 'item';
      flows.add(`Build a ${resource} management interface`);
    }
    if (parsedSpec.endpoints.some(e => e.method === 'POST')) {
        flows.add(`Create a form to add a new resource`);
    }

    if (flows.size === 0 && parsedSpec.endpoints.length > 0) {
      return ['Build a UI to interact with the API endpoints.'];
    }

    return Array.from(flows);
  }

  /**
   * Build system prompt based on current context and state
   */
  private buildSystemPrompt(
    context: ChatContext,
    state: ContextState,
    embedContext?: EmbedContext
  ): string {
    let prompt = `You are Mile AI, an expert assistant that helps developers transform API specifications into production-ready UI components.

Your capabilities:
- Parse and understand OpenAPI/Swagger specifications
- Generate execution plans for UI components
- Create React components with proper bindings
- Provide context-aware guidance based on the current workflow stage

Current Context:
- Active Tab: ${context.activeTab}
- Specs Loaded: ${Object.keys(state.specs).length}
- Goals Defined: ${Object.keys(state.goals).length}
- Components Generated: ${Object.keys(state.components).length}
`;

    // Add tab-specific guidance
    switch (context.activeTab) {
      case 'spec':
        prompt += `\nYou are in the Spec tab. Help users import and understand their API specifications.`;
        if (context.specId && state.specs[context.specId]) {
          const spec = state.specs[context.specId];
          prompt += `\nCurrent API: ${spec.name} with ${spec.parsed.endpoints.length} endpoints.`;
        }
        break;
      case 'goal':
        prompt += `\nYou are in the Goal tab. Help users define what they want to build with natural language.`;
        if (context.specId && state.specs[context.specId]) {
          const spec = state.specs[context.specId];
          prompt += `\nAvailable endpoints: ${spec.parsed.endpoints.map(e => `${e.method} ${e.path}`).slice(0, 5).join(', ')}`;
        }
        break;
      case 'test':
        prompt += `\nYou are in the Test tab. Guide users through testing API endpoints.`;
        break;
      case 'component':
        prompt += `\nYou are in the Component tab. Help users generate and customize UI components.`;
        break;
      case 'edit':
        prompt += `\nYou are in the Edit tab. Assist with iterations, refinements, and exports.`;
        break;
    }

    // Add embed context information if available
    if (embedContext) {
      prompt += `\n\nEmbed Context Configuration:`;
      if (embedContext.tenant) {
        prompt += `\n- Tenant: ${embedContext.tenant.name} (ID: ${embedContext.tenant.id})`;
      }
      if (embedContext.user) {
        prompt += `\n- User: ${embedContext.user.name || embedContext.user.email} (Role: ${embedContext.user.role})`;
      }
      if (embedContext.environment) {
        prompt += `\n- Environment: ${embedContext.environment.mode} on ${embedContext.environment.platform}`;
      }
      if (embedContext.permissions) {
        prompt += `\n- Subscription Tier: ${embedContext.permissions.subscriptionTier || 'standard'}`;
      }
    }

    prompt += `\n\nRespond conversationally and helpfully. Suggest next steps when appropriate.`;

    return prompt;
  }

  /**
   * Build conversation history from chat state
   */
  private buildConversationHistory(state: ContextState): Array<{ role: 'user' | 'assistant'; content: string }> {
    return state.chatHistory
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .slice(-10) // Last 10 messages for context
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));
  }

  /**
   * Extract actionable items from AI response
   */
  private extractActions(response: string, context: ChatContext): any[] {
    const actions: any[] = [];

    // Simple keyword-based action extraction
    if (response.toLowerCase().includes('upload') || response.toLowerCase().includes('import')) {
      actions.push({ type: 'request-file-upload' });
    }
    if (response.toLowerCase().includes('generate component')) {
      actions.push({ type: 'generate-component', goalId: context.goalId });
    }
    if (response.toLowerCase().includes('run test')) {
      actions.push({ type: 'execute-tests', goalId: context.goalId });
    }
    if (response.toLowerCase().includes('switch to') || response.toLowerCase().includes('go to')) {
      const tabMatch = response.match(/(?:switch to|go to)\s+(spec|goal|test|component|edit)/i);
      if (tabMatch) {
        actions.push({ type: 'suggest-next-tab', tab: tabMatch[1].toLowerCase() });
      }
    }

    return actions;
  }

  /**
   * Fallback response when OpenAI is not available
   */
  private getFallbackResponse(
    message: string,
    context: ChatContext,
    state: ContextState
  ): { response: string; actions?: any[] } {
    const lowerMessage = message.toLowerCase();

    // Use simple keyword matching as fallback
    if (context.activeTab === 'spec') {
      if (lowerMessage.includes('upload') || lowerMessage.includes('import')) {
        return {
          response: "Please upload your API specification file (OpenAPI/Swagger JSON or YAML) using the file upload button in the Spec tab.",
          actions: [{ type: 'request-file-upload' }],
        };
      }
      return {
        response: "I can help you import and analyze your API specification. Upload an OpenAPI or Swagger file to get started.",
      };
    }

    if (context.activeTab === 'goal') {
      if (lowerMessage.includes('dashboard')) {
        return {
          response: "I'll help you create a dashboard. Which endpoints should I use for the data? You can describe the metrics or data you want to display.",
        };
      }
      return {
        response: "Describe what you want to build in natural language. For example: 'Create a dashboard showing user metrics' or 'Build a form to create new orders'.",
      };
    }

    if (context.activeTab === 'test') {
      return {
        response: "I can execute live API calls to test your endpoints. Would you like me to run tests on the endpoints from your goal?",
        actions: [{ type: 'execute-tests', goalId: context.goalId }],
      };
    }

    if (context.activeTab === 'component') {
      return {
        response: "I can generate a React component for you. The component will include pre-wired API bindings, state management, and error handling. Ready to generate?",
        actions: [{ type: 'generate-component', goalId: context.goalId }],
      };
    }

    return {
      response: "I'm here to help you transform your API specs into working UI components. What would you like to do?",
    };
  }

  /**
   * Generate context-aware component code with OpenAI
   */
  async generateContextAwareComponent(
    componentName: string,
    goal: string,
    endpoints: string[],
    embedContext: EmbedContext
  ): Promise<string> {
    if (!this.enabled || !this.openai) {
      return this.generateBasicComponentCode(componentName, endpoints);
    }

    try {
      const prompt = `Generate a React component that:
- Component name: ${componentName}
- Purpose: ${goal}
- Uses these API endpoints: ${endpoints.join(', ')}
- Is context-aware with the following contexts:
  ${embedContext.tenant ? `- Tenant: ${embedContext.tenant.name}` : ''}
  ${embedContext.user ? `- User Role: ${embedContext.user.role}` : ''}
  ${embedContext.environment ? `- Environment: ${embedContext.environment.mode}` : ''}

Requirements:
- Use React hooks (useState, useEffect)
- Accept a 'context' prop with EmbedContext type
- Conditionally render based on user role and permissions
- Apply tenant branding (colors, theme)
- Handle loading and error states
- Include TypeScript types
- Use modern ES6+ syntax

Generate only the component code, no explanations.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are an expert React developer. Generate clean, production-ready component code.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      return completion.choices[0]?.message?.content || this.generateBasicComponentCode(componentName, endpoints);
    } catch (error) {
      console.error('OpenAI component generation error:', error);
      return this.generateBasicComponentCode(componentName, endpoints);
    }
  }

  /**
   * Basic component code as fallback
   */
  private generateBasicComponentCode(componentName: string, endpoints: string[]): string {
    const pascalName = componentName
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    return `import React, { useState, useEffect } from 'react';
import { EmbedContext } from './types/contexts';

interface ${pascalName}Props {
  context: EmbedContext;
  apiClient: any;
}

export const ${pascalName}: React.FC<${pascalName}Props> = ({ context, apiClient }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch data from endpoints: ${endpoints.join(', ')}
        const result = await apiClient.fetch();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiClient]);

  // Apply tenant branding
  const brandColor = context.tenant?.brand?.primaryColor || '#3b82f6';
  const theme = context.tenant?.brand?.theme || 'light';

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff' }}>
      <h2 style={{ color: brandColor }}>${componentName}</h2>
      {context.user && <p>Welcome, {context.user.name}!</p>}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default ${pascalName};`;
  }
}

export const openAIService = new OpenAIService();