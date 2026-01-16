/**
 * Grammar Agent - Reviews and fixes grammar
 */

import { Agent } from '../../orchestration/types.js';
import { mcpServer } from '../../mcp/mcpServer.js';
import { callGeminiWithUserPreference } from '../../utility/helper.js';
import { getApiKey } from '../../utility/helper.js';
import { extractTextContent } from '../../utility/jsonParser.js';

export const GrammarAgent: Agent = {
  id: 'resume-grammar-agent',
  name: 'Grammar Review Agent',
  description: 'Reviews and fixes grammar in resume content',
  execute: async (input: any, context?: any) => {
    // Validate input
    if (!input || !input.resume) {
      throw new Error('Grammar agent: Missing resume input');
    }

    // Get grammar rules from MCP
    const grammarRules = await mcpServer.executeTool('style_guide', {
      action: 'get_grammar_rules'
    });

    // Extract text from resume
    const resumeText = extractResumeText(input.resume);

    // Build grammar check prompt
    const prompt = `
You are a professional grammar and style editor.
Review the following resume content and fix any grammar, spelling, or style issues.

Grammar Rules to Follow:
${grammarRules.rules.map((r: any) => `- ${r.rule}: ${r.example} → ${r.correction}`).join('\n')}

Resume Content:
${resumeText}

Return the corrected resume in the same JSON structure, with all grammar and style issues fixed.
Return ONLY valid JSON, no markdown.
    `;

    const apiKey = await getApiKey();
    const response = await callGeminiWithUserPreference(apiKey, prompt);
    
    // Parse and return corrected resume
    const { parseAIJSON } = await import('../../utility/jsonParser.js');
    const corrected = parseAIJSON(response.data);
    
    // Ensure all input data is preserved - merge with corrected output
    const originalResume = input.resume || input;
    return {
      name: corrected.name || originalResume.name || '',
      summary: corrected.summary || originalResume.summary || '',
      contacts: corrected.contacts && corrected.contacts.length > 0 ? corrected.contacts : (originalResume.contacts || []),
      links: corrected.links && corrected.links.length > 0 ? corrected.links : (originalResume.links || []),
      skills: corrected.skills && corrected.skills.length > 0 ? corrected.skills : (originalResume.skills || []),
      work_experience: corrected.work_experience && corrected.work_experience.length > 0 
        ? corrected.work_experience 
        : (originalResume.work_experience || originalResume.work_history || []),
      education: corrected.education && corrected.education.length > 0 
        ? corrected.education 
        : (originalResume.education || []),
      projects: corrected.projects && corrected.projects.length > 0 
        ? corrected.projects 
        : (originalResume.projects || originalResume.personal_projects || [])
    };
  }
};

function extractResumeText(resume: any): string {
  if (!resume || typeof resume !== 'object') {
    return '';
  }
  
  const parts: string[] = [];
  
  if (resume.summary) parts.push(`Summary: ${resume.summary}`);
  if (resume.work_experience && Array.isArray(resume.work_experience)) {
    resume.work_experience.forEach((exp: any) => {
      if (exp) {
        parts.push(`${exp.title || ''} at ${exp.organization || ''}: ${exp.highlights?.join(' ') || ''}`);
      }
    });
  }
  if (resume.education && Array.isArray(resume.education)) {
    resume.education.forEach((edu: any) => {
      if (edu) {
        parts.push(`${edu.degree || ''} from ${edu.institution || ''}: ${edu.details || ''}`);
      }
    });
  }
  
  return parts.join('\n') || JSON.stringify(resume);
}

