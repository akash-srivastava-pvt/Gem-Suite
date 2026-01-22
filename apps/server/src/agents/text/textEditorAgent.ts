/**
 * Main Text Editor Agent
 */

import { Agent } from '../../orchestration/types.js';
import { AiProxyService } from '../../ai/ai-proxy.service.js';
import { buildTextEditorPrompt } from '../text.editor.agent.js';

export const TextEditorAgent: Agent = {
  id: 'text-editor-main-agent',
  name: 'Text Editor Agent',
  description: 'Main text editing agent that handles various text operations',
  execute: async (input: any, context?: any) => {
    const { intent, text, language, tone, trackUsage } = input;

    const prompt = buildTextEditorPrompt({ intent, text, language, tone });
    const response = await AiProxyService.execute({
      appId: 'texteditor',
      modality: 'text',
      payload: { prompt },
      trackUsage
    });

    return response.data;
  }
};

