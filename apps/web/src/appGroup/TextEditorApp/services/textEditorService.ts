import { TextEditorInput } from "@gem/shared";

const API_BASE = "/api/v1/text-editor";

const apiCache = new Map<string, string>();

export const textEditorService = {
  async query(data: TextEditorInput, signal?: AbortSignal): Promise<string> {
    const cacheKey = JSON.stringify(data);
    if (apiCache.has(cacheKey)) {
      return apiCache.get(cacheKey)!;
    }

    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
      signal,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const res = await response.json();
    const result = typeof res.data === "string" ? res.data : "";

    if (result) {
      apiCache.set(cacheKey, result);
    }

    return result;
  },
};