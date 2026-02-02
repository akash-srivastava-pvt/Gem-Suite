const API_BASE = '/api/v1/ai';

interface AiProxyRequest {
  appId: string;
  modality: 'text' | 'image';
  payload: any;
  model?: string;
}

interface AiProxyResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const aiProxyService = {
  execute: async (request: AiProxyRequest): Promise<AiProxyResponse> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch(`${API_BASE}/proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const result = await response.json();
      
      if (response.status === 429) {
        throw new Error("API quota exceeded. Please try again later or update your API plan.");
      }
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return result;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      
      console.error('[AI_PROXY_SERVICE]', error);
      throw error;
    }
  }
};