import { describe, it, expect } from 'vitest';

describe('AgentRegistry', () => {
  it('should register, get, list and unregister agents', async () => {
    const mod = await import('../../../../apps/server/src/orchestration/agentRegistry.ts');
    const { agentRegistry } = mod;

    // reset registry by unregistering possible leftovers
    try { agentRegistry.unregister('test:1'); } catch {}

    const agent = { id: 'test:1', name: 'Test Agent' } as any;
    agentRegistry.register(agent);

    expect(agentRegistry.has('test:1')).toBe(true);
    expect(agentRegistry.get('test:1')!.name).toBe('Test Agent');

    const list = agentRegistry.list();
    expect(list.some(a => a.id === 'test:1')).toBe(true);

    expect(agentRegistry.listByPrefix('test').length).toBeGreaterThan(0);

    const removed = agentRegistry.unregister('test:1');
    expect(removed).toBe(true);
    expect(agentRegistry.get('test:1')).toBeUndefined();
  });

  it('should throw when registering duplicate agent', async () => {
    const mod = await import('../../../../apps/server/src/orchestration/agentRegistry.ts');
    const { agentRegistry } = mod;

    const agent = { id: 'dup:1' } as any;
    agentRegistry.unregister('dup:1');
    agentRegistry.register(agent);
    expect(() => agentRegistry.register(agent)).toThrow(/already registered/);
    agentRegistry.unregister('dup:1');
  });
});