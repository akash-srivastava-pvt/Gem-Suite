import { TextEditorInput } from "@gem/shared";

const API_BASE = "/api/v1/text-editor";

export const textEditorService = {
  async query(data: TextEditorInput): Promise<string> {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const res = await response.json();
    return typeof res.data === "string" ? res.data : "";
  },
};