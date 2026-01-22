/**
 * ATS Scoring Agent - Optimizes resume for ATS systems
 */

import { Agent } from '../../orchestration/types.js';
import { mcpServer } from '../../mcp/mcpServer.js';
import { AiProxyService } from '../../ai/ai-proxy.service.js';
import { parseAIJSON } from '../../utility/jsonParser.js';

export const ATSScoringAgent: Agent = {
  id: 'resume-ats-scoring-agent',
  name: 'ATS Optimization Agent',
  description: 'Optimizes resume for Applicant Tracking Systems',
  execute: async (input: any, context?: any) => {
    if (!input || !input.resume) {
      throw new Error('ATS agent: Missing resume input');
    }

    const { resume, jobDescription, industry } = input;

    // Use MCP ATS tool to analyze
    const resumeText = extractResumeText(resume);

    let atsAnalysis;
    if (jobDescription) {
      atsAnalysis = await mcpServer.executeTool('ats_analyzer', {
        action: 'score_resume',
        text: resumeText,
        jobDescription
      });
    } else if (industry) {
      const industryKeywords = await mcpServer.executeTool('ats_analyzer', {
        action: 'get_industry_keywords',
        industry
      });
      atsAnalysis = {
        score: 70,
        matchedKeywords: [],
        missingKeywords: industryKeywords.keywords,
        suggestions: industryKeywords.commonSkills.map((skill: string) => `Consider adding: ${skill}`)
      };
    } else {
      atsAnalysis = await mcpServer.executeTool('ats_analyzer', {
        action: 'extract_keywords',
        text: resumeText
      });
    }

    // Build optimization prompt
    const prompt = `
You are an ATS optimization expert.
Optimize the following resume to improve its ATS score.

Current ATS Analysis:
- Score: ${atsAnalysis.score || 'N/A'}
- Missing Keywords: ${atsAnalysis.missingKeywords?.join(', ') || 'None'}
- Suggestions: ${atsAnalysis.suggestions?.join('; ') || 'None'}

Resume to Optimize:
${JSON.stringify(resume, null, 2)}

Instructions:
1. Add missing keywords naturally into the content
2. Use standard section headings
3. Optimize for keyword density without keyword stuffing
4. Maintain readability and professionalism
5. Ensure all sections are ATS-friendly

Return the optimized resume in the same JSON structure.
Return ONLY valid JSON, no markdown.
    `;

    const response = await AiProxyService.execute({
      appId: 'resumemaker',
      modality: 'text',
      payload: { prompt },
      trackUsage: input.trackUsage
    });
    const optimizedResume = parseAIJSON(response.data);

    // Ensure all input data is preserved - merge with optimized output
    const originalResume = resume;
    const result = {
      name: optimizedResume.name || originalResume.name || '',
      summary: optimizedResume.summary || originalResume.summary || '',
      contacts: optimizedResume.contacts && optimizedResume.contacts.length > 0
        ? optimizedResume.contacts
        : (originalResume.contacts || []),
      links: optimizedResume.links && optimizedResume.links.length > 0
        ? optimizedResume.links
        : (originalResume.links || []),
      skills: optimizedResume.skills && optimizedResume.skills.length > 0
        ? optimizedResume.skills
        : (originalResume.skills || []),
      work_experience: optimizedResume.work_experience && optimizedResume.work_experience.length > 0
        ? optimizedResume.work_experience
        : (originalResume.work_experience || originalResume.work_history || []),
      education: optimizedResume.education && optimizedResume.education.length > 0
        ? optimizedResume.education
        : (originalResume.education || []),
      projects: optimizedResume.projects && optimizedResume.projects.length > 0
        ? optimizedResume.projects
        : (originalResume.projects || originalResume.personal_projects || []),
      atsScore: atsAnalysis.score,
      optimizationNotes: atsAnalysis.suggestions || []
    };

    return result;
  }
};

function extractResumeText(resume: any): string {
  if (!resume || typeof resume !== 'object') {
    return '';
  }

  const parts: string[] = [];

  if (resume.summary) parts.push(resume.summary);
  if (resume.skills && Array.isArray(resume.skills)) {
    parts.push(resume.skills.join(', '));
  }
  if (resume.work_experience && Array.isArray(resume.work_experience)) {
    resume.work_experience.forEach((exp: any) => {
      if (exp) {
        parts.push(`${exp.title || ''} ${exp.organization || ''} ${exp.highlights?.join(' ') || ''}`);
      }
    });
  }

  return parts.join(' ') || JSON.stringify(resume);
}

