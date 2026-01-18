import { TextEditorInput } from "@gem/shared";
import { aiCache } from "../../../utils/storage.js";
import { persistenceService } from "../../../services/persistenceService.js";

const API_BASE = "/api/v1/text-editor";
const APP_NAME = "text-editor";

export const textEditorService = {
  async query(data: TextEditorInput, signal?: AbortSignal): Promise<string> {
    // Track local usage
    persistenceService.trackLocalUsage('texteditor', 'api_hit');

    // Check cache first
    const cached = aiCache.get<string>(APP_NAME, data);
    if (cached) {
      return cached;
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
      aiCache.set(APP_NAME, data, result);
      // Track generation
      persistenceService.trackLocalUsage('texteditor', 'generate');
    }

    return result;
  },
};