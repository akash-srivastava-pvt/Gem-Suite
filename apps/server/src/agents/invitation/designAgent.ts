/**
 * Design Agent for Invitation Maker
 */

import { Agent } from '../../orchestration/types.js';
import { mcpServer } from '../../mcp/mcpServer.js';
import { callGeminiImageWithUserPreference } from '../../utility/helper.js';
import { getApiKey } from '../../utility/helper.js';
import { buildInvitationPrompt } from '../wedding.invitation.agent.js';

export const DesignAgent: Agent = {
  id: 'invitation-design-agent',
  name: 'Invitation Design Agent',
  description: 'Generates invitation designs with cultural and design context',
  execute: async (input: any, context?: any) => {
    const { data, theme } = input;

    // Get design resources from MCP
    const culturalPatterns = await mcpServer.executeTool('design_resources', {
      action: 'get_cultural_patterns',
      religion: data.religion
    });

    const designTemplates = await mcpServer.executeTool('design_resources', {
      action: 'get_design_templates',
      theme: theme || 'wedding'
    });

    const colorScheme = await mcpServer.executeTool('design_resources', {
      action: 'get_color_scheme',
      religion: data.religion,
      theme: theme || 'wedding'
    });

    // Enhance prompt with MCP context
    const basePrompt = buildInvitationPrompt(data);
    const enhancedPrompt = `
${basePrompt}

Design Context:
- Cultural Motifs: ${culturalPatterns.motifs.join(', ')}
- Design Elements: ${designTemplates.elements.join(', ')}
- Color Scheme: ${colorScheme.description}
- Primary Colors: ${colorScheme.primary.join(', ')}
- Layout Style: ${designTemplates.layout}

Follow these design guidelines:
${designTemplates.recommendations.join('\n')}
    `;

    const apiKey = await getApiKey();
    const response = await callGeminiImageWithUserPreference(apiKey, enhancedPrompt);

    return {
      ...response,
      designContext: {
        culturalPatterns,
        designTemplates,
        colorScheme
      }
    };
  }
};

