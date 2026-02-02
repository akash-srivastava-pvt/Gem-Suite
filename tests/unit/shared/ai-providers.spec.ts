import { describe, it, expect } from 'vitest';

describe('AI provider config', () => {
  it('should include gemini provider and models', async () => {
    const mod = await import('../../../../packages/shared/src/ai-provider.config.ts');
    const { AI_PROVIDERS } = mod;

    const gemini = AI_PROVIDERS.find(p => p.providerId === 'gemini');
    expect(gemini).toBeTruthy();
    expect(gemini!.tiers.length).toBeGreaterThan(0);

    const allModels = gemini!.tiers.flatMap(t => t.models.map(m => m.modelId));
    expect(allModels).toContain('gemini-2.0-flash');
  });
});