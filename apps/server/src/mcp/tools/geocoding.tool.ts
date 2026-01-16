/**
 * MCP Tool: Geocoding and Distance Calculation
 * For Trip Planner (Gem Musafir)
 */

import { MCPTool } from '../types.js';

export const GeocodingTool: MCPTool = {
  name: 'geocoding',
  description: 'Calculate distances between locations and optimize routes',
  parameters: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['distance', 'route_optimize', 'get_coordinates'],
        description: 'Action to perform'
      },
      from: { type: 'string', description: 'Starting location' },
      to: { type: 'string', description: 'Destination location' },
      places: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of places to optimize route for'
      }
    },
    required: ['action']
  },
  execute: async (params: Record<string, any>) => {
    const { action, from, to, places } = params;

    switch (action) {
      case 'distance':
        if (!from || !to) {
          throw new Error('Both "from" and "to" are required for distance calculation');
        }
        return calculateDistance(from, to);

      case 'route_optimize':
        if (!places || places.length === 0) {
          throw new Error('Places array is required for route optimization');
        }
        return optimizeRoute(places, from);

      case 'get_coordinates':
        if (!from) {
          throw new Error('Location is required');
        }
        return getCoordinates(from);

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
};

/**
 * Calculate approximate distance between two locations (in km)
 * Uses simple lat/long approximation for Indian geography
 */
function calculateDistance(from: string, to: string): { distance: number; unit: string; mode: string } {
  // Simplified distance calculation for Indian cities
  // In production, use actual geocoding API (Google Maps, OpenStreetMap, etc.)
  const cityDistances: Record<string, Record<string, number>> = {
    'Mumbai': { 'Delhi': 1400, 'Bangalore': 850, 'Kolkata': 2000, 'Chennai': 1300 },
    'Delhi': { 'Mumbai': 1400, 'Bangalore': 2200, 'Kolkata': 1500, 'Chennai': 2200 },
    'Bangalore': { 'Mumbai': 850, 'Delhi': 2200, 'Kolkata': 1900, 'Chennai': 350 },
    'Kolkata': { 'Mumbai': 2000, 'Delhi': 1500, 'Bangalore': 1900, 'Chennai': 1700 },
    'Chennai': { 'Mumbai': 1300, 'Delhi': 2200, 'Bangalore': 350, 'Kolkata': 1700 }
  };

  // Normalize city names
  const normalize = (city: string) => city.split(',')[0].trim();
  const fromCity = normalize(from);
  const toCity = normalize(to);

  // Check if we have a known distance
  if (cityDistances[fromCity]?.[toCity]) {
    const distance = cityDistances[fromCity][toCity];
    return {
      distance,
      unit: 'km',
      mode: distance < 700 ? 'train' : 'flight'
    };
  }

  // Fallback: estimate based on Indian geography
  // Average distance between major Indian cities is ~1000km
  const estimatedDistance = 800;
  return {
    distance: estimatedDistance,
    unit: 'km',
    mode: estimatedDistance < 700 ? 'train' : 'flight'
  };
}

/**
 * Optimize route order based on geographic proximity
 */
function optimizeRoute(places: string[], startLocation?: string): { optimized: string[]; totalDistance: number } {
  if (places.length <= 1) {
    return { optimized: places, totalDistance: 0 };
  }

  // Simple nearest-neighbor algorithm
  const optimized: string[] = [];
  const remaining = [...places];
  let current = startLocation || remaining.shift() || '';

  optimized.push(current);

  while (remaining.length > 0) {
    let nearest = remaining[0];
    let minDistance = Infinity;

    for (const place of remaining) {
      const dist = calculateDistance(current, place).distance;
      if (dist < minDistance) {
        minDistance = dist;
        nearest = place;
      }
    }

    optimized.push(nearest);
    remaining.splice(remaining.indexOf(nearest), 1);
    current = nearest;
  }

  // Calculate total distance
  let totalDistance = 0;
  for (let i = 0; i < optimized.length - 1; i++) {
    totalDistance += calculateDistance(optimized[i], optimized[i + 1]).distance;
  }

  return { optimized, totalDistance };
}

/**
 * Get approximate coordinates for a location
 */
function getCoordinates(location: string): { lat: number; lng: number; city: string } {
  // Simplified coordinate lookup for major Indian cities
  const cityCoords: Record<string, { lat: number; lng: number }> = {
    'Mumbai': { lat: 19.0760, lng: 72.8777 },
    'Delhi': { lat: 28.6139, lng: 77.2090 },
    'Bangalore': { lat: 12.9716, lng: 77.5946 },
    'Kolkata': { lat: 22.5726, lng: 88.3639 },
    'Chennai': { lat: 13.0827, lng: 80.2707 },
    'Hyderabad': { lat: 17.3850, lng: 78.4867 },
    'Pune': { lat: 18.5204, lng: 73.8567 },
    'Jaipur': { lat: 26.9124, lng: 75.7873 }
  };

  const normalize = (city: string) => city.split(',')[0].trim();
  const city = normalize(location);

  if (cityCoords[city]) {
    return { ...cityCoords[city], city };
  }

  // Default to center of India
  return { lat: 20.5937, lng: 78.9629, city };
}

