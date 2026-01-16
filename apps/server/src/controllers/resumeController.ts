import { Request, Response } from "express";
import { ResumeService } from "../services/ResumeService.js";
import { AnonymisationService } from "../services/AnonymisationService.js";
import { AuditLogService } from "../services/AuditLogService.js";
import { agentOrchestrator } from "../orchestration/agentOrchestrator.js";
import { resumeMakerWorkflow } from "../orchestration/workflows.js";
import { GeminiTransformService } from "../services/GeminiTransformService.js";

/**
 * Transform resume data from agent format to UI-expected format
 */
function transformResumeToUIFormat(data: any): any {
    // Transform structured AI output into flat UI-expected format
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

            AuditLogService.log("Starting resume generation workflow", "RESUME_ATS", false, "SUCCESS");
            
            // Execute workflow with MCP/A2A
            const result = await agentOrchestrator.executeWorkflow(resumeMakerWorkflow, {
                anonymisedData,
                jobDescription: data.jobDescription,
                industry: data.industry
            });

            // Use the formatted result as base (it has the correct UI structure)
            // If format step failed, fall back to previous steps and transform manually
            let geminiResult = result.results.format;
            
            if (!geminiResult) {
                // If format failed, use the last successful step and transform it
                const lastResult = result.results.ats || result.results.grammar || result.results.draft;
                if (!lastResult) {
                    // If no results at all, check errors
                    const errorMessages = result.errors ? Object.entries(result.errors)
                        .map(([step, err]: [string, any]) => `${step}: ${err.message || String(err)}`)
                        .join(', ') : 'Unknown error';
                    throw new Error(`Workflow failed - no results: ${errorMessages}`);
                }
                
                // Transform the result to UI format
                geminiResult = lastResult;
            }
            AuditLogService.log("Resume workflow completed", "RESUME_ATS", false, "SUCCESS");
            
            // Always transform the Gemini result to UI format before reinserting PII
            const uiFormattedResult = transformResumeToUIFormat(geminiResult);

            const finalResult = AnonymisationService.reinsertIntoJson(uiFormattedResult, originalPII);
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
