import { getApiKey, callGeminiWithUserPreference } from "../utility/helper.js";
import { parseAIJSON, extractTextContent } from "../utility/jsonParser.js";

export const GeminiTransformService = {
  async generateATSResume(anonymisedData: any): Promise<any> {
    const apiKey = await getApiKey();
    
    // Extract and preserve all data from input
    const workHistory = anonymisedData.work_history || [];
    const education = anonymisedData.education || [];
    const personalProjects = anonymisedData.personal_projects || [];
    const skills = anonymisedData.skills || [];
    const contacts = anonymisedData.contacts || [];
    const links = anonymisedData.links || [];
    
    const prompt = `
      You are a professional resume writer and ATS optimization expert.
      Using the provided anonymised candidate data, generate a COMPLETE and ATS-friendly resume.
      
      CRITICAL: You MUST preserve ALL data from the input. Do NOT omit any work history, education, projects, or skills.

      Input Data:
      ${JSON.stringify(anonymisedData, null, 2)}

      Rules:
      1. PRESERVE ALL INPUT DATA:
         - Include EVERY work history entry from input (work_history array)
         - Include EVERY education entry from input (education array)
         - Include EVERY personal project from input (personal_projects array)
         - Include EVERY skill from input (skills array)
         - Include ALL contacts and links from input
      
      2. ENHANCEMENT (do not remove, only improve):
         - Rewrite descriptions professionally with action verbs
         - Convert work_history descriptions to bullet points in highlights array
         - Optimize for ATS keyword scanning
         - Maintain professional tone
         - Do NOT invent or hallucinate any new experience/education/projects
      
      3. STRUCTURE:
         - Convert work_history to work_experience format for processing
         - Convert personal_projects to projects format for processing
         - Generate a comprehensive, granular, and categorized list of *individual skills* under 'Frontend', 'Backend', and 'Tools'. Each skill entry MUST be a specific technology, methodology, or tool (e.g., 'React', 'TypeScript', 'Node.js', 'SQL', 'Git'), NOT a generic category (e.g., 'Frontend Development', 'Backend Development', 'Development Tools'). If input skills are generic, break them down into specific keywords. Do NOT use generic categories like 'Technical Skills'.

      Output format:
      IMPORTANT: Return ONLY valid JSON. Do NOT include markdown code blocks, backticks, or any formatting.
      Return STRICT JSON matching the input structure but with enhanced content:
      {
        "name": "CANDIDATE_NAME",
        "summary": "Professional summary based on ALL work history and skills provided",
        "contacts": [{"key": "string", "value": "string"}],
        "links": [{"key": "string", "value": "string"}],
        "skills": {
          "Frontend": ["skill1", "skill2"],
          "Backend": ["skill1", "skill2"],
          "Tools": ["tool1", "tool2"]
        },
        "work_experience": [
          {
            "title": "role from input",
            "organization": "company from input",
            "duration": "duration from input",
            "highlights": ["bullet point 1 from description", "bullet point 2 from description", ...]
          }
        ],
        "education": [
          {
            "degree": "degree from input",
            "institution": "institution from input",
            "details": "details from input (may include year)"
          }
        ],
        "projects": [
          {
            "name": "name/title from input",
            "description": "enhanced description from input"
          }
        ]
      }
      
      REMEMBER: Include ALL entries from input arrays. If input has 2 work_history entries, output must have 2 work_experience entries.
    `;
    const response = await callGeminiWithUserPreference(apiKey, prompt);
    const result = parseAIJSON(response.data);
    
    // Ensure all input data is preserved - merge with AI output
    return {
      name: result.name || anonymisedData.name || "CANDIDATE_NAME",
      summary: result.summary || "",
      contacts: result.contacts && result.contacts.length > 0 ? result.contacts : contacts,
      links: result.links && result.links.length > 0 ? result.links : links,
      skills: result.skills && Object.keys(result.skills).length > 0 ? result.skills : skills,
      work_experience: result.work_experience && result.work_experience.length > 0 
        ? result.work_experience 
        : workHistory.map((w: any) => ({
            title: w.role || w.title || '',
            organization: w.company || w.organization || '',
            duration: w.duration || '',
            highlights: w.description ? w.description.split('\n').filter((l: string) => l.trim()) : []
          })),
      education: result.education && result.education.length > 0 
        ? result.education 
        : education.map((e: any) => ({
            degree: e.degree || '',
            institution: e.institution || '',
            details: e.details || (e.year ? `${e.year} - ${e.details}` : '')
          })),
      projects: result.projects && result.projects.length > 0 
        ? result.projects 
        : personalProjects.map((p: any) => ({
            name: p.title || p.name || '',
            description: p.description || ''
          }))
    };
  },

  async generateCoverLetter(anonymisedData: any): Promise<any> {
    const apiKey = await getApiKey();
    const prompt = `
      You are a professional career coach.
      Using the anonymised resume data provided, generate a professional cover letter.

      Data:
      ${JSON.stringify(anonymisedData, null, 2)}

      Rules:
      - Suitable for Internships, Entry-level roles, or Graduate positions.
      - Reflect ALL resume sections.
      - Confident but humble tone.
      - Remove or rewrite abusive, sensitive, or unsafe language into neutral professional phrasing.
      - Length: 3–4 concise paragraphs.

      Output format:
      Return a JSON object: {"content": "the cover letter text"} (no markdown, no code blocks).
      The content should be plain text with proper paragraph breaks.
    `;
    const response = await callGeminiWithUserPreference(apiKey, prompt);
    const textContent = extractTextContent(response.data, 'content');
    return { content: textContent };
  },

  async generateSOP(anonymisedData: any): Promise<any> {
    const apiKey = await getApiKey();
    const prompt = `
      You are an academic writing expert specializing in university admissions.
      Using the anonymised candidate data provided, generate a formal Statement of Purpose (SOP).

      Data:
      ${JSON.stringify(anonymisedData, null, 2)}

      Rules:
      - Suitable for Undergraduate, Postgraduate, or International programs.
      - Focus on Education, Academic interests, Personal projects, and Career goals.
      - Formal academic tone (avoid corporate language).
      - Do NOT invent research or credentials.
      - Neutralize sensitive or inappropriate content.
      - Length: 600–800 words. Structured with logical paragraph flow.

      Output format:
      Return a JSON object: {"content": "the SOP text"} (no markdown, no code blocks).
      The content should be plain text with proper paragraph breaks.
    `;
    const response = await callGeminiWithUserPreference(apiKey, prompt);
    const textContent = extractTextContent(response.data, 'content');
    return { content: textContent };
  }
};
