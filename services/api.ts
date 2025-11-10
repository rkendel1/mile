import { GetSpecResponse, ParseSpecResponse, APISpec } from '@/types';
import { specParserService } from './specParser';

// In-memory store to simulate a database for the user's session
const mockDb: { [id: string]: APISpec } = {};

export const apiService = {
  async parseSpec(content: any, type: 'openapi' | 'swagger', name: string, version: string): Promise<ParseSpecResponse> {
    try {
      console.log(`Parsing spec: ${name}`);
      const parsedSpec = await specParserService.parse(content);
      
      const newSpec: APISpec = {
        id: `spec-${Date.now()}`,
        name: name || content.info?.title || 'Untitled API',
        version: version || content.info?.version || '1.0.0',
        type,
        content,
        parsed: parsedSpec,
        createdAt: new Date().toISOString(),
        // In a real scenario, AI suggestions would be generated here
        suggestedFlows: [
          "Build a table to list all items",
          "Create a form to add a new item",
          "Show a detailed view for a single item"
        ],
      };

      // Store the fully parsed spec in our mock DB
      mockDb[newSpec.id] = newSpec;

      console.log(`Successfully parsed and stored spec ID: ${newSpec.id}`);
      return {
        success: true,
        spec: {
          id: newSpec.id,
          name: newSpec.name,
          version: newSpec.version,
          type: newSpec.type,
          endpoints: newSpec.parsed.endpoints.length,
          models: newSpec.parsed.models.length,
          authMethods: newSpec.parsed.authMethods.length,
        },
      };
    } catch (error: any) {
      console.error('Error in apiService.parseSpec:', error);
      return { success: false, error: error.message };
    }
  },

  async parseSpecFromUrl(url: string, type: 'openapi' | 'swagger'): Promise<ParseSpecResponse> {
    try {
      // In a real app, you'd fetch the URL content here.
      // For the mock, we'll pass the URL to the parser which can handle it.
      console.log(`Parsing spec from URL: ${url}`);
      const content = url; // swagger-parser can take a URL directly
      return this.parseSpec(content, type, `Spec from URL`, '1.0.0');
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getSpec(id: string): Promise<GetSpecResponse> {
    console.log(`Retrieving spec for ID: ${id}`);
    const spec = mockDb[id];

    if (spec) {
      return { spec };
    } else {
      // This should not happen in a normal flow, but is a safeguard.
      console.error(`Spec with ID ${id} not found in mock DB.`);
      throw new Error(`API Specification with ID ${id} not found.`);
    }
  },

  async setApiKey(id: string, apiKey: string): Promise<{ success: boolean }> {
    if (mockDb[id]) {
      mockDb[id].apiKey = apiKey;
      console.log(`API Key set for spec ${id}`);
      return { success: true };
    }
    return { success: false };
  },

  async sendMessage(message: string, context: any, sessionId: string) {
    console.log('Mock sendMessage called with:', { message, context, sessionId });
    // This part remains a mock for now, to be replaced by Convex/AI logic
    return {
      response: `I have received your message: "${message}". Based on the loaded spec, I suggest we move to the 'Goal' tab to define what to build.`,
      context: { ...context, activeTab: 'goal' },
      actions: [{ type: 'suggest-next-tab', tab: 'goal' }],
    };
  },
};