import { db } from '@gem/db';
import { unifiedProxy } from '../proxies/unified.proxy.js';
import { listAvailableModels } from '../proxies/proxy.config.js';
import { decrypt } from '../utility/security.js';
import { saveService } from '../services/SaveService.js';

interface AiProxyRequest {
  appId: string;
  modality: 'text' | 'image';
  payload: {
    prompt: string;
    [key: string]: any;
  };
  model?: string;
  trackUsage?: boolean;
}

interface ApiKeyResult {
  apiKey: string;
  provider: string;
  tier: string;
  selectedTextModel?: string;
  selectedImageModel?: string;
}

class ApiKeyManager {
  static async getActiveApiKey(): Promise<ApiKeyResult | null> {
    const newKeys = db.query<{ encrypted_api_key: string, provider: string, tier: string, selected_text_model: string, selected_image_model: string }>(
      'SELECT encrypted_api_key, provider, tier, selected_text_model, selected_image_model FROM user_api_keys WHERE user_id = 1 AND is_active = 1 ORDER BY is_default DESC LIMIT 1'
    );

    if (newKeys.length === 0) {
      return null;
    }

    try {
      const decryptedKey = await decrypt(newKeys[0].encrypted_api_key);
      return {
        apiKey: decryptedKey,
        provider: newKeys[0].provider,
        tier: newKeys[0].tier,
        selectedTextModel: newKeys[0].selected_text_model,
        selectedImageModel: newKeys[0].selected_image_model
      };
    } catch (decryptError) {
      // Handle unencrypted keys from migration
      return {
        apiKey: newKeys[0].encrypted_api_key,
        provider: newKeys[0].provider,
        tier: newKeys[0].tier,
        selectedTextModel: newKeys[0].selected_text_model,
        selectedImageModel: newKeys[0].selected_image_model
      };
    }
  }

  static selectModel(keyResult: ApiKeyResult, modality: string, requestedModel?: string): string {
    // If specific model requested, validate and use it
    if (requestedModel) {
      const availableModels = listAvailableModels(keyResult.provider, modality);
      if (availableModels.includes(requestedModel)) {
        return requestedModel;
      }
    }

    // Use user's selected model from API Manager
    if (modality === 'text' && keyResult.selectedTextModel) {
      return keyResult.selectedTextModel;
    }
    if (modality === 'image' && keyResult.selectedImageModel) {
      return keyResult.selectedImageModel;
    }

    // Fallback to defaults only if no user selection
    const modelMap: Record<string, Record<string, Record<string, string>>> = {
      gemini: {
        free: {
          text: 'gemini-3-flash-preview',
          image: 'gemini-2.5-flash-image'
        },
        paid: {
          text: 'gemini-2.0-flash',
          image: 'gemini-3-flash-image'
        }
      }
    };

    return modelMap[keyResult.provider]?.[keyResult.tier]?.[modality] || 'gemini-3-flash-preview';
  }
}

export class AiProxyService {
  static async execute(request: AiProxyRequest): Promise<any> {
    const { appId, modality, payload, model: requestedModel, trackUsage = true } = request;

    // Get API key and provider info
    // Execute via unified proxy
    const keyResult = await ApiKeyManager.getActiveApiKey();
    if (!keyResult) {
      throw new Error('No API key configured. Please add an API key in Profile settings.');
    }

    const model = ApiKeyManager.selectModel(keyResult, modality, requestedModel);
    const start = Date.now();

    // Track the initial API hit
    if (trackUsage) {
      await saveService.trackUsage(appId, 'api_hit', { model, modality });
    }

    try {
      // Trim API key to remove any accidental whitespace from user input
      const trimmedApiKey = keyResult.apiKey.trim();
      
      if (!trimmedApiKey) {
        throw new Error('API key is empty after trimming. Please check your API key in Profile settings.');
      }

      const result = await unifiedProxy.execute({
        model,
        prompt: payload.prompt,
        apiKey: trimmedApiKey,
        options: {
          temperature: payload.temperature,
          maxTokens: payload.maxTokens
        }
      });

      // Track successful generation
      if (trackUsage) {
        await saveService.trackUsage(appId, 'generate', { model, duration: Date.now() - start });
      }

      return result;
    } catch (error: any) {
      console.error('AI Proxy Execution Failed:', error);
      const duration = Date.now() - start;

      // Track the error
      if (trackUsage) {
        await saveService.trackUsage(appId, 'api_error', {
          model,
          provider: keyResult.provider,
          duration,
          error: error.message
        });
      }

      throw error;
    }
  }

  static async listModels(): Promise<{ provider: string; models: string[] }[]> {
    const providers = ['gemini', 'openai'];
    return providers.map(provider => ({
      provider,
      models: listAvailableModels(provider)
    }));
  }
}