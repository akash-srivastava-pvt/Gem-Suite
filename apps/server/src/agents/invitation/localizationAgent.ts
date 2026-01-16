/**
 * Localization Agent for Invitation Maker
 */

import { Agent } from '../../orchestration/types.js';
import { mcpServer } from '../../mcp/mcpServer.js';

export const InvitationLocalizationAgent: Agent = {
  id: 'invitation-localization-agent',
  name: 'Invitation Localization Agent',
  description: 'Adds language-specific formatting and cultural context',
  execute: async (input: any, context?: any) => {
    const { data, image } = input;

    // Get language resources from MCP
    const languageResources = await mcpServer.executeTool('design_resources', {
      action: 'get_language_resources',
      language: data.language || 'english'
    });

    // Enhance data with language-specific formatting
    const localizedData = {
      ...data,
      languageFormatting: {
        commonPhrases: languageResources.commonPhrases,
        formattingRules: languageResources.formattingRules,
        typography: languageResources.typography
      },
      examples: languageResources.examples
    };

    return {
      ...input,
      data: localizedData,
      localization: languageResources
    };
  }
};

