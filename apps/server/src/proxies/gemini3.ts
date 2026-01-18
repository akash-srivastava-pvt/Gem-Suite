import { GeminiResponse } from "@gem/shared";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent"; // Updated model name for 2026

const REQUEST_TIMEOUT = 45_000;
const MAX_TOKENS = 7200;

export async function callGemini(
  apiKey: string,
  prompt: string,
  retries = 2
): Promise<GeminiResponse> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    // 1. Setup Timeout Controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Note: Gemini usually prefers key as a query param, 
          // but some versions support x-goog-api-key header.
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: MAX_TOKENS,
            temperature: 0.3,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 2. Error Status Handling (4xx, 5xx)
      if (!response.ok) {
        const status = response.status;
        const errorBody = await response.json().catch(() => ({}));

        // Never retry auth failures
        if (status === 401 || status === 403) {
          throw new Error("Invalid Gemini API key");
        }

        // 🔥 429 Handling
        if (status === 429 && attempt < retries) {
          const retryAfter = Number(response.headers.get("retry-after")) || 5;
          const backoffMs = retryAfter * 1000 + Math.random() * 1000;

          console.warn(`[Gemini] 429 received. Waiting ${backoffMs}ms before retry`);
          await new Promise((r) => setTimeout(r, backoffMs));
          continue;
        }

        // Client Errors (400-499)
        if (status >= 400 && status < 500) {
          throw new Error(errorBody.error?.message || `Gemini client error (${status})`);
        }

        // Server Errors (5xx) → Retry logic
        if (attempt < retries) {
          const backoffMs = 3000 * (attempt + 1);
          await new Promise((r) => setTimeout(r, backoffMs));
          continue;
        }

        throw new Error(`Gemini request failed with status ${status}`);
      }

      // 3. Success Response Parsing
      const resData = await response.json();
      const text = resData?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) throw new Error("Empty Gemini response");

      return { data: text };

    } catch (err: any) {
      clearTimeout(timeoutId);

      // Handle Timeout/Abort error
      if (err.name === 'AbortError') {
        if (attempt < retries) {
          continue;
        }
        throw new Error("Gemini request timed out");
      }

      if (attempt < retries) {
        const backoffMs = 3000 * (attempt + 1);
        await new Promise((r) => setTimeout(r, backoffMs));
        continue;
      }

      throw err;
    }
  }

  throw new Error("Unreachable Gemini client state");
}