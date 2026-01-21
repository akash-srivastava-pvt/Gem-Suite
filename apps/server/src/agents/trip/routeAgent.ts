/**
 * Route Agent - Optimizes travel routes
 */

import { Agent } from '../../orchestration/types.js';
import { mcpServer } from '../../mcp/mcpServer.js';
import { buildTripPlannerPrompt } from '../trip.plan.agent.js';
import { AiProxyService } from '../../ai/ai-proxy.service.js';
import { parseAIJSON } from '../../utility/jsonParser.js';

export const RouteAgent: Agent = {
  id: 'trip-route-agent',
  name: 'Route Optimization Agent',
  description: 'Optimizes travel routes based on geographic proximity',
  execute: async (input: any, context?: any) => {
    const { places, startLocation, endLocation, tripType } = input;

    // Use MCP geocoding tool to optimize route
    const geocodingResult = await mcpServer.executeTool('geocoding', {
      action: 'route_optimize',
      places,
      from: startLocation
    });

    // Build prompt with optimized route
    const optimizedPlaces = geocodingResult.optimized;
    const prompt = buildTripPlannerPrompt({
      places: optimizedPlaces,
      startDate: input.startDate,
      endDate: input.endDate,
      peopleCount: input.peopleCount,
      startLocation,
      endLocation,
      tripType
    });

    const response = await AiProxyService.execute({
      appId: 'tripplanner',
      modality: 'text',
      payload: { prompt },
      trackUsage: input.trackUsage
    });

    const tripData = parseAIJSON(response.data);

    return {
      ...tripData,
      peopleCount: input.peopleCount,
      startLocation: input.startLocation,
      endLocation: input.endLocation,
      tripType: input.tripType,
      routeOptimization: {
        originalOrder: places,
        optimizedOrder: optimizedPlaces,
        totalDistance: geocodingResult.totalDistance
      }
    };
  }
};