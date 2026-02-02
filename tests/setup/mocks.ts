// Shared test mocks used across packages (exported helpers)
import { vi } from 'vitest';

export function mockFetchWith(status: number, body?: any) {
  return vi.stubGlobal('fetch', vi.fn(async () => ({ ok: status >= 200 && status < 300, status, json: async () => body })) as any);
}

export function restoreFetch() {
  try { vi.unstubAllGlobals(); } catch (e) {}
}

export const mockDbQuery = (rows: any[]) => ({
  query: vi.fn(() => rows)
});

export const mockDecrypt = (value: string) => vi.fn(async (v: string) => value);
