import { GetSpecResponse, ParseSpecResponse, APISpec } from '@/types';

// MOCK API SERVICE - Replace with Convex integration
// This service simulates the backend responses to allow the UI to function.

export const apiService = {
  async parseSpec(content: any, type: string, name: string, version: string): Promise<ParseSpecResponse> {
    console.log('Mock parseSpec called with:', { name, type });
    return {
      success: true,
      spec: {
        id: `spec-${Date.now()}`,
        name: name || 'Mock API',
        version: '1.0.0',
        type,
        endpoints: 10,
        models: 5,
        authMethods: 1,
      },
    };
  },

  async parseSpecFromUrl(url: string, type: string): Promise<ParseSpecResponse> {
    console.log('Mock parseSpecFromUrl called with:', { url, type });
    return this.parseSpec({}, type, `Spec from ${url}`, '1.0.0');
  },

  async getSpec(id: string): Promise<GetSpecResponse> {
    console.log('Mock getSpec called with id:', id);
    const mockSpec: APISpec = {
      id,
      name: 'Mock E-Commerce API',
      version: '1.0.0',
      type: 'openapi',
      content: {},
      createdAt: new Date().toISOString(),
      suggestedFlows: [
        "Create a dashboard showing sales metrics",
        "Build a product catalog with search",
        "Show an orders table with status filters"
      ],
      parsed: {
        endpoints: [
          { id: 'get-products', path: '/products', method: 'GET', summary: 'List all products', parameters: [], responses: [] },
          { id: 'post-products', path: '/products', method: 'POST', summary: 'Create a new product', parameters: [], responses: [] },
          { id: 'get-orders', path: '/orders', method: 'GET', summary: 'List all orders', parameters: [], responses: [] },
        ],
        models: [
          { name: 'Product', properties: { id: { type: 'string' }, name: { type: 'string' }, price: { type: 'number' } } },
          { name: 'Order', properties: { id: { type: 'string' }, total: { type: 'number' }, status: { type: 'string' } } },
        ],
        authMethods: [{ type: 'bearer' }],
        baseUrl: 'https://api.example.com/v1',
      },
    };
    return { spec: mockSpec };
  },

  async setApiKey(id: string, apiKey: string): Promise<{ success: boolean }> {
    console.log(`Mock setApiKey called for spec ${id}`);
    return { success: true };
  },

  async sendMessage(message: string, context: any, sessionId: string) {
    console.log('Mock sendMessage called with:', { message, context, sessionId });
    return {
      response: `I have received your message: "${message}". As a mock service, I'll suggest moving to the next tab.`,
      context: { ...context, activeTab: 'goal' },
      actions: [{ type: 'suggest-next-tab', tab: 'goal' }],
    };
  },
};