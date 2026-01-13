import { GeminiResponse } from "@gem/shared";

// URL remains the same
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const REQUEST_TIMEOUT = 30_000;
const MAX_RETRIES = 2;

export async function callGemini(
  apiKey: string,
  prompt: string
): Promise<GeminiResponse> {
  if (!apiKey || !prompt) {
    throw new Error("API key and prompt are required");
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    // 1. Setup Timeout logic using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // x-goog-api-key can also be used here, but query param is most reliable for fetch
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 7200,
          },
        }),
        signal: controller.signal, // Connect timeout signal
      });

      // Clear timeout as soon as we get a response
      clearTimeout(timeoutId);

      // 2. Handle HTTP Errors
      if (!response.ok) {
        const status = response.status;
        const errorData = await response.json().catch(() => ({}));

        // ❌ Auth errors: never retry
        if (status === 401 || status === 403) {
          throw new Error("Invalid Gemini API key");
        }

        // 🔁 Retry server (5xx) or rate limit (429) errors
        if ((status === 429 || status >= 500) && attempt < MAX_RETRIES) {
          const delay = 1000 * (attempt + 1);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        throw new Error(
          errorData.error?.message || `Gemini request failed (${status})`
        );
      }

      // 3. Parse Success Response
      const resData = await response.json();
      const text = resData?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("Empty response from Gemini");
      }

      return { data: text };

    } catch (err: any) {
      clearTimeout(timeoutId);

      // Handle Abort/Timeout Error
      if (err.name === 'AbortError') {
        if (attempt < MAX_RETRIES) {
          const delay = 1000 * (attempt + 1);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        throw new Error("Gemini request timed out");
      }

      // Generic network errors retry logic
      if (attempt < MAX_RETRIES) {
        const delay = 1000 * (attempt + 1);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      throw err;
    }
  }

  throw new Error("Gemini request failed after retries");
}