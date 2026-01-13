// In dev, Vite proxies /api to localhost:3001. In prod, it's relative.
const API_BASE = '/api/v1/activate';

export const activateService = {
  get: async (): Promise<boolean> => {
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error('Network response was not ok');
    const res = await response.json();
    return res.success;
  },

  create: async (key: string): Promise<boolean> => {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    });
    if (!response.ok) throw new Error('Failed to activate user');
    const res = await response.json();
    return res.success;
  }
};