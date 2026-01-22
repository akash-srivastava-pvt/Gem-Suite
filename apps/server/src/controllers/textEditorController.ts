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

    LoggerModel.log(`Starting text editor request: ${intent}`);

    // Track the unique flow API hit
    await saveService.trackUsage('texteditor', 'api_hit', { intent });

    let finalResult: string;

    // Simple intents should NOT run the full multi-step workflow 
    // to avoid mangling the output or tracking duplicate AI calls.
    const isSimpleIntent = ['translate', 'summarize', 'grammar', 'rewrite', 'autocomplete', 'continue'].includes(intent);

    if (isSimpleIntent) {
      LoggerModel.log(`Executing simple intent: ${intent}`);
      finalResult = await agentOrchestrator.callAgent('text-editor-main-agent', {
        intent,
        text,
        language: language || 'english',
        tone: tone || 'professional',
        trackUsage: false // Disable internal tracking in AiProxy
      });
    } else {
      // Execute the full workflow for complex/combined operations
      const result = await agentOrchestrator.executeWorkflow(textEditorWorkflow, {
        intent,
        text,
        language: language || 'english',
        tone: tone || 'professional',
        style: style || 'business',
        trackUsage: false // Pass to all steps
      });

      if (!result.success) {
        console.error('Text editor workflow errors:', result.errors);
        return res.status(500).json({
          success: false,
          error: 'Text editing workflow failed',
          details: result.errors
        });
      }

      const workflowResults = result.results || {};
      finalResult = workflowResults.tone || workflowResults.style || workflowResults.grammar || workflowResults.edit;
    }

    // Ensure we have a result
    if (!finalResult) {
      return res.status(500).json({
        success: false,
        error: 'Text editing completed but produced no results'
      });
    }

    // Track the unique flow completion
    await saveService.trackUsage('texteditor', 'generate', { intent });

    LoggerModel.log(`Text editing completed: ${intent}`);

    return res.status(200).json({
      success: true,
      data: finalResult,
    });
  } catch (err: any) {
    console.error("TextEditorController error:", err);
    await saveService.trackUsage('texteditor', 'api_error', { error: err.message, intent: req.body?.data?.intent });
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
