/**
 * Main Text Editor Agent
 */

import { Agent } from '../../orchestration/types.js';
import { callGeminiWithUserPreference } from '../../utility/helper.js';
import { getApiKey } from '../../utility/helper.js';
import { buildTextEditorPrompt } from '../text.editor.agent.js';

export const TextEditorAgent: Agent = {
  id: 'text-editor-main-agent',
  name: 'Text Editor Agent',
  description: 'Main text editing agent that handles various text operations',
  execute: async (input: any, context?: any) => {
    const { intent, text, language, tone } = input;

    const prompt = buildTextEditorPrompt({ intent, text, language, tone });
    const apiKey = await getApiKey();
    const response = await callGeminiWithUserPreference(apiKey, prompt);

    return response.data;
  }
};

