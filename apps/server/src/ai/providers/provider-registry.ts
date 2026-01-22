import { AI_PROVIDERS } from '@gem/shared';
import { ProviderAdapter } from './provider-adapter.interface.js';
import { GeminiAdapter } from './gemini.adapter.js';

const adapters: Record<string, ProviderAdapter> = {
  gemini: new GeminiAdapter()
};

export class ProviderRegistry {
  static getAdapter(providerId: string): ProviderAdapter {
    const adapter = adapters[providerId];
    if (!adapter) {
      throw new Error(`Provider ${providerId} not supported`);
    }
    return adapter;
  }

  static getProviderConfig(providerId: string) {
    return AI_PROVIDERS.find(p => p.providerId === providerId);
  }

  static getTierConfig(providerId: string, tierId: string) {
    const provider = this.getProviderConfig(providerId);
    return provider?.tiers.find(t => t.tierId === tierId);
  }

  static getModelConfig(providerId: string, tierId: string, modelId: string) {
    const tier = this.getTierConfig(providerId, tierId);
    return tier?.models.find(m => m.modelId === modelId);
  }
}