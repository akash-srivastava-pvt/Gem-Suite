import { Request, Response } from 'express';
import { ValidationError } from '../utility/errors.js';
import { getApiKey, callGeminiImageWithUserPreference } from '../utility/helper.js';
import { buildInvitationPrompt } from '../agents/wedding.invitation.agent.js';
import { LoggerModel } from '../models/loggerModel.js';

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
        // 2. API Key Retrieval
        // ─────────────────────────────────────────
        const apiKey = await getApiKey();
        if (!apiKey) {
            return res.status(401).json({
                error: 'Gemini API key not found. Please activate first.',
            });
        }

        // ─────────────────────────────────────────
        // 3. Build Gemini Image Prompt
        // ─────────────────────────────────────────
        const prompt = buildInvitationPrompt({
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
        });

        // ─────────────────────────────────────────
        // 4. Call Gemini (IMAGE)
        // ─────────────────────────────────────────
        const geminiResponse = await callGeminiImageWithUserPreference(apiKey, prompt);

        LoggerModel.log(`Gemini API called for wedding invitation generation: ${groomName} & ${brideName}`);

        if (!geminiResponse?.image?.base64) {
            return res.status(502).json({
                error: 'Gemini did not return an image',
            });
        }

        // ─────────────────────────────────────────
        // 5. Success Response
        // ─────────────────────────────────────────
        return res.status(200).json({
            success: true,
            image: {
                mimeType: geminiResponse.image.mimeType,
                base64: geminiResponse.image.base64,
            },
        });

    } catch (error: any) {
        console.error('Wedding invitation generation failed:', error);

        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }

        if (!res.headersSent) {
            return res.status(500).json({
                error: 'Internal Server Error during invitation generation',
            });
        }
    }
}
