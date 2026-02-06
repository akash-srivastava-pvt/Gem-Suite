import { Request, Response } from 'express';
import { ValidationError } from '../utility/errors.js';
import { LoggerModel } from '../models/loggerModel.js';
import { AuditLogService } from '../services/AuditLogService.js';
import { agentOrchestrator } from '../orchestration/agentOrchestrator.js';
import { tripPlannerWorkflow } from '../orchestration/workflows.js';
import { saveService } from '../services/SaveService.js';

export async function TripController(req: Request, res: Response) {
    try {
        const { data } = req.body;
        console.log("Trip Input Data", data);

        if (!Array.isArray(data.places) || data.places.length === 0) {
            return res.status(400).json({ error: 'At least one place must be selected' });
        }

        if (!data.startDate || !data.endDate) {
            return res.status(400).json({ error: 'Start and end dates are required' });
        }

        const start = new Date(data.startDate);
        const end = new Date(data.endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        if (end <= start) {
            return res.status(400).json({ error: 'End date must be after start date' });
        }

        AuditLogService.log(`Starting trip planning: ${data.places.join(', ')}`, 'tripplanner', false, "SUCCESS");

        // Track the unique flow API hit
        await saveService.trackUsage('tripplanner', 'api_hit', { places: data.places.length });

        // Execute the full workflow with MCP tools and agents
        const result = await agentOrchestrator.executeWorkflow(tripPlannerWorkflow, {
            data,
            trackUsage: false // Disable internal tracking in AiProxy
        });

        if (!result.success) {
            console.error('Trip workflow errors:', result.errors);
            AuditLogService.log(`Trip planning failed: ${data.places.join(', ')}`, 'tripplanner', false, "FAILED");
            return res.status(500).json({
                error: 'Trip planning workflow failed',
                details: result.errors
            });
        }

        // Get the final result from workflow steps - merge results from all successful steps
        // Priority: localization (most enhanced) > weather > cost > route (base)
        const workflowResults = result.results || {};
        const finalResult = {
            ...(workflowResults.route || {}),
            ...(workflowResults.cost || {}),
            ...(workflowResults.weather || {}),
            ...(workflowResults.localization || {}),
            ...(workflowResults.validator || {})
        };

        // Ensure we have at least some result
        if (Object.keys(finalResult).length === 0) {
            console.error('Trip workflow produced no results:', result);
            AuditLogService.log(`Trip planning produced no results: ${data.places.join(', ')}`, 'tripplanner', false, "FAILED");
            return res.status(500).json({
                error: 'Trip planning completed but produced no results',
                details: 'All workflow steps returned empty data'
            });
        }

        // Track the unique flow completion
        await saveService.trackUsage('tripplanner', 'generate', {
            places: data.places.length,
            tripType: data.tripType
        });

        AuditLogService.log(`Trip planning completed: ${data.places.join(', ')}`, 'tripplanner', false, "SUCCESS");
        return res.status(200).json({
            success: true,
            data: finalResult
        });

    } catch (error: any) {
        console.error('Trip planning failed:', error);
        AuditLogService.log(`Trip planning error: ${error.message}`, 'tripplanner', false, "FAILED");
        await saveService.trackUsage('tripplanner', 'api_error', {
            error: error.message,
            places: req.body?.data?.places?.length
        });

        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }

        if (!res.headersSent) {
            return res.status(500).json({ error: 'Internal Server Error during trip generation' });
        }
    }
}