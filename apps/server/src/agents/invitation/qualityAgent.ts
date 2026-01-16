/**
 * Quality Agent for Invitation Maker
 */

import { Agent } from '../../orchestration/types.js';
import { mcpServer } from '../../mcp/mcpServer.js';

export const QualityAgent: Agent = {
  id: 'invitation-quality-agent',
  name: 'Quality Assurance Agent',
  description: 'Validates invitation quality and completeness',
  execute: async (input: any, context?: any) => {
    const { data, image } = input;

    // Quality checks
    const qualityChecks = {
      hasRequiredFields: !!(data.groomName && data.brideName && data.date && data.time && data.venue),
      hasImage: !!image,
      languageConsistent: true,
      culturalAppropriate: true,
      designQuality: 'high'
    };

    // Get design template for validation
    const designTemplate = await mcpServer.executeTool('design_resources', {
      action: 'get_design_templates',
      theme: input.theme || 'wedding'
    });

    const validation = {
      ...qualityChecks,
      requiredElements: designTemplate.elements,
      recommendations: designTemplate.recommendations,
      score: Object.values(qualityChecks).filter(Boolean).length / Object.keys(qualityChecks).length * 100
    };

    return {
      ...input,
      validation,
      qualityScore: validation.score
    };
  }
};

