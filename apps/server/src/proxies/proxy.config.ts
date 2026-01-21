export interface ProxyConfig {
  provider: 'gemini' | 'openai';
  model: string;
  modality: 'text' | 'image';
  baseUrl: string;
  endpoint: string;
  timeout: number;
  maxRetries: number;
}

export const PROXY_CONFIGS: Record<string, ProxyConfig> = {
  // Gemini Text Models
  'gemini-2.0-flash': {
    provider: 'gemini',
    model: 'gemini-2.0-flash',
    modality: 'text',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    endpoint: '/models/{model}:generateContent',
    timeout: 30000,
    maxRetries: 2
  },
  'gemini-3-flash-preview': {
    provider: 'gemini',
    model: 'gemini-3-flash-preview',
    modality: 'text',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    endpoint: '/models/{model}:generateContent',
    timeout: 45000,
    maxRetries: 2
  },
  'gemini-2.5-flash': {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    modality: 'text',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    endpoint: '/models/{model}:generateContent',
    timeout: 45000,
    maxRetries: 2
  },

  // Gemini Image Models
  'gemini-3-flash-image': {
    provider: 'gemini',
    model: 'gemini-3-flash-image',
    modality: 'image',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    endpoint: '/models/{model}:generateContent',
    timeout: 60000,
    maxRetries: 2
  },
  'gemini-2.5-flash-image': {
    provider: 'gemini',
    model: 'gemini-2.5-flash-image',
    modality: 'image',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    endpoint: '/models/{model}:generateContent',
    timeout: 60000,
    maxRetries: 2
  }
};

export function getProxyConfig(modelId: string): ProxyConfig | null {
  return PROXY_CONFIGS[modelId] || null;
}

export function listAvailableModels(provider?: string, modality?: string): string[] {
  return Object.keys(PROXY_CONFIGS).filter(modelId => {
    const config = PROXY_CONFIGS[modelId];
    if (provider && config.provider !== provider) return false;
    if (modality && config.modality !== modality) return false;
    return true;
  });
}