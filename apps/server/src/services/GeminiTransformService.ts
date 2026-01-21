import { AiProxyService } from "../ai/ai-proxy.service.js";
import { parseAIJSON, extractTextContent } from "../utility/jsonParser.js";

/**
 * Normalize skills into categorized format
 */
function normalizeSkills(skills: any): Record<string, string[]> {
  if (!skills) return {};

  // Already categorized
  if (typeof skills === "object" && !Array.isArray(skills)) {
    return Object.fromEntries(
      Object.entries(skills).map(([k, v]) => [
        k,
        Array.isArray(v) ? v.filter(Boolean) : [],
      ])
    );
  }

  // Flat array → Tools
  if (Array.isArray(skills)) {
    return {
      Tools: skills.filter(Boolean),
    };
  }

  return {};
}

export const GeminiTransformService = {
  async generateATSResume(anonymisedData: any, trackUsage: boolean = true): Promise<any> {
    const workHistory = anonymisedData.work_history || [];
    const education = anonymisedData.education || [];
    const personalProjects = anonymisedData.personal_projects || [];
    const contacts = anonymisedData.contacts || [];
    const links = anonymisedData.links || [];
    const inputSkills = normalizeSkills(anonymisedData.skills);

    const prompt = `
You are a professional resume writer and ATS optimization expert.

CRITICAL INSTRUCTIONS (MUST FOLLOW):
- DO NOT omit, remove, or merge any input data.
- DO NOT invent new experience, education, or projects.
- Preserve ALL entries from input arrays.

INPUT DATA:
${JSON.stringify(anonymisedData, null, 2)}

TASKS:
1. Rewrite content professionally using action verbs.
2. Convert work_history → work_experience with bullet highlights.
3. Convert personal_projects → projects.
4. Optimize language for ATS scanning.
5. Skills MUST be returned as array of strings:

"skills": [string]

RULES FOR SKILLS:
- Each skill must be a specific technology, tool, or methodology.
- NO generic terms like "Frontend Development".
- If skills are generic, break them into atomic keywords, but array of strings only

OUTPUT FORMAT:
Return ONLY valid JSON (no markdown, no backticks):

{
  "name": "string",
  "summary": "string",
  "contacts": [{ "key": "string", "value": "string" }],
  "links": [{ "key": "string", "value": "string" }],
  "skills": [string],
  "work_experience": [
    {
      "title": "string",
      "organization": "string",
      "duration": "string",
      "highlights": ["string"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "details": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string"
    }
  ]
}

IMPORTANT:
If input has N entries, output MUST have N entries.
`;

    const response = await AiProxyService.execute({
      appId: "resumemaker",
      modality: "text",
      payload: { prompt },
      trackUsage
    });

    const result = parseAIJSON(response.data);

    return {
      name: result.name || anonymisedData.name || "CANDIDATE_NAME",
      summary: result.summary || "",
      contacts:
        Array.isArray(result.contacts) && result.contacts.length
          ? result.contacts
          : contacts,
      links:
        Array.isArray(result.links) && result.links.length
          ? result.links
          : links,

      skills:
        Array.isArray(result.skills) && result.skills.length
          ? result.skills
          : inputSkills,

      work_experience:
        Array.isArray(result.work_experience) && result.work_experience.length
          ? result.work_experience
          : workHistory.map((w: any) => ({
            title: w.role || w.title || "",
            organization: w.company || w.organization || "",
            duration: w.duration || "",
            highlights: Array.isArray(w.description)
              ? w.description
              : typeof w.description === "string"
                ? w.description.split("\n").filter(Boolean)
                : [],
          })),

      education:
        Array.isArray(result.education) && result.education.length
          ? result.education
          : education.map((e: any) => ({
            degree: e.degree || "",
            institution: e.institution || "",
            details:
              e.details ||
              (e.year ? `${e.year}` : ""),
          })),

      projects:
        Array.isArray(result.projects) && result.projects.length
          ? result.projects
          : personalProjects.map((p: any) => ({
            name: p.title || p.name || "",
            description: p.description || "",
          })),
    };
  },

  async generateCoverLetter(anonymisedData: any, trackUsage: boolean = true): Promise<any> {
    const prompt = `
You are a professional career coach.

Generate a professional cover letter using the anonymised resume data.

RULES:
- Suitable for internships and entry-level roles.
- Reflect ALL resume sections.
- Confident but humble tone.
- Length: 3–4 concise paragraphs.
- Neutralize unsafe or sensitive language.

OUTPUT:
Return ONLY JSON:
{ "content": "plain text cover letter" }

DATA:
${JSON.stringify(anonymisedData, null, 2)}
`;

    const response = await AiProxyService.execute({
      appId: "resumemaker",
      modality: "text",
      payload: { prompt },
      trackUsage
    });

    return {
      content: extractTextContent(response.data, "content"),
    };
  },

  async generateSOP(anonymisedData: any, trackUsage: boolean = true): Promise<any> {
    const prompt = `
You are an academic writing expert.

Generate a Statement of Purpose (600–800 words).

RULES:
- Formal academic tone
- Focus on education, projects, goals
- DO NOT invent credentials
- Neutralize sensitive language

OUTPUT:
Return ONLY JSON:
{ "content": "plain text SOP" }

DATA:
${JSON.stringify(anonymisedData, null, 2)}
`;

    const response = await AiProxyService.execute({
      appId: "resumemaker",
      modality: "text",
      payload: { prompt },
      trackUsage
    });

    return {
      content: extractTextContent(response.data, "content"),
    };
  },
};
