import { getApiKey } from "../utility/helper.js";
import { Request, Response } from "express";
import { LoggerModel } from "../models/loggerModel.js";
import { agentOrchestrator } from "../orchestration/agentOrchestrator.js";
import { textEditorWorkflow } from "../orchestration/workflows.js";
import { saveService } from "../services/SaveService.js";

export async function TextEditorController(req: Request, res: Response) {
  try {
    const { data } = req.body;

    if (!data?.intent || !data?.text) {
      return res
        .status(400)
        .json({ success: false, error: "intent and text required" });
    }

    const { intent, text, language, tone, style } = data;

    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error("Gemini API key missing");
    }

    // Track API usage
    await saveService.trackUsage('texteditor', 'api_hit', {
      intent,
      textLength: text.length,
      language,
      tone,
      style
    });

    // For simple intents, use direct agent call
    // For complex operations, use workflow
    const complexIntents = ['rewrite', 'continue'];
    const useWorkflow = complexIntents.includes(intent) && (style || tone);

    if (useWorkflow) {
      LoggerModel.log(`Using workflow for text editing: ${intent}`);
      
      const result = await agentOrchestrator.executeWorkflow(textEditorWorkflow, {
        intent,
        text,
        language,
        tone,
        style
      });

      if (!result.success) {
        throw new Error(`Workflow failed: ${JSON.stringify(result.errors)}`);
      }

      const finalResult = result.results.tone || result.results.style || result.results.grammar || result.results.edit;
      LoggerModel.log(`Text editing workflow completed: ${intent}`);

      // Track generation event
      await saveService.trackUsage('texteditor', 'generate', {
        intent,
        workflow: true
      });

      return res.status(200).json({
        success: true,
        data: finalResult,
      });
    } else {
      // Simple operation - use direct agent
      LoggerModel.log(`Using direct agent for text editing: ${intent}`);
      const result = await agentOrchestrator.callAgent('text-editor-main-agent', {
        intent,
        text,
        language,
        tone
      });

      // Track generation event
      await saveService.trackUsage('texteditor', 'generate', {
        intent,
        workflow: false
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    }
  } catch (err: any) {
    console.error("TextEditorController error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
