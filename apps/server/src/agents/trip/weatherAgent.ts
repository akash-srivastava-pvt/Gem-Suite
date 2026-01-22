/**
 * Weather Agent - Provides weather context for trip planning
 */

import { Agent } from "../../orchestration/types.js";

export const WeatherAgent: Agent = {
  id: "trip-weather-agent",
  name: "Weather Information Agent",
  description: "Adds weather context and recommendations to trip plans",

  execute: async (input: any, context?: any) => {
    const { itinerary, startDate } = input;

    if (!Array.isArray(itinerary)) {
      return input;
    }

    const actualStartDate =
      startDate ? new Date(startDate) : new Date();

    if (isNaN(actualStartDate.getTime())) {
      return input; // Invalid date, do not enrich
    }

    const enhancedItinerary = itinerary.map(
      (day: any, index: number) => {
        const currentDate = new Date(actualStartDate);
        currentDate.setDate(actualStartDate.getDate() + index);

        // Simple season detection for Indian geography
        const month = currentDate.getMonth() + 1;

        let season: string;
        let weatherNote: string;

        if (month >= 3 && month <= 5) {
          season = "summer";
          weatherNote =
            "Hot weather expected. Carry light clothing and stay hydrated.";
        } else if (month >= 6 && month <= 9) {
          season = "monsoon";
          weatherNote =
            "Monsoon season. Carry umbrellas and rain gear.";
        } else if (month >= 10 && month <= 11) {
          season = "post-monsoon";
          weatherNote =
            "Pleasant weather. Ideal for travel.";
        } else {
          season = "winter";
          weatherNote =
            "Cool weather. Carry warm clothing for evenings.";
        }

        return {
          ...day,
          weather: {
            season,
            note: weatherNote,
            date: currentDate.toISOString().split("T")[0]
          }
        };
      }
    );

    const weatherTips = [
      "Check local weather forecasts before travel",
      "Pack appropriate clothing for the season",
      "Carry essentials based on weather conditions"
    ];

    const existingAssumptions = Array.isArray(input.assumptions)
      ? input.assumptions
      : [];

    return {
      ...input,
      itinerary: enhancedItinerary,
      assumptions: [...existingAssumptions, ...weatherTips]
    };
  }
};
