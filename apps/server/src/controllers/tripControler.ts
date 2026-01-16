import { Request, Response } from 'express';
import { ValidationError } from '../utility/errors.js';
import { getApiKey } from '../utility/helper.js';
import { LoggerModel } from '../models/loggerModel.js';
import { agentOrchestrator } from '../orchestration/agentOrchestrator.js';
import { tripPlannerWorkflow } from '../orchestration/workflows.js';

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

        // 3. API Key Retrieval
        const apiKey = await getApiKey();
        if (!apiKey) {
            return res.status(401).json({ error: 'API Key not found. Please activate first.' });
        }

        // 4. Execute workflow with MCP/A2A
        LoggerModel.log(`Starting trip planning workflow: ${data.places.join(', ')}`);
        
        const result = await agentOrchestrator.executeWorkflow(tripPlannerWorkflow, { data });

        if (!result.success) {
            console.error('Workflow errors:', result.errors);
            return res.status(500).json({ 
                error: 'Trip planning workflow failed',
                details: result.errors 
            });
        }

        LoggerModel.log(`Trip planning completed: ${data.places.join(', ')}`);
        return res.status(200).json({ 
            success: true, 
            data: {
                ...result.results.localization,
                ...result.results.weather,
                ...result.results.cost,
                ...result.results.route
            }
        });

    } catch (error: any) {
        console.error('Trip planning failed:', error);

        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }

        if (!res.headersSent) {
            return res.status(500).json({ error: 'Internal Server Error during trip generation' });
        }
    }
}