import { describe, it, expect } from 'vitest';

describe('proxy.config', () => {
  it('getProxyConfig and listAvailableModels behave', async () => {
    const mod = await import('../../../../apps/server/src/proxies/proxy.config.ts');
    const { getProxyConfig, listAvailableModels } = mod;

    const cfg = getProxyConfig('gemini-2.0-flash');
    expect(cfg).toBeTruthy();
    expect(cfg?.provider).toBe('gemini');

    const textModels = listAvailableModels('gemini', 'text');
    expect(textModels.length).toBeGreaterThan(0);
  });
});