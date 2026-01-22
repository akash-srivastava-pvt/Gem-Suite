/**
 * MCP Tool: ATS Keyword Database and Job Description Parser
 * For Resume Maker (Gem Vivrad)
 */

import { MCPTool } from '../types.js';

export const ATSTool: MCPTool = {
  name: 'ats_analyzer',
  description: 'Analyze resumes for ATS optimization and extract keywords from job descriptions',
  parameters: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['extract_keywords', 'score_resume', 'get_industry_keywords', 'parse_job_description'],
        description: 'Action to perform'
      },
      text: { type: 'string', description: 'Text to analyze (resume or job description)' },
      industry: { type: 'string', description: 'Industry sector (e.g., software, finance, healthcare)' },
      jobDescription: { type: 'string', description: 'Job description text' }
    },
    required: ['action']
  },
  execute: async (params: Record<string, any>) => {
    const { action, text, industry, jobDescription } = params;

    switch (action) {
      case 'extract_keywords':
        if (!text) throw new Error('Text is required');
        return extractKeywords(text);

      case 'score_resume':
        if (!text || !jobDescription) {
          throw new Error('Both resume text and job description are required');
        }
        return scoreResume(text, jobDescription);

      case 'get_industry_keywords':
        if (!industry) throw new Error('Industry is required');
        return getIndustryKeywords(industry);

      case 'parse_job_description':
        if (!jobDescription) throw new Error('Job description is required');
        return parseJobDescription(jobDescription);

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
};

/**
 * Extract keywords from text
 */
function extractKeywords(text: string): { keywords: string[]; skills: string[]; technologies: string[] } {
  const lowerText = text.toLowerCase();

  // Common technical skills
  const techKeywords = [
    'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'mongodb',
    'aws', 'docker', 'kubernetes', 'git', 'agile', 'scrum', 'api', 'rest',
    'typescript', 'angular', 'vue', 'html', 'css', 'machine learning', 'ai',
    'data analysis', 'cloud computing', 'devops', 'ci/cd'
  ];

  // Soft skills
  const softSkills = [
    'leadership', 'communication', 'teamwork', 'problem solving', 'analytical',
    'creative', 'detail-oriented', 'time management', 'project management',
    'collaboration', 'adaptability', 'critical thinking'
  ];

  const foundTech = techKeywords.filter(keyword => lowerText.includes(keyword));
  const foundSoft = softSkills.filter(skill => lowerText.includes(skill));

  // Extract capitalized terms (likely technologies/names)
  const capitalizedTerms = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  const technologies = capitalizedTerms.filter(term => 
    techKeywords.some(keyword => term.toLowerCase().includes(keyword))
  );

  return {
    keywords: [...foundTech, ...foundSoft],
    skills: foundSoft,
    technologies: [...foundTech, ...technologies]
  };
}

/**
 * Score resume against job description
 */
function scoreResume(resumeText: string, jobDescription: string): {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
} {
  const resumeKeywords = extractKeywords(resumeText);
  const jobKeywords = extractKeywords(jobDescription);

  const matched = resumeKeywords.keywords.filter(kw => 
    jobKeywords.keywords.some(jk => jk.toLowerCase().includes(kw.toLowerCase()) || kw.toLowerCase().includes(jk.toLowerCase()))
  );

  const missing = jobKeywords.keywords.filter(jk => 
    !resumeKeywords.keywords.some(rk => rk.toLowerCase().includes(jk.toLowerCase()) || jk.toLowerCase().includes(rk.toLowerCase()))
  );

  const score = Math.round((matched.length / Math.max(jobKeywords.keywords.length, 1)) * 100);

  const suggestions = missing.slice(0, 5).map(keyword => 
    `Consider adding: ${keyword}`
  );

  return {
    score,
    matchedKeywords: matched,
    missingKeywords: missing,
    suggestions
  };
}

/**
 * Get industry-specific keywords
 */
function getIndustryKeywords(industry: string): { keywords: string[]; commonSkills: string[] } {
  const industryKeywords: Record<string, { keywords: string[]; commonSkills: string[] }> = {
    software: {
      keywords: ['programming', 'software development', 'coding', 'algorithms', 'data structures'],
      commonSkills: ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'Git']
    },
    finance: {
      keywords: ['financial analysis', 'accounting', 'budgeting', 'forecasting', 'risk management'],
      commonSkills: ['Excel', 'Financial Modeling', 'GAAP', 'IFRS', 'Bloomberg', 'SQL']
    },
    healthcare: {
      keywords: ['patient care', 'medical records', 'HIPAA', 'clinical', 'diagnosis'],
      commonSkills: ['EMR Systems', 'Medical Terminology', 'Patient Management', 'HIPAA Compliance']
    },
    marketing: {
      keywords: ['digital marketing', 'SEO', 'social media', 'content creation', 'analytics'],
      commonSkills: ['Google Analytics', 'SEO', 'Content Marketing', 'Social Media Management', 'Email Marketing']
    }
  };

  const normalized = industry.toLowerCase();
  return industryKeywords[normalized] || {
    keywords: [],
    commonSkills: []
  };
}

/**
 * Parse job description to extract requirements
 */
function parseJobDescription(jobDescription: string): {
  requiredSkills: string[];
  preferredSkills: string[];
  experience: string;
  education: string;
  responsibilities: string[];
} {
  const keywords = extractKeywords(jobDescription);
  const lowerDesc = jobDescription.toLowerCase();

  // Extract experience requirements
  const experienceMatch = jobDescription.match(/(\d+)\+?\s*(years?|yrs?)\s*(of\s*)?(experience|exp)/i);
  const experience = experienceMatch ? `${experienceMatch[1]} years` : 'Not specified';

  // Extract education requirements
  const educationMatch = lowerDesc.match(/(bachelor|master|phd|degree|diploma|certification)/i);
  const education = educationMatch ? educationMatch[0] : 'Not specified';

  // Extract responsibilities (lines starting with bullets or numbers)
  const responsibilities = jobDescription
    .split('\n')
    .filter(line => /^[\-\*\d+\.]/.test(line.trim()))
    .map(line => line.replace(/^[\-\*\d+\.]\s*/, '').trim())
    .filter(line => line.length > 10)
    .slice(0, 10);

  return {
    requiredSkills: keywords.keywords.slice(0, 10),
    preferredSkills: keywords.keywords.slice(10, 20),
    experience,
    education,
    responsibilities
  };
}

