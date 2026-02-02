import { describe, it, expect, vi } from 'vitest';

describe('MCP resources', () => {
  it('ResumeTemplatesResource and TripHistoryResource return expected shapes', async () => {
    const mod = await import('../../../../apps/server/src/mcp/resources/index.ts');
    const { ResumeTemplatesResource, TripHistoryResource } = mod;

    const rt = await ResumeTemplatesResource.get();
    expect(rt.templates).toBeDefined();
    expect(Array.isArray(rt.templates)).toBe(true);

    const th = await TripHistoryResource.get();
    expect(th.popularRoutes).toBeDefined();
    expect(th.averageCosts.train).toBeGreaterThan(0);
  });

  it('UserResource calls db.query and returns null when empty', async () => {
    vi.resetModules();
    vi.doMock('@gem/db', () => ({ db: { query: () => [] } }));

    const mod = await import('../../../../apps/server/src/mcp/resources/index.ts');
    const { UserResource } = mod;

    const user = await UserResource.get();
    expect(user).toBeNull();
  });
});