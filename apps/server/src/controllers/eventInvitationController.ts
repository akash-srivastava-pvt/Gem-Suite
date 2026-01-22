import { Request, Response } from 'express';
import { ValidationError } from '../utility/errors.js';
import { LoggerModel } from '../models/loggerModel.js';
import { agentOrchestrator } from '../orchestration/agentOrchestrator.js';
import { invitationMakerWorkflow } from '../orchestration/workflows.js';
import { saveService } from '../services/SaveService.js';

export async function EventInvitationController(
    req: Request,
    res: Response
) {
    try {
        const { data } = req.body;

        if (!data) {
            return res.status(400).json({ error: 'Request data is required' });
        }

        const {
            eventName,
            theme,
            date,
            venue,
            language,
            religion,
        } = data;

        if (!eventName) {
            return res
                .status(400)
                .json({ error: 'Event name is required' });
        }

        if (!theme) {
            return res
                .status(400)
                .json({ error: 'Event theme is required' });
        }

        if (!date || !venue) {
            return res
                .status(400)
                .json({ error: 'Date and venue are required' });
        }

        LoggerModel.log(`Starting event invitation generation workflow: ${eventName}`);

        // Track the unique flow API hit
        await saveService.trackUsage('invitation', 'api_hit', { theme: 'event', eventTheme: theme });

        const invitationData = {
            theme: 'event',
            eventName,
            eventTheme: theme,
            date,
            venue,
            language,
            religion,
            description: data.description,
            rsvpContact: data['RSVP Contact']
        };

        const result = await agentOrchestrator.executeWorkflow(invitationMakerWorkflow, {
            data: invitationData,
            theme: 'event',
            trackUsage: false // Disable internal tracking
        });

        if (!result.success) {
            console.error('Workflow errors:', result.errors);
            return res.status(500).json({
                error: 'Event invitation generation workflow failed',
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

        // Track generation event
        await saveService.trackUsage('invitation', 'generate', {
            theme: 'event',
            eventTheme: theme,
            language
        });

        LoggerModel.log(`Event invitation generation completed: ${eventName}`);

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
        console.error('Event invitation generation failed:', error);
        await saveService.trackUsage('invitation', 'api_error', {
            error: error.message,
            theme: 'event',
            eventName: req.body?.data?.eventName
        });

        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }

        if (!res.headersSent) {
            return res.status(500).json({
                error: 'Internal Server Error during event invitation generation',
            });
        }
    }
};
