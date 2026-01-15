import { Request, Response } from "express";
import { ResumeService } from "../services/ResumeService.js";
import { AnonymisationService } from "../services/AnonymisationService.js";
import { GeminiTransformService } from "../services/GeminiTransformService.js";
import { AuditLogService } from "../services/AuditLogService.js";

export const ResumeController = {
    async getResume(req: Request, res: Response) {
        try {
            const resume = await ResumeService.getResume();
            if (resume) {
                // Parse JSON fields
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
            AuditLogService.log("Resume created / updated", "RESUME", false, "SUCCESS");
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    async generateATS(req: Request, res: Response) {
        try {
            const data = req.body;
            AuditLogService.log("Anonymisation started", "RESUME", false, "SUCCESS");
            const { anonymisedData, originalPII } = AnonymisationService.anonymise(data);

            AuditLogService.log("Data sent to Gemini", "RESUME_ATS", false, "SUCCESS");
            const geminiResult = await GeminiTransformService.generateATSResume(anonymisedData);

            AuditLogService.log("Gemini response received", "RESUME_ATS", false, "SUCCESS");
            const finalResult = AnonymisationService.reinsertIntoJson(geminiResult, originalPII);

            AuditLogService.log("PII reinsertion completed", "RESUME_ATS", false, "SUCCESS");
            res.json(finalResult);
        } catch (error: any) {
            AuditLogService.log(`AI Error: ${error.message}`, "RESUME_ATS", false, "FAILED");
            res.status(500).json({ error: error.message });
        }
    },

    async generateCoverLetter(req: Request, res: Response) {
        try {
            const data = req.body;
            const { anonymisedData, originalPII } = AnonymisationService.anonymise(data);

            AuditLogService.log("Generating Cover Letter", "COVER_LETTER", false, "SUCCESS");
            const geminiResult = await GeminiTransformService.generateCoverLetter(anonymisedData);

            const finalResult = AnonymisationService.reinsertIntoJson(geminiResult, originalPII);
            res.json(finalResult);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    async generateSOP(req: Request, res: Response) {
        try {
            const data = req.body;
            const { anonymisedData, originalPII } = AnonymisationService.anonymise(data);

            AuditLogService.log("Generating SOP", "SOP", false, "SUCCESS");
            const geminiResult = await GeminiTransformService.generateSOP(anonymisedData);

            const finalResult = AnonymisationService.reinsertIntoJson(geminiResult, originalPII);
            res.json(finalResult);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
};
