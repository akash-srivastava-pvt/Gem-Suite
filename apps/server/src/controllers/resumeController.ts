import { Request, Response } from "express";
import { ResumeService } from "../services/ResumeService.js";
import { AnonymisationService } from "../services/AnonymisationService.js";
import { AuditLogService } from "../services/AuditLogService.js";
import { GeminiTransformService } from "../services/GeminiTransformService.js";
import { saveService } from "../services/SaveService.js";

function transformResumeToUIFormat(data: any): any {
    const name = data.header?.name || '';
    const contacts = data.header?.contacts || [];
    const links = data.header?.links || [];
    const summary = data.summary || '';

    const skills = [
        ...(data.skills?.Frontend || []),
        ...(data.skills?.Backend || []),
        ...(data.skills?.Tools || []),
    ];

    const work_experience = Array.isArray(data.experience)
        ? data.experience.map((exp: any) => ({
            title: exp.role || '',
            organization: exp.company || '',
            duration: exp.duration || '',
            highlights: Array.isArray(exp.description) ? exp.description : (exp.description ? exp.description.split('\n') : []),
        }))
        : [];

    const education = data.education || [];
    const projects = data.projects || [];

    const result = {
        name,
        summary,
        contacts,
        links,
        skills,
        work_experience,
        education,
        projects,
    };

    return result;
}

export const ResumeController = {
    async getResume(req: Request, res: Response) {
        try {
            const resume = await ResumeService.getResume();
            if (resume) {
                const formatted = {
                    ...resume,
                    contacts: JSON.parse(resume.contacts || "[]"),
                    links: JSON.parse(resume.links || "[]"),
                    work_history: JSON.parse(resume.work_history || "[]"),
                    education: JSON.parse(resume.education || "[]"),
                    personal_projects: JSON.parse(resume.personal_projects || "[]"),
                    skills: JSON.parse(resume.skills || "[]"),
                };
                res.json(formatted);
            } else {
                res.json(null);
            }
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    async saveResume(req: Request, res: Response) {
        try {
            const data = req.body;
            const dbData = {
                name: data.name,
                contacts: JSON.stringify(data.contacts),
                links: JSON.stringify(data.links),
                work_history: JSON.stringify(data.work_history),
                education: JSON.stringify(data.education),
                personal_projects: JSON.stringify(data.personal_projects),
                skills: JSON.stringify(data.skills),
                cover_letter_para: data.cover_letter_para,
            };
            await ResumeService.createOrUpdateResume(dbData);
            AuditLogService.log("Resume Save: Data saved to database", "resumemaker", false, "SUCCESS", { fileReference: data.name });
            res.json({ success: true });
        } catch (error: any) {
            AuditLogService.log(`Resume Save Error: ${error.message}`, "resumemaker", false, "FAILED");
            res.status(500).json({ error: error.message });
        }
    },

    async generateATS(req: Request, res: Response) {
        try {
            const data = req.body;

            AuditLogService.log("Resume ATS: Anonymisation started", "resumemaker", false, "SUCCESS");
            const { anonymisedData, originalPII } = AnonymisationService.anonymise(data);

            AuditLogService.log("Resume ATS: Starting generation workflow", "resumemaker", false, "SUCCESS", { fileReference: data.name });

            // Track the unique flow API hit
            await saveService.trackUsage('resumemaker', 'api_hit', { action: 'generate_ats' });

            // Use the high-quality GeminiTransformService instead of basic prompt
            const result = await GeminiTransformService.generateATSResume(anonymisedData, false);

            // Apply fallback logic to ensure all data is preserved
            if ((!result.education || result.education.length === 0) && anonymisedData.education && anonymisedData.education.length > 0) {
                result.education = anonymisedData.education;
            }

            if ((!result.work_experience || result.work_experience.length === 0) && anonymisedData.work_history && anonymisedData.work_history.length > 0) {
                result.work_experience = anonymisedData.work_history.map((exp: any) => ({
                    title: exp.role || '',
                    organization: exp.company || '',
                    duration: exp.duration || '',
                    highlights: Array.isArray(exp.description) ? exp.description : (exp.description ? exp.description.split('\n') : []),
                }));
            }

            if ((!result.projects || result.projects.length === 0) && anonymisedData.personal_projects && anonymisedData.personal_projects.length > 0) {
                result.projects = anonymisedData.personal_projects;
            }

            if ((!result.skills || result.skills.length === 0) && anonymisedData.skills && anonymisedData.skills.length > 0) {
                result.skills = anonymisedData.skills;
            }

            const finalResult = AnonymisationService.reinsertIntoJson(result, originalPII);
            AuditLogService.log("Resume ATS: Generation completed", "resumemaker", false, "SUCCESS", { fileReference: data.name });

            await saveService.trackUsage('resumemaker', 'generate', {
                action: 'generate_ats',
                hasJobDescription: !!data.jobDescription,
                industry: data.industry
            });

            res.json(finalResult);
        } catch (error: any) {
            AuditLogService.log(`Resume ATS Error: ${error.message}`, "resumemaker", false, "FAILED");
            await saveService.trackUsage('resumemaker', 'api_error', { error: error.message, action: 'generate_ats' });
            res.status(500).json({ error: error.message });
        }
    },

    async generateCoverLetter(req: Request, res: Response) {
        try {
            const data = req.body;

            const { anonymisedData, originalPII } = AnonymisationService.anonymise(data);

            AuditLogService.log("Cover Letter: Starting generation", "resumemaker", false, "SUCCESS", { fileReference: data.name });

            // Track the unique flow API hit
            await saveService.trackUsage('resumemaker', 'api_hit', { action: 'generate_cover_letter' });

            const result = await GeminiTransformService.generateCoverLetter(anonymisedData, false);

            const finalResult = AnonymisationService.reinsertIntoJson(result, originalPII);

            AuditLogService.log("Cover Letter: Generation completed", "resumemaker", false, "SUCCESS", { fileReference: data.name });

            await saveService.trackUsage('resumemaker', 'generate', {
                action: 'generate_cover_letter'
            });

            res.json(finalResult);
        } catch (error: any) {
            AuditLogService.log(`Cover Letter Error: ${error.message}`, "resumemaker", false, "FAILED");
            await saveService.trackUsage('resumemaker', 'api_error', { error: error.message, action: 'generate_cover_letter' });
            res.status(500).json({ error: error.message });
        }
    },

    async generateSOP(req: Request, res: Response) {
        try {
            const data = req.body;

            const { anonymisedData, originalPII } = AnonymisationService.anonymise(data);

            AuditLogService.log("SOP: Starting generation", "resumemaker", false, "SUCCESS", { fileReference: data.name });

            // Track the unique flow API hit
            await saveService.trackUsage('resumemaker', 'api_hit', { action: 'generate_sop' });

            const result = await GeminiTransformService.generateSOP(anonymisedData, false);

            const finalResult = AnonymisationService.reinsertIntoJson(result, originalPII);

            AuditLogService.log("SOP: Generation completed", "resumemaker", false, "SUCCESS", { fileReference: data.name });

            await saveService.trackUsage('resumemaker', 'generate', {
                action: 'generate_sop'
            });

            res.json(finalResult);
        } catch (error: any) {
            AuditLogService.log(`SOP Error: ${error.message}`, "resumemaker", false, "FAILED");
            await saveService.trackUsage('resumemaker', 'api_error', { error: error.message, action: 'generate_sop' });
            res.status(500).json({ error: error.message });
        }
    }
};
