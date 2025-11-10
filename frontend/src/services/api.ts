const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const apiService = {
  // Spec endpoints
  async parseSpec(content: any, type: string, name: string, version: string) {
    const response = await fetch(`${API_BASE_URL}/spec/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, type, name, version }),
    });
    return response.json();
  },

  async getSpec(id: string) {
    const response = await fetch(`${API_BASE_URL}/spec/${id}`);
    return response.json();
  },

  async listSpecs() {
    const response = await fetch(`${API_BASE_URL}/spec`);
    return response.json();
  },

  async getApiClient(id: string) {
    const response = await fetch(`${API_BASE_URL}/spec/${id}/client`);
    return response.json();
  },

  // Chat endpoints
  async sendMessage(message: string, context: any, sessionId: string) {
    const response = await fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context, sessionId }),
    });
    return response.json();
  },

  async getChatHistory(sessionId: string) {
    const response = await fetch(`${API_BASE_URL}/chat/history/${sessionId}`);
    return response.json();
  },

  async getSystemMessage(context: any) {
    const response = await fetch(`${API_BASE_URL}/chat/system-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context }),
    });
    return response.json();
  },

  // Component endpoints
  async generateComponent(data: any) {
    const response = await fetch(`${API_BASE_URL}/component/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getComponent(id: string) {
    const response = await fetch(`${API_BASE_URL}/component/${id}`);
    return response.json();
  },

  async updateComponent(id: string, updates: any) {
    const response = await fetch(`${API_BASE_URL}/component/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  async exportComponent(id: string, format: string) {
    const response = await fetch(`${API_BASE_URL}/component/${id}/export?format=${format}`);
    return response.json();
  },
};
