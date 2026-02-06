import { Request, Response } from 'express';
import { ValidationError } from '../utility/errors.js';
import { LoggerModel } from '../models/loggerModel.js';
import { AuditLogService } from '../services/AuditLogService.js';
import { agentOrchestrator } from '../orchestration/agentOrchestrator.js';
import { invitationMakerWorkflow } from '../orchestration/workflows.js';
import { saveService } from '../services/SaveService.js';

export async function GreetingInvitationController(
    req: Request,
    res: Response
) {
    try {
        const { data } = req.body;

        // ─────────────────────────────────────────
        // 1. Basic Validations
        // ─────────────────────────────────────────
        if (!data) {
            return res.status(400).json({ error: 'Request data is required' });
        }

        const {
            greeting,
            theme,
            date,
            language,
            religion,
        } = data;

        const fromName = data['fromName '] || data.fromName;

        if (!greeting || greeting.trim() === '') {
            return res
                .status(400)
                .json({ error: 'Greeting message is required' });
        }

        if (!theme || theme.trim() === '') {
            return res
                .status(400)
                .json({ error: 'Greeting theme is required' });
        }

        if (!date || date.trim() === '') {
            return res
                .status(400)
                .json({ error: 'Date is required' });
        }

        if (!fromName || fromName.trim() === '') {
            return res
                .status(400)
                .json({ error: 'From name is required' });
        }

        // ─────────────────────────────────────────
        // 2. Execute Workflow with MCP/A2A
        // ─────────────────────────────────────────
        AuditLogService.log(`Starting greeting card: ${greeting}`, 'invitation', false, "SUCCESS");

        // Track the unique flow API hit
        await saveService.trackUsage('invitation', 'api_hit', { theme: 'greetings', greetingType: theme });

        const invitationData = {
            theme: 'greetings',
            greetingType: theme,
            greeting,
            date,
            fromName,
            language,
            religion,
        };

        const result = await agentOrchestrator.executeWorkflow(invitationMakerWorkflow, {
            data: invitationData,
            theme: 'greetings',
            trackUsage: false // Disable internal tracking
        });

        if (!result.success) {
            console.error('Workflow errors:', result.errors);
            AuditLogService.log(`Greeting card failed: ${greeting}`, 'invitation', false, "FAILED");
            return res.status(500).json({
                error: 'Greeting card generation workflow failed',
                details: result.errors
            });
        }

        // Get the final result from workflow steps with null safety
        const workflowResults = result.results || {};
        const finalResult = {
            ...(workflowResults.design || {}),
            ...(workflowResults.localization || {}),
            ...(workflowResults.quality || {})
        };

        if (!finalResult?.image?.base64) {
            AuditLogService.log(`Greeting card produced no image: ${greeting}`, 'invitation', false, "FAILED");
            return res.status(502).json({
                error: 'Gemini did not return an image',
            });
        }

        AuditLogService.log(`Greeting card completed: ${greeting}`, 'invitation', false, "SUCCESS");

        // Track generation event
        await saveService.trackUsage('invitation', 'generate', {
            theme: 'greetings',
            greetingType: theme,
            language
        });

        // ─────────────────────────────────────────
        // 3. Success Response
        // ─────────────────────────────────────────
        return res.status(200).json({
            success: true,
            image: {
                mimeType: finalResult.image.mimeType,
                base64: finalResult.image.base64,
            },
            ...(finalResult.validation && { validation: finalResult.validation }),
            ...(finalResult.localization && { localization: finalResult.localization })
        });

    } catch (error: any) {
        console.error('Greeting card generation failed:', error);
        AuditLogService.log(`Greeting card error: ${error.message}`, 'invitation', false, "FAILED");
        await saveService.trackUsage('invitation', 'api_error', {
            error: error.message,
            theme: 'greetings',
            greetingType: req.body?.data?.theme
        });

        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }

        if (!res.headersSent) {
            return res.status(500).json({
                error: 'Internal Server Error during greeting card generation',
            });
        }
    }
};
