import { callGemini } from "../proxies/gemini2.js";
import { buildTextEditorPrompt } from "../agents/text.editor.agent.js";
import { getApiKey } from "../utility/helper.js";
import { Request, Response } from "express";

export async function TextEditorController(req: Request, res: Response) {
  try {
    const { data } = req.body;

    if (!data?.intent || !data?.text) {
      return res
        .status(400)
        .json({ success: false, error: "intent and text required" });
    }

    const { intent, text, language, tone } = data;

    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error("Gemini API key missing");
    }

    const prompt = await buildTextEditorPrompt({
      intent,
      text,
      language,
      tone,
    });

    const result = (await callGemini(apiKey, prompt)).data;

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("TextEditorController error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
