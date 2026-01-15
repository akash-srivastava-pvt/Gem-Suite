import { callGemini } from "../proxies/gemini2.js";
import { getApiKey } from "../utility/helper.js";

export const GeminiTransformService = {
  async generateATSResume(anonymisedData: any): Promise<any> {
    const apiKey = await getApiKey();
    const prompt = `
      You are a professional resume writer and ATS optimization expert.
      Using the provided anonymised candidate data, generate a COMPLETE and ATS-friendly resume.

      Data:
      ${JSON.stringify(anonymisedData, null, 2)}

      Rules:
      - Include ALL sections present in the input:
        - Name (CANDIDATE_NAME)
        - Contacts (placeholders)
        - Links
        - Work History
        - Education
        - Personal Projects
        - Skills
      - Do NOT invent experience or hallucinate achievements.
      - Rewrite content professionally for a student / early-career tone.
      - Optimize for keyword scanning using clear bullet points.
      - Maintain neutral professional phrasing; neutralize any abusive or sensitive language.

      Output format:
      Return STRICT JSON in the following structure (no markdown formatting):
      {
        "name": "CANDIDATE_NAME",
        "summary": "...",
        "contacts": [{"key": "string", "value": "string"}],
        "links": [{"key": "string", "value": "string"}],
        "skills": ["..."],
        "work_experience": [
          {
            "title": "...",
            "organization": "...",
            "duration": "...",
            "highlights": ["..."]
          }
        ],
        "education": [
          {
            "degree": "...",
            "institution": "...",
            "details": "..."
          }
        ],
        "projects": [
          {
            "name": "...",
            "description": "..."
          }
        ]
      }
    `;
    const response = await callGemini(apiKey, prompt);
    return JSON.parse(response.data.replace(/```json|```/g, "").trim());
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
      Return a JSON object: {"content": "the cover letter text"} (no markdown).
    `;
    const response = await callGemini(apiKey, prompt);
    return JSON.parse(response.data.replace(/```json|```/g, "").trim());
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
      Return a JSON object: {"content": "the SOP text"} (no markdown).
    `;
    const response = await callGemini(apiKey, prompt);
    return JSON.parse(response.data.replace(/```json|```/g, "").trim());
  }
};
