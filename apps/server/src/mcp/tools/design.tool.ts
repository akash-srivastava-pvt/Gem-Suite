/**
 * MCP Tool: Design Templates, Cultural Patterns, and Language Resources
 * For Invitation Maker (Gem Amantrad)
 */

import { MCPTool } from '../types.js';

export const DesignTool: MCPTool = {
  name: 'design_resources',
  description: 'Access design templates, cultural patterns, and language resources for invitations',
  parameters: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['get_cultural_patterns', 'get_language_resources', 'get_design_templates', 'get_color_scheme'],
        description: 'Action to perform'
      },
      religion: {
        type: 'string',
        enum: ['hindu', 'muslim', 'christian', 'sikh'],
        description: 'Religion for cultural patterns'
      },
      language: {
        type: 'string',
        enum: ['english', 'hindi', 'urdu'],
        description: 'Language for resources'
      },
      theme: {
        type: 'string',
        enum: ['wedding', 'mundan', 'festival', 'religious', 'sokh_sabha'],
        description: 'Event theme'
      }
    },
    required: ['action']
  },
  execute: async (params: Record<string, any>) => {
    const { action, religion, language, theme } = params;

    switch (action) {
      case 'get_cultural_patterns':
        if (!religion) throw new Error('Religion is required');
        return getCulturalPatterns(religion);

      case 'get_language_resources':
        if (!language) throw new Error('Language is required');
        return getLanguageResources(language);

      case 'get_design_templates':
        if (!theme) throw new Error('Theme is required');
        return getDesignTemplates(theme);

      case 'get_color_scheme':
        if (!religion || !theme) throw new Error('Religion and theme are required');
        return getColorScheme(religion, theme);

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
};

/**
 * Get cultural patterns for religion
 */
function getCulturalPatterns(religion: string): {
  motifs: string[];
  symbols: string[];
  designElements: string[];
  layout: string;
} {
  const patterns: Record<string, any> = {
    hindu: {
      motifs: ['mandap', 'marigold flowers', 'lotus', 'peacock feathers', 'diya', 'om symbol'],
      symbols: ['swastika', 'kalash', 'mangalsutra', 'bindi patterns'],
      designElements: ['floral borders', 'traditional patterns', 'gold accents', 'red and gold color scheme'],
      layout: 'Vertical layout with central text, decorative borders, traditional typography'
    },
    muslim: {
      motifs: ['geometric patterns', 'crescent moon', 'star', 'arabesque', 'calligraphy'],
      symbols: ['crescent', 'star and crescent', 'geometric tiles', 'islamic art patterns'],
      designElements: ['intricate borders', 'geometric designs', 'elegant typography', 'gold and green accents'],
      layout: 'Elegant vertical or horizontal layout with geometric borders and calligraphic text'
    },
    christian: {
      motifs: ['cross', 'dove', 'roses', 'ivy', 'rings'],
      symbols: ['cross', 'wedding rings', 'dove', 'roses'],
      designElements: ['soft floral patterns', 'elegant borders', 'classic typography', 'pastel colors'],
      layout: 'Classic vertical layout with floral borders and elegant serif fonts'
    },
    sikh: {
      motifs: ['khanda', 'ik onkar', 'floral patterns', 'traditional designs'],
      symbols: ['khanda', 'ik onkar', 'sikh symbols'],
      designElements: ['traditional patterns', 'gold accents', 'floral borders', 'bold typography'],
      layout: 'Traditional layout with Sikh symbols and Punjabi/English text'
    }
  };

  return patterns[religion.toLowerCase()] || patterns.hindu;
}

/**
 * Get language resources
 */
function getLanguageResources(language: string): {
  commonPhrases: Record<string, string>;
  formattingRules: string[];
  typography: string;
  examples: string[];
} {
  const resources: Record<string, any> = {
    english: {
      commonPhrases: {
        'wedding': 'You are cordially invited',
        'date': 'Date',
        'time': 'Time',
        'venue': 'Venue',
        'rsvp': 'RSVP'
      },
      formattingRules: [
        'Use formal language',
        'Capitalize important words',
        'Use proper punctuation'
      ],
      typography: 'Elegant serif or sans-serif fonts',
      examples: [
        'You are cordially invited to the wedding of...',
        'Date: [Date]',
        'Time: [Time]',
        'Venue: [Venue]'
      ]
    },
    hindi: {
      commonPhrases: {
        'wedding': 'आप सादर आमंत्रित हैं',
        'date': 'तारीख',
        'time': 'समय',
        'venue': 'स्थान',
        'rsvp': 'उपस्थिति की पुष्टि करें'
      },
      formattingRules: [
        'Use Devanagari script',
        'Proper spacing between words',
        'Traditional formatting'
      ],
      typography: 'Devanagari fonts (Mangal, Noto Sans Devanagari)',
      examples: [
        'आप सादर आमंत्रित हैं...',
        'तारीख: [तारीख]',
        'समय: [समय]',
        'स्थान: [स्थान]'
      ]
    },
    urdu: {
      commonPhrases: {
        'wedding': 'آپ کو دعوت دی جاتی ہے',
        'date': 'تاریخ',
        'time': 'وقت',
        'venue': 'مقام',
        'rsvp': 'حاضری کی تصدیق'
      },
      formattingRules: [
        'Use Nastaliq script',
        'Right-to-left text direction',
        'Elegant calligraphy style'
      ],
      typography: 'Nastaliq fonts (Jameel Noori Nastaleeq, Noto Nastaliq Urdu)',
      examples: [
        'آپ کو دعوت دی جاتی ہے...',
        'تاریخ: [تاریخ]',
        'وقت: [وقت]',
        'مقام: [مقام]'
      ]
    }
  };

  return resources[language.toLowerCase()] || resources.english;
}

/**
 * Get design templates for theme
 */
function getDesignTemplates(theme: string): {
  layout: string;
  elements: string[];
  style: string;
  recommendations: string[];
} {
  const templates: Record<string, any> = {
    wedding: {
      layout: 'Vertical card format, portrait orientation',
      elements: ['Names prominently displayed', 'Date and time', 'Venue details', 'Decorative borders'],
      style: 'Elegant and formal',
      recommendations: ['Use gold or metallic accents', 'Include floral patterns', 'Professional typography']
    },
    mundan: {
      layout: 'Vertical card, child-friendly design',
      elements: ['Child\'s name', 'Date and time', 'Venue', 'Traditional elements'],
      style: 'Traditional and celebratory',
      recommendations: ['Bright colors', 'Traditional motifs', 'Simple layout']
    },
    festival: {
      layout: 'Festive horizontal or vertical',
      elements: ['Festival name', 'Date', 'Celebration details', 'Decorative elements'],
      style: 'Colorful and vibrant',
      recommendations: ['Use festival-specific colors', 'Include traditional symbols', 'Bold typography']
    },
    religious: {
      layout: 'Formal vertical layout',
      elements: ['Event name', 'Date and time', 'Venue', 'Religious symbols'],
      style: 'Reverent and traditional',
      recommendations: ['Respectful design', 'Religious motifs', 'Formal typography']
    },
    sokh_sabha: {
      layout: 'Informative horizontal or vertical',
      elements: ['Speaker name', 'Topic', 'Date and time', 'Venue'],
      style: 'Professional and informative',
      recommendations: ['Clear typography', 'Minimal design', 'Focus on information']
    }
  };

  return templates[theme.toLowerCase()] || templates.wedding;
}

/**
 * Get color scheme based on religion and theme
 */
function getColorScheme(religion: string, theme: string): {
  primary: string[];
  secondary: string[];
  accent: string[];
  description: string;
} {
  const schemes: Record<string, Record<string, any>> = {
    hindu: {
      wedding: {
        primary: ['#FFD700', '#FF0000'], // Gold and Red
        secondary: ['#FFA500', '#FFE4B5'],
        accent: ['#000000', '#FFFFFF'],
        description: 'Traditional red and gold for Hindu weddings'
      },
      mundan: {
        primary: ['#FFD700', '#FF6B6B'],
        secondary: ['#FFE66D', '#FF8C94'],
        accent: ['#4ECDC4'],
        description: 'Bright and celebratory colors'
      }
    },
    muslim: {
      wedding: {
        primary: ['#228B22', '#FFD700'], // Green and Gold
        secondary: ['#32CD32', '#FFE4B5'],
        accent: ['#000000', '#FFFFFF'],
        description: 'Elegant green and gold for Islamic weddings'
      }
    },
    christian: {
      wedding: {
        primary: ['#F5F5DC', '#FFB6C1'], // Beige and Pink
        secondary: ['#FFF8DC', '#FFE4E1'],
        accent: ['#8B4513', '#FFFFFF'],
        description: 'Soft pastels for Christian weddings'
      }
    },
    sikh: {
      wedding: {
        primary: ['#FFD700', '#FF6B00'], // Gold and Orange
        secondary: ['#FFE4B5', '#FFA500'],
        accent: ['#000000', '#FFFFFF'],
        description: 'Vibrant gold and orange for Sikh weddings'
      }
    }
  };

  const religionSchemes = schemes[religion.toLowerCase()] || schemes.hindu;
  return religionSchemes[theme.toLowerCase()] || religionSchemes.wedding || {
    primary: ['#000000', '#FFFFFF'],
    secondary: ['#808080'],
    accent: ['#FFD700'],
    description: 'Classic black and white with gold accents'
  };
}

