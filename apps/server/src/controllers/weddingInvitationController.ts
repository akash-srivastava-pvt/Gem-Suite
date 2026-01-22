import { Request, Response } from 'express';
import { ValidationError } from '../utility/errors.js';
import { LoggerModel } from '../models/loggerModel.js';
import { agentOrchestrator } from '../orchestration/agentOrchestrator.js';
import { invitationMakerWorkflow } from '../orchestration/workflows.js';
import { saveService } from '../services/SaveService.js';

export async function WeddingInvitationController(
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
            groomName,
            brideName,
            date,
            time,
            venue,
            religion,
            language,
        } = data;

        if (!groomName || !brideName) {
            return res
                .status(400)
                .json({ error: 'Bride and Groom names are required' });
        }

        if (!date || !time || !venue) {
            return res
                .status(400)
                .json({ error: 'Date, time, and venue are required' });
        }

        // ─────────────────────────────────────────
        // 3. Execute Workflow with MCP/A2A
        // ─────────────────────────────────────────
        LoggerModel.log(`Starting invitation generation workflow: ${groomName} & ${brideName}`);

        // Track the unique flow API hit
        await saveService.trackUsage('invitation', 'api_hit', { theme: 'wedding', religion });

        const invitationData = {
            theme: 'wedding',
            groomName,
            brideName,
            date,
            time,
            venue,
            religion,
            language,
            familyDetails: data.familyDetails,
            rsvpContact: data.rsvpContact,
        };

        const result = await agentOrchestrator.executeWorkflow(invitationMakerWorkflow, {
            data: invitationData,
            theme: 'wedding',
            trackUsage: false // Disable internal tracking
        });

        if (!result.success) {
            console.error('Workflow errors:', result.errors);
            return res.status(500).json({
                error: 'Invitation generation workflow failed',
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
            return res.status(502).json({
                error: 'Gemini did not return an image',
            });
        }

        LoggerModel.log(`Invitation generation completed: ${groomName} & ${brideName}`);

        // Track generation event
        await saveService.trackUsage('invitation', 'generate', {
            theme: 'wedding',
            religion,
            language
        });

        // ─────────────────────────────────────────
        // 4. Success Response
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
        console.error('Wedding invitation generation failed:', error);
        await saveService.trackUsage('invitation', 'api_error', {
            error: error.message,
            theme: 'wedding',
            brideName: req.body?.data?.brideName,
            groomName: req.body?.data?.groomName
        });

        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }

        if (!res.headersSent) {
            return res.status(500).json({
                error: 'Internal Server Error during invitation generation',
            });
        }
    }
};
