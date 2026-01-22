/**
 * Resume Agent - Main resume generation agent
 */

import { Agent } from '../../orchestration/types.js';
import { GeminiTransformService } from '../../services/GeminiTransformService.js';
import { AnonymisationService } from '../../services/AnonymisationService.js';

export const ResumeAgent: Agent = {
  id: 'resume-main-agent',
  name: 'Resume Generation Agent',
  description: 'Generates ATS-friendly resume from candidate data',
  execute: async (input: any, context?: any) => {
    const { anonymisedData } = input;

    // Generate resume using existing service
    const resume = await GeminiTransformService.generateATSResume(anonymisedData);

    return resume;
  }
};

