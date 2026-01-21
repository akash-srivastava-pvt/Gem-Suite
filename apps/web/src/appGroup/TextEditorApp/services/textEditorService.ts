import { TextEditorInput } from "@gem/shared";
import { aiCache } from "../../../utils/storage.js";
import { persistenceService } from "../../../services/persistenceService.js";
import { aiProxyService } from "../../../services/aiProxyService.js";

const APP_NAME = "text-editor";

export const textEditorService = {
  async query(data: TextEditorInput, signal?: AbortSignal): Promise<string> {
    const cached = aiCache.get<string>(APP_NAME, data);
    if (cached) {
      return cached;
    }

    const response = await fetch('/api/v1/text-editor', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data })
    });

    const res = await response.json();
    const result = res.data || "";

    if (result) {
      aiCache.set(APP_NAME, data, result);
    }

    return result;
  },
};