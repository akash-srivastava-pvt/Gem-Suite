import { TripPromptInput } from "@gem/shared";
import { buildTripPayload } from "../utils/buildTripPayload.js";
import { persistenceService } from "../../../services/persistenceService.js";

// In dev, Vite proxies /api to localhost:3001. In prod, it's relative.
const API_BASE = '/api/v1/trip';

export const tripService = {
  query: async (data:TripPromptInput): Promise<any> => {
    // Track local usage
    persistenceService.trackLocalUsage('tripplanner', 'api_hit');

    const payloadData = buildTripPayload(data);
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: payloadData }),
    });
    if (!response.ok) throw new Error('Failed to activate user');
    const res = await response.json();

    // Track generation
    persistenceService.trackLocalUsage('tripplanner', 'generate');

    return res.data;
  }
};