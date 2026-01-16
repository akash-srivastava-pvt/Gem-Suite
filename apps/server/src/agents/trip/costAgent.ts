/**
 * Cost Estimation Agent - Estimates trip costs
 */

import { Agent } from "../../orchestration/types.js";
import { mcpServer } from "../../mcp/mcpServer.js";

export const CostAgent: Agent = {
  id: "trip-cost-agent",
  name: "Cost Estimation Agent",
  description: "Estimates costs for travel, accommodation, and food",

  execute: async (input: any, context?: any) => {
    const { itinerary, peopleCount } = input;

    const actualPeopleCount =
      typeof peopleCount === "number" && peopleCount > 0 ? peopleCount : 1;

    if (!Array.isArray(itinerary)) {
      return input; // Pass through if no itinerary
    }

    const costBreakdown = {
      interCityTravel: 0,
      localTransportAndSightseeing: 0,
      stay: 0,
      food: 0,
      totalTripCost: 0,
      costPerPerson: 0
    };

    for (const day of itinerary) {
      // Inter-city travel
      if (day.travel?.from && day.travel?.to) {
        const distanceResult = await mcpServer.executeTool("geocoding", {
          action: "distance",
          from: day.travel.from,
          to: day.travel.to
        });

        let travelCost = 0;

        if (distanceResult?.mode === "train") {
          travelCost =
            Math.max(300, distanceResult.distance * 0.5) *
            actualPeopleCount;
        } else if (distanceResult?.mode === "flight") {
          travelCost =
            Math.max(3000, distanceResult.distance * 3) *
            actualPeopleCount;
        }

        costBreakdown.interCityTravel += travelCost;
      }

      // Accommodation
      if (typeof day.stay?.cost === "number") {
        costBreakdown.stay += day.stay.cost * actualPeopleCount;
      } else {
        costBreakdown.stay += 2000 * actualPeopleCount;
      }

      // Food
      if (typeof day.food?.cost === "number") {
        costBreakdown.food += day.food.cost * actualPeopleCount;
      } else {
        costBreakdown.food += 500 * actualPeopleCount;
      }

      // Local transport and sightseeing
      costBreakdown.localTransportAndSightseeing +=
        500 * actualPeopleCount;
    }

    costBreakdown.totalTripCost =
      costBreakdown.interCityTravel +
      costBreakdown.localTransportAndSightseeing +
      costBreakdown.stay +
      costBreakdown.food;

    costBreakdown.costPerPerson =
      costBreakdown.totalTripCost / actualPeopleCount;

    return {
      ...input,
      costBreakdown
    };
  }
};
