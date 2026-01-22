/**
 * Localization Agent - Adds cultural and language context
 */

import { Agent } from '../../orchestration/types.js';

export const LocalizationAgent: Agent = {
  id: 'trip-localization-agent',
  name: 'Localization Agent',
  description: 'Adds cultural context, language tips, and local customs',
  execute: async (input: any, context?: any) => {
    const { itinerary } = input;

    if (!itinerary || !Array.isArray(itinerary)) {
      return input;
    }

    // Add localization tips based on states/cities
    const stateTips: Record<string, string[]> = {
      'Maharashtra': ['Marathi is widely spoken', 'Try local street food like vada pav'],
      'Delhi': ['Hindi and English are common', 'Try street food in Chandni Chowk'],
      'Karnataka': ['Kannada is the local language', 'Try local cuisine like dosa and idli'],
      'West Bengal': ['Bengali is widely spoken', 'Try Bengali sweets'],
      'Tamil Nadu': ['Tamil is the local language', 'Try South Indian cuisine'],
      'Rajasthan': ['Hindi and Rajasthani are common', 'Experience desert culture'],
      'Goa': ['Konkani, English, and Hindi are common', 'Beach culture and Portuguese influence']
    };

    const enhancedItinerary = itinerary.map((day: any) => {
      const state = day.state || '';
      const tips = stateTips[state] || ['English is widely understood', 'Respect local customs'];

      return {
        ...day,
        localization: {
          language: tips[0],
          culturalTips: tips.slice(1),
          state
        }
      };
    });

    // Add general travel tips
    const generalTips = [
      'Carry cash as digital payments may not be available everywhere',
      'Learn basic Hindi phrases for better communication',
      'Respect local customs and traditions',
      'Bargain at local markets',
      'Try local cuisine but be cautious with street food'
    ];

    const existingTips = input.tips || [];
    const updatedTips = [...existingTips, ...generalTips];

    return {
      ...input,
      itinerary: enhancedItinerary,
      tips: updatedTips
    };
  }
};

