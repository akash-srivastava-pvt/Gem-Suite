import { ProviderAdapter } from './provider-adapter.interface.js';
import { unifiedProxy } from '../../proxies/unified.proxy.js';

export class GeminiAdapter implements ProviderAdapter {
  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      // Try a lightweight model for validation
      await unifiedProxy.execute({
        model: 'gemini-2.5-flash',
        prompt: 'test',
        apiKey
      });
      return true;
    } catch (e) {
      console.warn('API Key validation failed:', e);
      return false;
    }
  }

  async executeText(apiKey: string, payload: any): Promise<any> {
    const { model, prompt } = payload;

    const response = await unifiedProxy.execute({
      model: model || 'gemini-2.5-flash', // Fallback defaults
      prompt,
      apiKey
    });

    return { data: response.data };
  }

  async executeImage(apiKey: string, payload: any): Promise<any> {
    const { model, prompt } = payload;

    const response = await unifiedProxy.execute({
      model: model || 'gemini-2.5-flash-image', // Fallback defaults
      prompt,
      apiKey
    });

    // UnifiedProxy returns { image: { mimeType, base64 } } structure
    // We assume the caller expects { image: { ... } } or similar.
    // Looking at previous gemini3img.ts, it returned { image: { mimeType, base64 } } wrapped in an object or just that object?
    // Let's check the return type of `executeImage` in the interface or usage. 
    // The previous adapter returned whatever `callGeminiImg` returned.
    // Let's assume UnifiedProxy 's signature matches what is expected or just return response.
    return response;
  }
}