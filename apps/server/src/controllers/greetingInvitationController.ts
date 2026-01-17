import { Request, Response } from 'express';
import { ValidationError } from '../utility/errors.js';
import { getApiKey } from '../utility/helper.js';
import { LoggerModel } from '../models/loggerModel.js';
import { agentOrchestrator } from '../orchestration/agentOrchestrator.js';
import { invitationMakerWorkflow } from '../orchestration/workflows.js';

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
        // 2. API Key Retrieval
        // ─────────────────────────────────────────
        const apiKey = await getApiKey();
        if (!apiKey) {
            return res.status(401).json({
                error: 'Gemini API key not found. Please activate first.',
            });
        }

        // ─────────────────────────────────────────
        // 3. Execute Workflow with MCP/A2A
        // ─────────────────────────────────────────
        LoggerModel.log(`Starting greeting card generation workflow: ${greeting}`);

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
            theme: 'greetings'
        });

        if (!result.success) {
            console.error('Workflow errors:', result.errors);
            return res.status(500).json({
                error: 'Greeting card generation workflow failed',
                details: result.errors
            });
        }

        const finalResult = {
            ...result.results.design,
            ...result.results.localization,
            ...result.results.quality
        };

        if (!finalResult?.image?.base64) {
            return res.status(502).json({
                error: 'Gemini did not return an image',
            });
        }

        LoggerModel.log(`Greeting card generation completed: ${greeting}`);

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
        console.error('Greeting card generation failed:', error);

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
