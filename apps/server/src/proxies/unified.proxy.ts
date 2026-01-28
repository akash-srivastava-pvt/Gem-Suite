import { ProxyConfig, getProxyConfig } from './proxy.config.js';

export interface ProxyRequest {
  model: string;
  prompt: string;
  apiKey: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
    [key: string]: any;
  };
}

export interface ProxyResponse {
  data?: string;
  image?: {
    mimeType: string;
    base64: string;
  };
  error?: string;
}

class UnifiedProxy {
  async execute(request: ProxyRequest): Promise<ProxyResponse> {
    const config = getProxyConfig(request.model);
    if (!config) {
      throw new Error(`Unsupported model: ${request.model}`);
    }

    switch (config.provider) {
      case 'gemini':
        return this.executeGemini(request, config);
      case 'openai':
        return this.executeOpenAI(request, config);
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  }

  private async executeGemini(request: ProxyRequest, config: ProxyConfig): Promise<ProxyResponse> {
    // Properly URL-encode the API key to handle special characters
    const encodedApiKey = encodeURIComponent(request.apiKey);
    const url = `${config.baseUrl}${config.endpoint.replace('{model}', config.model)}?key=${encodedApiKey}`;

    // Log API key format for debugging (masked)
    const keyPrefix = request.apiKey.substring(0, 5);
    const keyLength = request.apiKey.length;
    console.log(`[UNIFIED_PROXY] Gemini Request - Model: ${config.model}, Modality: ${config.modality}, Key Length: ${keyLength}, Key Prefix: ${keyPrefix}...`);
    // Uncomment next line ONLY for debugging on user machine (logs full key!)
    // console.log(`[UNIFIED_PROXY] Gemini URL: ${url}`);

    const payload: any = {
      contents: [{
        role: 'user',
        parts: [{ text: request.prompt }]
      }],
      generationConfig: {
        temperature: request.options?.temperature || 0.4,
        maxOutputTokens: request.options?.maxTokens || 7200
      }
    };

    // Add image-specific config
    if (config.modality === 'image') {
      payload.generationConfig.responseModalities = ['IMAGE'];
    }

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const status = response.status;
          
          // Read and parse error response body for better debugging
          let errorDetails = '';
          try {
            const errorBody = await response.json();
            errorDetails = JSON.stringify(errorBody, null, 2);
            console.error(`[UNIFIED_PROXY] Gemini Error (${status}):`, errorDetails);
          } catch (e) {
            // Response body is not JSON, try to read as text
            try {
              errorDetails = await response.text();
              console.error(`[UNIFIED_PROXY] Gemini Error (${status}) - Text:`, errorDetails);
            } catch (e2) {
              console.error(`[UNIFIED_PROXY] Gemini Error (${status}) - Could not parse response body`);
            }
          }
          
          if (status === 401 || status === 403) {
            throw new Error('Invalid API key');
          }
          if (status === 400) {
            // 400 Bad Request - usually means malformed request or invalid API key format
            throw new Error(`Invalid request to Gemini API (400): Check API key format and request structure. Details: ${errorDetails}`);
          }
          if (status === 429) {
            if (attempt < config.maxRetries) {
              await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
              continue;
            }
            throw new Error('Quota exhausted (429). Please check your API limits.');
          }
          if (status >= 500 && attempt < config.maxRetries) {
            await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
            continue;
          }
          throw new Error(`HTTP ${status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (config.modality === 'image') {
          const imagePart = data?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
          if (!imagePart?.inlineData?.data) {
            throw new Error('No image returned');
          }
          return {
            image: {
              mimeType: imagePart.inlineData.mimeType,
              base64: imagePart.inlineData.data
            }
          };
        } else {
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            throw new Error('No text returned');
          }
          return { data: text };
        }

      } catch (err: any) {
        clearTimeout(timeoutId);

        // Network error detection (Windows Firewall, connectivity issues)
        if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'EHOSTUNREACH' || err.code === 'ENETUNREACH') {
          console.error(`[UNIFIED_PROXY] Network error (${err.code}): ${err.message}`);
          if (attempt < config.maxRetries) {
            console.log(`[UNIFIED_PROXY] Retrying network request (attempt ${attempt + 1}/${config.maxRetries})...`);
            await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
            continue;
          }
          throw new Error(
            `Network connectivity error: Cannot reach Gemini API. Check your internet connection and Windows Firewall settings. ` +
            `(${err.code}: ${err.message})`
          );
        }

        if (err.name === 'AbortError') {
          if (attempt < config.maxRetries) {
            console.log(`[UNIFIED_PROXY] Request timeout, retrying (attempt ${attempt + 1}/${config.maxRetries})...`);
            continue;
          }
          throw new Error('Request timeout: Could not reach Gemini API within 30-60 seconds. Check your internet connection.');
        }

        if (attempt < config.maxRetries) {
          console.log(`[UNIFIED_PROXY] Request failed, retrying (attempt ${attempt + 1}/${config.maxRetries})...`);
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }

        throw err;
      }
    }

    throw new Error('Request failed after retries');
  }

  private async executeOpenAI(request: ProxyRequest, config: ProxyConfig): Promise<ProxyResponse> {
    const url = `${config.baseUrl}${config.endpoint}`;

    let payload: any;

    if (config.modality === 'image') {
      payload = {
        model: config.model,
        prompt: request.prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json'
      };
    } else {
      payload = {
        model: config.model,
        messages: [{ role: 'user', content: request.prompt }],
        temperature: request.options?.temperature || 0.4,
        max_tokens: request.options?.maxTokens || 4000
      };
    }

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${request.apiKey}`
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const status = response.status;
          if (status === 401 || status === 403) {
            throw new Error('Invalid API key');
          }
          if (status === 429) {
            if (attempt < config.maxRetries) {
              await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
              continue;
            }
            throw new Error('Quota exhausted (429). Please check your API limits.');
          }
          if (status >= 500 && attempt < config.maxRetries) {
            await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
            continue;
          }
          throw new Error(`HTTP ${status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (config.modality === 'image') {
          const imageData = data?.data?.[0]?.b64_json;
          if (!imageData) {
            throw new Error('No image returned');
          }
          return {
            image: {
              mimeType: 'image/png',
              base64: imageData
            }
          };
        } else {
          const text = data?.choices?.[0]?.message?.content;
          if (!text) {
            throw new Error('No text returned');
          }
          return { data: text };
        }

      } catch (err: any) {
        clearTimeout(timeoutId);

        if (err.name === 'AbortError') {
          if (attempt < config.maxRetries) {
            continue;
          }
          throw new Error('Request timeout');
        }

        if (attempt < config.maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }

        throw err;
      }
    }

    throw new Error('Request failed after retries');
  }
}

export const unifiedProxy = new UnifiedProxy();