/**
 * Predefined Workflows for each app
 */

import { Workflow } from './types.js';

/**
 * Trip Planner Workflow
 * RouteAgent → CostAgent → WeatherAgent → LocalizationAgent
 */
export const tripPlannerWorkflow: Workflow = {
  id: 'trip-planner-workflow',
  name: 'Trip Planning Workflow',
  steps: [
    {
      id: 'route',
      agentId: 'trip-route-agent',
      input: (results: Record<string, any>) => {
        // Support both { data: {...} } and direct data structure
        const inputData = results.initial?.data || results.initial || {};
        return {
          places: inputData.places,
          startLocation: inputData.startLocation,
          endLocation: inputData.endLocation,
          tripType: inputData.tripType,
          startDate: inputData.startDate,
          endDate: inputData.endDate,
          peopleCount: inputData.peopleCount
        };
      },
      timeout: 60000
    },
    {
      id: 'cost',
      agentId: 'trip-cost-agent',
      input: (results: Record<string, any>) => results.route,
      dependsOn: ['route'],
      timeout: 30000
    },
    {
      id: 'weather',
      agentId: 'trip-weather-agent',
      input: (results: Record<string, any>) => results.cost,
      dependsOn: ['cost'],
      timeout: 30000
    },
    {
      id: 'localization',
      agentId: 'trip-localization-agent',
      input: (results: Record<string, any>) => results.weather,
      dependsOn: ['weather'],
      timeout: 30000
    }
  ],
  onError: 'continue'
};

/**
 * Resume Maker Workflow
 * ResumeAgent → GrammarAgent → ATSScoringAgent → FormattingAgent
 */
export const resumeMakerWorkflow: Workflow = {
  id: 'resume-maker-workflow',
  name: 'Resume Generation Workflow',
  steps: [
    {
      id: 'draft',
      agentId: 'resume-main-agent',
      input: (results: Record<string, any>) => ({ anonymisedData: results.initial?.anonymisedData || results.initial }),
      timeout: 60000
    },
    {
      id: 'grammar',
      agentId: 'resume-grammar-agent',
      input: (results: Record<string, any>) => {
        // Use draft if available, otherwise skip
        if (!results.draft) {
          throw new Error('Draft step failed or returned no result');
        }
        return { resume: results.draft };
      },
      dependsOn: ['draft'],
      timeout: 45000
    },
    {
      id: 'ats',
      agentId: 'resume-ats-scoring-agent',
      input: (results: Record<string, any>) => {
        // Use grammar result if available, fallback to draft
        const resume = results.grammar || results.draft;
        if (!resume) {
          throw new Error('No resume data available from previous steps');
        }
        return {
          resume,
          jobDescription: results.initial?.jobDescription,
          industry: results.initial?.industry
        };
      },
      dependsOn: ['grammar'],
      timeout: 45000
    },
    {
      id: 'format',
      agentId: 'resume-formatting-agent',
      input: (results: Record<string, any>) => {
        // Use ats result if available, fallback to grammar or draft
        const resume = results.ats || results.grammar || results.draft;
        if (!resume) {
          throw new Error('No resume data available from previous steps');
        }
        return resume;
      },
      dependsOn: ['ats'],
      timeout: 30000
    }
  ],
  onError: 'continue'
};

/**
 * Text Editor Workflow (for complex operations)
 * TextEditorAgent → GrammarAgent → StyleAgent → ToneAgent
 */
export const textEditorWorkflow: Workflow = {
  id: 'text-editor-workflow',
  name: 'Text Editing Workflow',
  steps: [
    {
      id: 'edit',
      agentId: 'text-editor-main-agent',
      input: (results: Record<string, any>) => results.initial || {},
      timeout: 30000
    },
    {
      id: 'grammar',
      agentId: 'text-grammar-agent',
      input: (results: Record<string, any>) => ({
        text: results.edit,
        language: results.initial?.language,
        tone: results.initial?.tone
      }),
      dependsOn: ['edit'],
      timeout: 30000
    },
    {
      id: 'style',
      agentId: 'text-style-agent',
      input: (results: Record<string, any>) => ({
        text: results.grammar,
        style: results.initial?.style || 'business'
      }),
      dependsOn: ['grammar'],
      timeout: 30000
    },
    {
      id: 'tone',
      agentId: 'text-tone-agent',
      input: (results: Record<string, any>) => ({
        text: results.style,
        tone: results.initial?.tone || 'professional'
      }),
      dependsOn: ['style'],
      timeout: 30000
    }
  ],
  onError: 'continue'
};

/**
 * Invitation Maker Workflow
 * DesignAgent → LocalizationAgent → QualityAgent
 */
export const invitationMakerWorkflow: Workflow = {
  id: 'invitation-maker-workflow',
  name: 'Invitation Generation Workflow',
  steps: [
    {
      id: 'design',
      agentId: 'invitation-design-agent',
      input: (results: Record<string, any>) => results.initial || {},
      timeout: 60000
    },
    {
      id: 'localization',
      agentId: 'invitation-localization-agent',
      input: (results: Record<string, any>) => ({
        data: results.initial?.data,
        image: results.design?.image,
        theme: results.initial?.theme
      }),
      dependsOn: ['design'],
      timeout: 30000
    },
    {
      id: 'quality',
      agentId: 'invitation-quality-agent',
      input: (results: Record<string, any>) => ({
        data: results.localization?.data || results.initial?.data,
        image: results.design?.image,
        theme: results.initial?.theme
      }),
      dependsOn: ['localization'],
      timeout: 30000
    }
  ],
  onError: 'continue'
};

export const workflows = {
  'trip-planner': tripPlannerWorkflow,
  'resume-maker': resumeMakerWorkflow,
  'text-editor': textEditorWorkflow,
  'invitation-maker': invitationMakerWorkflow
};

