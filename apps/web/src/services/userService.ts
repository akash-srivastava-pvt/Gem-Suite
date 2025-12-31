import { User } from '@gem/shared';

// In dev, Vite proxies /api to localhost:3001. In prod, it's relative.
const API_BASE = '/api/users';

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },

  create: async (name: string): Promise<void> => {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to create user');
  }
};