/**
 * Formatting Agent - Structures and formats resume
 */

import { Agent } from '../../orchestration/types.js';
import { mcpServer } from '../../mcp/mcpServer.js';

export const FormattingAgent: Agent = {
  id: 'resume-formatting-agent',
  name: 'Resume Formatting Agent',
  description: 'Ensures proper structure and formatting for ATS compatibility',
  execute: async (input: any, context?: any) => {
    if (!input || typeof input !== 'object') {
      throw new Error('Formatting agent: Missing or invalid input');
    }

    // Get resume templates from MCP
    const templates = await mcpServer.getResource('resume_templates');

    // Transform to UI-expected structure
    // UI expects: work_history (not work_experience), personal_projects (not projects), skills as KeyValue[]
    
    // Convert work_experience to work_history format
    // Preserve data from both work_experience and work_history
    let work_history: any[] = [];
    if (Array.isArray(input.work_experience) && input.work_experience.length > 0) {
      work_history = input.work_experience.map((exp: any) => ({
        role: exp.title || exp.role || '',
        company: exp.organization || exp.company || '',
        duration: exp.duration || '',
        description: Array.isArray(exp.highlights) 
          ? exp.highlights.join('\n') 
          : (exp.description || '')
      }));
    } else if (Array.isArray(input.work_history) && input.work_history.length > 0) {
      work_history = input.work_history;
    }

    // Handle skills: if already structured, use it; otherwise, categorize flat skills
    let skills: { Frontend: string[], Backend: string[], Tools: string[] } = {
      Frontend: [],
      Backend: [],
      Tools: [],
    };

    if (input.skills && typeof input.skills === 'object' && 
        (input.skills.Frontend || input.skills.Backend || input.skills.Tools)) {
      // Skills are already structured from AI
      skills = {
        Frontend: input.skills.Frontend || [],
        Backend: input.skills.Backend || [],
        Tools: input.skills.Tools || [],
      };
    } else if (Array.isArray(input.skills) && input.skills.length > 0) {
      // Skills are a flat array, apply categorization
      input.skills.forEach((skill: any) => {
        const skillName = typeof skill === 'object' ? (skill.key || skill.value || '') : String(skill || '');
        if (skillName) {
          if (['React', 'Angular', 'Vue', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Redux', 'MobX', 'Frontend Development', 'UI/UX'].some(kw => skillName.includes(kw))) {
            skills.Frontend.push(skillName);
          } else if (['Node.js', 'Python', 'Java', 'Go', 'Ruby', 'Express', 'Spring', 'Django', 'SQL', 'NoSQL', 'Database', 'Backend Development', 'API Development', 'Database Management'].some(kw => skillName.includes(kw))) {
            skills.Backend.push(skillName);
          } else if (['Git', 'GitHub', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Jira', 'Figma', 'VS Code', 'Bash', 'Tools & DevOps', 'CI/CD'].some(kw => skillName.includes(kw))) {
            skills.Tools.push(skillName);
          } else if (['MVC Architecture', 'Monorepo', 'Offline-first apps', 'Data Privacy', 'Methodologies & Concepts', 'Agile'].some(kw => skillName.includes(kw))) {
            skills.Backend.push(skillName); // Assign to Backend as a general category for now
          } else {
            skills.Backend.push(skillName);
          }
        }
      });
    }


    // Convert projects to personal_projects
    // Preserve data from both projects and personal_projects
    let personal_projects: any[] = [];
    if (Array.isArray(input.projects) && input.projects.length > 0) {
      personal_projects = input.projects.map((proj: any) => ({
        name: proj.name || proj.title || '',
        description: proj.description || ''
      }));
    } else if (Array.isArray(input.personal_projects) && input.personal_projects.length > 0) {
      personal_projects = input.personal_projects;
    }

    // Ensure education has year field
    // Preserve all education entries
    let education: any[] = [];
    if (Array.isArray(input.education) && input.education.length > 0) {
      education = input.education.map((edu: any) => {
        // Extract year from details if not present
        let year = edu.year || '';
        if (!year && edu.details) {
          const yearMatch = edu.details.match(/\b(19|20)\d{2}\b/);
          if (yearMatch) year = yearMatch[0];
        }
        return {
          degree: edu.degree || '',
          institution: edu.institution || '',
          year: year,
          details: edu.details || ''
        };
      });
    }

    // Ensure contacts and links are preserved
    let contacts: any[] = [];
    if (Array.isArray(input.contacts) && input.contacts.length > 0) {
      contacts = input.contacts.map((c: any) =>
        typeof c === 'object' && c.key !== undefined
          ? { key: c.key || '', value: c.value || '' }
          : { key: '', value: String(c || '') }
      );
    }
    
    let links: any[] = [];
    if (Array.isArray(input.links) && input.links.length > 0) {
      links = input.links.map((l: any) =>
        typeof l === 'object' && l.key !== undefined
          ? { key: l.key || '', value: l.value || '' }
          : { key: '', value: String(l || '') }
      );
    }

    const formatted = {
      header: {
        name: input.name || '',
        title: input.title || 'Full Stack Software Engineer', // Placeholder for now
        contacts: contacts,
        links: links,
      },
      summary: input.summary || input.Summary || '',
      experience: work_history, // Renamed from work_history
      projects: personal_projects, // Renamed from personal_projects
      education: education,
      skills: skills, // Will be categorized in next step
    };

    // Validate ATS-friendly structure
    const atsTips = templates?.atsTips || [];
    const validation = {
      hasStandardSections: true,
      hasKeywords: Object.values(formatted.skills).some(arr => arr.length > 0),
      hasExperience: formatted.experience.length > 0,
      hasEducation: formatted.education.length > 0,
      atsTips
    };

    // Return UI-compatible structure (remove work_experience, projects if they exist)
    const result: any = {
      ...formatted,
      validation
    };

    // Remove any flat properties that might have been added by AI (like "Summary", "Software Engineer at...", etc.)
    Object.keys(result).forEach(key => {
      // Remove properties that look like they're from AI's flat output
      if (key !== 'header' && key !== 'summary' && key !== 'experience' && 
          key !== 'projects' && key !== 'education' && key !== 'skills' && 
          key !== 'validation' && key !== 'atsScore' && key !== 'optimizationNotes') {
        // Check if it's a string that looks like it should be in a section
        if (typeof result[key] === 'string' && result[key].length > 50) {
          delete result[key];
        }
      }
    });

    return result;
  }
};

