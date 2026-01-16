/**
 * MCP Tool: Style Guides, Grammar Rules, and Tone Dictionaries
 * For Text Editor (Likhit)
 */

import { MCPTool } from '../types.js';

export const StyleTool: MCPTool = {
  name: 'style_guide',
  description: 'Access style guides, grammar rules, and tone dictionaries for text editing',
  parameters: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['get_grammar_rules', 'get_style_guide', 'get_tone_guide', 'check_consistency'],
        description: 'Action to perform'
      },
      style: {
        type: 'string',
        enum: ['academic', 'business', 'creative', 'journalistic', 'technical'],
        description: 'Writing style'
      },
      tone: {
        type: 'string',
        enum: ['formal', 'casual', 'professional', 'friendly', 'authoritative'],
        description: 'Desired tone'
      },
      text: { type: 'string', description: 'Text to analyze' }
    },
    required: ['action']
  },
  execute: async (params: Record<string, any>) => {
    const { action, style, tone, text } = params;

    switch (action) {
      case 'get_grammar_rules':
        return getGrammarRules();

      case 'get_style_guide':
        if (!style) throw new Error('Style is required');
        return getStyleGuide(style);

      case 'get_tone_guide':
        if (!tone) throw new Error('Tone is required');
        return getToneGuide(tone);

      case 'check_consistency':
        if (!text) throw new Error('Text is required');
        return checkConsistency(text, style, tone);

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
};

/**
 * Get common grammar rules
 */
function getGrammarRules(): { rules: Array<{ rule: string; example: string; correction: string }> } {
  return {
    rules: [
      {
        rule: 'Subject-verb agreement',
        example: 'The team are working',
        correction: 'The team is working'
      },
      {
        rule: 'Avoid passive voice when possible',
        example: 'The report was written by John',
        correction: 'John wrote the report'
      },
      {
        rule: 'Use active voice',
        example: 'Mistakes were made',
        correction: 'I made mistakes'
      },
      {
        rule: 'Avoid run-on sentences',
        example: 'I went to the store I bought milk',
        correction: 'I went to the store and bought milk'
      },
      {
        rule: 'Proper comma usage',
        example: 'However I disagree',
        correction: 'However, I disagree'
      }
    ]
  };
}

/**
 * Get style guide for specific writing style
 */
function getStyleGuide(style: string): {
  guidelines: string[];
  do: string[];
  dont: string[];
  examples: Array<{ before: string; after: string }>;
} {
  const guides: Record<string, any> = {
    academic: {
      guidelines: [
        'Use formal language and third person',
        'Cite sources appropriately',
        'Avoid contractions',
        'Use precise terminology'
      ],
      do: ['Use "research indicates"', 'Cite sources', 'Use formal structure'],
      dont: ['Use "I think"', 'Use contractions', 'Use casual language'],
      examples: [
        { before: "I think this is important", after: "This is significant because" },
        { before: "can't", after: "cannot" }
      ]
    },
    business: {
      guidelines: [
        'Be concise and clear',
        'Use professional tone',
        'Focus on action items',
        'Use bullet points for lists'
      ],
      do: ['Use action verbs', 'Be direct', 'Highlight key points'],
      dont: ['Be verbose', 'Use jargon unnecessarily', 'Be vague'],
      examples: [
        { before: "We might want to consider", after: "We recommend" },
        { before: "a lot of", after: "many" }
      ]
    },
    creative: {
      guidelines: [
        'Use vivid descriptions',
        'Show, don\'t tell',
        'Use varied sentence structure',
        'Engage the senses'
      ],
      do: ['Use metaphors', 'Create imagery', 'Vary pacing'],
      dont: ['Overuse adjectives', 'Be cliché', 'Tell instead of show'],
      examples: [
        { before: "It was very hot", after: "The sun beat down mercilessly" },
        { before: "She was sad", after: "Tears traced paths down her cheeks" }
      ]
    },
    journalistic: {
      guidelines: [
        'Lead with the most important information',
        'Answer who, what, when, where, why',
        'Use active voice',
        'Keep paragraphs short'
      ],
      do: ['Lead with facts', 'Use quotes', 'Be objective'],
      dont: ['Use first person', 'Include opinions', 'Be biased'],
      examples: [
        { before: "I believe this is important", after: "Experts say this is important" }
      ]
    },
    technical: {
      guidelines: [
        'Define technical terms',
        'Use precise language',
        'Include code examples when relevant',
        'Structure information logically'
      ],
      do: ['Define acronyms', 'Use diagrams', 'Provide examples'],
      dont: ['Assume knowledge', 'Use vague terms', 'Skip steps'],
      examples: [
        { before: "The function does stuff", after: "The function processes user input and validates it" }
      ]
    }
  };

  return guides[style.toLowerCase()] || guides.business;
}

/**
 * Get tone guide
 */
function getToneGuide(tone: string): {
  characteristics: string[];
  wordChoices: Array<{ avoid: string; use: string }>;
  examples: Array<{ before: string; after: string }>;
} {
  const tones: Record<string, any> = {
    formal: {
      characteristics: ['Respectful', 'Professional', 'Structured', 'Polite'],
      wordChoices: [
        { avoid: "can't", use: "cannot" },
        { avoid: "won't", use: "will not" },
        { avoid: "gonna", use: "going to" },
        { avoid: "yeah", use: "yes" }
      ],
      examples: [
        { before: "Hey, can you help?", after: "Could you please assist?" },
        { before: "Thanks!", after: "Thank you" }
      ]
    },
    casual: {
      characteristics: ['Relaxed', 'Conversational', 'Friendly', 'Approachable'],
      wordChoices: [
        { avoid: "utilize", use: "use" },
        { avoid: "commence", use: "start" },
        { avoid: "facilitate", use: "help" }
      ],
      examples: [
        { before: "I would like to", after: "I'd like to" },
        { before: "It is important to note", after: "Note that" }
      ]
    },
    professional: {
      characteristics: ['Confident', 'Competent', 'Clear', 'Respectful'],
      wordChoices: [
        { avoid: "I think", use: "I believe" },
        { avoid: "maybe", use: "possibly" },
        { avoid: "stuff", use: "materials" }
      ],
      examples: [
        { before: "I think we should", after: "I recommend we" }
      ]
    },
    friendly: {
      characteristics: ['Warm', 'Approachable', 'Positive', 'Engaging'],
      wordChoices: [
        { avoid: "issue", use: "challenge" },
        { avoid: "problem", use: "situation" },
        { avoid: "cannot", use: "can't" }
      ],
      examples: [
        { before: "You must", after: "You might want to" },
        { before: "This is wrong", after: "Let's try a different approach" }
      ]
    },
    authoritative: {
      characteristics: ['Confident', 'Direct', 'Knowledgeable', 'Decisive'],
      wordChoices: [
        { avoid: "maybe", use: "will" },
        { avoid: "I think", use: "Research shows" },
        { avoid: "possibly", use: "definitely" }
      ],
      examples: [
        { before: "You might want to", after: "You should" },
        { before: "It could be", after: "It is" }
      ]
    }
  };

  return tones[tone.toLowerCase()] || tones.professional;
}

/**
 * Check text consistency with style and tone
 */
function checkConsistency(text: string, style?: string, tone?: string): {
  issues: Array<{ type: string; text: string; suggestion: string }>;
  consistencyScore: number;
} {
  const issues: Array<{ type: string; text: string; suggestion: string }> = [];
  const lowerText = text.toLowerCase();

  // Check for contractions in formal tone
  if (tone === 'formal') {
    const contractions = text.match(/\b(can't|won't|don't|isn't|aren't|haven't|hasn't|wouldn't|shouldn't)\b/gi);
    if (contractions) {
      contractions.forEach(contraction => {
        issues.push({
          type: 'tone_inconsistency',
          text: contraction,
          suggestion: contraction.replace("'", '') + ' (avoid contractions in formal tone)'
        });
      });
    }
  }

  // Check for passive voice
  const passivePattern = /\b(is|are|was|were|be|been)\s+\w+ed\b/gi;
  const passiveMatches = text.match(passivePattern);
  if (passiveMatches && passiveMatches.length > text.split('.').length * 0.3) {
    issues.push({
      type: 'style_issue',
      text: 'Excessive passive voice',
      suggestion: 'Consider using active voice for clarity'
    });
  }

  // Check sentence length
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const longSentences = sentences.filter(s => s.split(' ').length > 30);
  if (longSentences.length > 0) {
    issues.push({
      type: 'readability',
      text: `${longSentences.length} very long sentences`,
      suggestion: 'Consider breaking into shorter sentences for better readability'
    });
  }

  const consistencyScore = Math.max(0, 100 - (issues.length * 15));

  return { issues, consistencyScore };
}

