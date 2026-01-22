const API_BASE = '/api/v1';

export const apiManagerService = {
  getApiKeys: async () => {
    const response = await fetch(`${API_BASE}/api-keys`);
    if (!response.ok) throw new Error('Failed to fetch API keys');
    return response.json();
  },

  createApiKey: async (data: any) => {
    const response = await fetch(`${API_BASE}/api-keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create API key');
    return response.json();
  },

  setDefault: async (id: number) => {
    const response = await fetch(`${API_BASE}/api-keys/${id}/default`, {
      method: 'PUT'
    });
    if (!response.ok) throw new Error('Failed to set default');
    return response.json();
  },

  toggleActive: async (id: number) => {
    const response = await fetch(`${API_BASE}/api-keys/${id}/toggle`, {
      method: 'PUT'
    });
    if (!response.ok) throw new Error('Failed to toggle status');
    return response.json();
  },

  updateModels: async (id: number, models: any) => {
    const response = await fetch(`${API_BASE}/api-keys/${id}/models`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(models)
    });
    if (!response.ok) throw new Error('Failed to update models');
    return response.json();
  },

  deleteApiKey: async (id: number) => {
    const response = await fetch(`${API_BASE}/api-keys/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete API key');
    return response.json();
  },

  getProviders: async () => {
    const response = await fetch(`${API_BASE}/api-keys/providers`);
    if (!response.ok) throw new Error('Failed to fetch providers');
    return response.json();
  }
};