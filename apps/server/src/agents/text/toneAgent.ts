/**
 * Tone Agent for Text Editor
 */

import { Agent } from '../../orchestration/types.js';
import { mcpServer } from '../../mcp/mcpServer.js';
import { AiProxyService } from '../../ai/ai-proxy.service.js';

export const ToneAgent: Agent = {
  id: 'text-tone-agent',
  name: 'Tone Adjustment Agent',
  description: 'Adjusts text tone based on desired tone guide',
  execute: async (input: any, context?: any) => {
    const { text, tone } = input;

    // Get tone guide from MCP
    const toneGuide = await mcpServer.executeTool('style_guide', {
      action: 'get_tone_guide',
      tone: tone || 'professional'
    });

    const prompt = `
You are a professional tone editor.
Adjust the following text to match the desired tone.

Tone Characteristics:
${toneGuide.characteristics.join('\n')}

Word Choices:
${toneGuide.wordChoices.map((wc: any) => `Avoid: "${wc.avoid}" → Use: "${wc.use}"`).join('\n')}

Examples:
${toneGuide.examples.map((ex: any) => `Before: ${ex.before}\nAfter: ${ex.after}`).join('\n\n')}

Text to adjust:
${text}

Return the text adjusted to match the ${tone} tone.
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

