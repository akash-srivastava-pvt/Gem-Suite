/**
 * Style Agent for Text Editor
 */

import { Agent } from '../../orchestration/types.js';
import { mcpServer } from '../../mcp/mcpServer.js';
import { AiProxyService } from '../../ai/ai-proxy.service.js';
import { buildTextEditorPrompt } from '../text.editor.agent.js';

export const StyleAgent: Agent = {
  id: 'text-style-agent',
  name: 'Style Enhancement Agent',
  description: 'Enhances text style based on writing style guide',
  execute: async (input: any, context?: any) => {
    const { text, style } = input;

    // Get style guide from MCP
    const styleGuide = await mcpServer.executeTool('style_guide', {
      action: 'get_style_guide',
      style: style || 'business'
    });

    const prompt = `
You are a professional writing style editor.
Apply the following style guidelines to improve the text.

Style Guidelines:
${styleGuide.guidelines.join('\n')}

Do's:
${styleGuide.do.join('\n')}

Don'ts:
${styleGuide.dont.join('\n')}

Examples:
${styleGuide.examples.map((ex: any) => `Before: ${ex.before}\nAfter: ${ex.after}`).join('\n\n')}

Text to improve:
${text}

Return the improved text following the style guide.
Return ONLY plain text. Do NOT use markdown formatting (bold, italics, etc).
    `;

    const response = await AiProxyService.execute({
      appId: 'texteditor',
      modality: 'text',
      payload: { prompt },
      trackUsage: input.trackUsage
    });

    return response.data;
  }
};

