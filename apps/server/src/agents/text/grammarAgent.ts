/**
 * Grammar Agent for Text Editor
 */

import { Agent } from '../../orchestration/types.js';
import { mcpServer } from '../../mcp/mcpServer.js';
import { callGeminiWithUserPreference } from '../../utility/helper.js';
import { getApiKey } from '../../utility/helper.js';
import { buildTextEditorPrompt } from '../text.editor.agent.js';

export const TextGrammarAgent: Agent = {
  id: 'text-grammar-agent',
  name: 'Grammar Check Agent',
  description: 'Checks and fixes grammar in text',
  execute: async (input: any, context?: any) => {
    const { text } = input;

    // Get grammar rules from MCP
    const grammarRules = await mcpServer.executeTool('style_guide', {
      action: 'get_grammar_rules'
    });

    const prompt = buildTextEditorPrompt({
      intent: 'grammar',
      text,
      language: input.language,
      tone: input.tone
    });

    const apiKey = await getApiKey();
    const response = await callGeminiWithUserPreference(apiKey, prompt);

    return response.data;
  }
};

