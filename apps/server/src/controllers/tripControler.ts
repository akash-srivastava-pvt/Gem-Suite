import { Request, Response } from 'express'; // Types import karein';
import { ValidationError } from '../utility/errors.js';
import { getApiKey, callGeminiWithUserPreference } from '../utility/helper.js';
import { buildTripPlannerPrompt } from '../agents/trip.plan.agent.js';
import { LoggerModel } from '../models/loggerModel.js';

export async function TripController(req: Request, res: Response) {
    try {
        const { data } = req.body;
        // 1. Basic Validations
        if (!Array.isArray(data.places) || data.places.length === 0) {
            return res.status(400).json({ error: 'At least one place must be selected' });
        }

        if (!data.startDate || !data.endDate) {
            return res.status(400).json({ error: 'Start and end dates are required' });
        }

        // 2. Date Logic Validation
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        if (end <= start) {
            return res.status(400).json({ error: 'End date must be after start date' });
        }

        // 3. API Key Retrieval (from keytar/db via helper)
        const apiKey = await getApiKey();
        if (!apiKey) {
            return res.status(401).json({ error: 'API Key not found. Please activate first.' });
        }

        // 4. Build Prompt with all params
        const message = buildTripPlannerPrompt({
            places: data.places,
            startDate: data.startDate,
            endDate: data.endDate,
            peopleCount: data.peopleCount,
            startLocation: data.startLocation,
            endLocation: data.endLocation,
            tripType: data.tripType
        });

        // 5. External API Call
        const rawResponse = (await callGeminiWithUserPreference(apiKey, message)).data;

        LoggerModel.log(`Gemini API called for trip planning: ${data.places.join(', ')}`);

        // 6. JSON Sanitization (Very Important for AI responses)
        try {
            const { parseAIJSON } = await import('../utility/jsonParser.js');
            const parsedData = parseAIJSON(rawResponse);
            return res.status(200).json({ success: true, data: parsedData });
        } catch (parseError: any) {
            // Agar AI ne invalid JSON bhej diya
            console.error('AI JSON Parse Error:', parseError.message);
            console.error('Response preview:', rawResponse.substring(0, 500));
            return res.status(502).json({ 
                error: 'AI generated an invalid response format',
                details: parseError.message 
            });
        }

    } catch (error: any) {
        console.error('Trip planning failed:', error);

        // Handle Validation Errors specifically if needed
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }

        // Final safe fallback
        if (!res.headersSent) {
            return res.status(500).json({ error: 'Internal Server Error during trip generation' });
        }
    }
}