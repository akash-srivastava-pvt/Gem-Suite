import { Request, Response } from 'express';
import { AiProxyService } from '../ai/ai-proxy.service.js';

export const AiProxyController = {
  execute: async (req: Request, res: Response) => {
    try {
      const { appId, modality, payload, model } = req.body;

      // Validate required fields
      if (!appId || !modality || !payload) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: appId, modality, payload'
        });
      }

      const result = await AiProxyService.execute({
        appId,
        modality,
        payload,
        model
      });

      res.json({ success: true, data: result });

    } catch (error: any) {
      console.error('[AI_PROXY][EXECUTE]', error);

      // Handle specific error types
      if (error.message.includes('Invalid') && error.message.includes('key')) {
        return res.status(401).json({
          success: false,
          error: 'Invalid API key. Please check your API key in Profile settings.'
        });
      }

      if (error.message.includes('quota') || error.message.includes('limit')) {
        return res.status(429).json({
          success: false,
          error: 'API quota exceeded. Please try again later or update your API plan.'
        });
      }

      if (error.message.includes('timeout')) {
        return res.status(408).json({
          success: false,
          error: 'Request timeout. Please try again.'
        });
      }

      if (error.message.includes('Unsupported model')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'AI service temporarily unavailable. Please try again.'
      });
    }
  },

  listModels: async (_req: Request, res: Response) => {
    try {
      const models = await AiProxyService.listModels();
      res.json({ success: true, data: models });
    } catch (error: any) {
      console.error('[AI_PROXY][LIST_MODELS]', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list available models'
      });
    }
  }
};