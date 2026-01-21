/**
 * Validation Agent - Normalizes and validates itinerary data
 */

import { Agent } from "../../orchestration/types.js";

export const ValidatorAgent: Agent = {
    id: "trip-validator-agent",
    name: "Itinerary Validation Agent",
    description: "Detects, corrects, and normalizes the itinerary for logical consistency and cost integrity",

    execute: async (input: any, context?: any) => {
        const {
            tripType,
            startLocation,
            endLocation,
            peopleCount,
            itinerary,
            summary
        } = input;

        if (!Array.isArray(itinerary)) {
            return {
                ...input,
                validationNotes: ["Invalid itinerary format: Expected an array"]
            };
        }

        const validationNotes: string[] = [];
        const correctedItinerary = JSON.parse(JSON.stringify(itinerary));
        const correctedSummary = summary ? { ...summary } : {};
        const actualPeopleCount = Math.max(1, Number(peopleCount) || 1);

        // 1. Trip Type Enforcement
        if (tripType === "roundtrip") {
            if (correctedSummary.endPoint !== startLocation) {
                correctedSummary.endPoint = startLocation;
                validationNotes.push("Roundtrip endPoint normalized to startLocation");
            }

            const lastDay = correctedItinerary[correctedItinerary.length - 1];
            const travelsToStart = lastDay?.travel?.to?.toLowerCase() === startLocation.toLowerCase();

            if (!travelsToStart && correctedItinerary.length > 0) {
                // Explicitly check if return leg exists, if not, we might need to adjust the last day
                // or add a note. Promoting logic to ensure return travel.
                if (lastDay.travel) {
                    lastDay.travel.to = startLocation;
                    validationNotes.push("Roundtrip return leg added/corrected on final day");
                }
            }

            // No hotel on final return day unless specified
            if (lastDay && (!lastDay.stay || lastDay.stay.type !== "NA")) {
                if (!lastDay.stay) lastDay.stay = {};
                lastDay.stay.type = "NA";
                lastDay.stay.cost = 0;
                validationNotes.push("Hotel stay removed from final return day");
            }
        } else if (tripType === "oneway") {
            if (endLocation && correctedSummary.endPoint !== endLocation) {
                correctedSummary.endPoint = endLocation;
                validationNotes.push("Oneway endPoint normalized to endLocation");
            }
            // Ensure no return travel to startLocation
            const lastDay = correctedItinerary[correctedItinerary.length - 1];
            if (lastDay?.travel?.to?.toLowerCase() === startLocation.toLowerCase()) {
                lastDay.travel.to = endLocation || lastDay.city;
                validationNotes.push("Removed unintended return travel in oneway trip");
            }
        }

        // 2. Day <-> City Consistency & 4. Inter-City Travel
        let lastCity = startLocation;
        for (let i = 0; i < correctedItinerary.length; i++) {
            const day = correctedItinerary[i];

            // Travel alignment
            if (day.travel) {
                if (day.travel.from?.toLowerCase() !== lastCity.toLowerCase()) {
                    day.travel.from = lastCity;
                    validationNotes.push(`Day ${i + 1}: Adjusted travel departure to match previous location`);
                }
                lastCity = day.travel.to || day.city;
            } else {
                lastCity = day.city;
            }

            // Hotel logic: A day with only inter-city travel (represented by movement but no activities in current city)
            // Usually, day.city represents the overnight stay.
            if (day.travel && !day.activities?.length && day.travel.to !== day.city) {
                // This is a travel day
                if (day.stay) {
                    day.stay.type = "NA";
                    day.stay.cost = 0;
                    validationNotes.push(`Day ${i + 1}: Normalized stay for travel-only day`);
                }
            }
        }

        // 3. Cost Integrity (Strict)
        let totalTripCost = 0;
        let totalInterCity = 0;
        let totalStay = 0;
        let totalFood = 0;

        correctedItinerary.forEach((day: any, index: number) => {
            const travelCost = Number(day.travel?.cost) || 0;
            const stayCost = Number(day.stay?.cost) || 0;
            const foodCost = Number(day.food?.cost) || 0;

            const calculatedDailyTotal = travelCost + stayCost + foodCost;

            if (day.dailyTotalCost !== calculatedDailyTotal) {
                day.dailyTotalCost = calculatedDailyTotal;
                if (!validationNotes.includes("Daily total costs recalculated for consistency")) {
                    validationNotes.push("Daily total costs recalculated for consistency");
                }
            }
            totalTripCost += calculatedDailyTotal;
            totalInterCity += travelCost;
            totalStay += stayCost;
            totalFood += foodCost;
        });

        const calculatedCostPerPerson = Math.round((totalTripCost / actualPeopleCount) * 100) / 100;

        const updateCosts = (obj: any) => {
            if (!obj) return;
            if (obj.totalTripCost !== undefined) obj.totalTripCost = totalTripCost;
            if (obj.costPerPerson !== undefined) obj.costPerPerson = calculatedCostPerPerson;
            if (obj.interCityTravel !== undefined) obj.interCityTravel = totalInterCity;
            if (obj.stay !== undefined) obj.stay = totalStay;
            if (obj.food !== undefined) obj.food = totalFood;
        };

        updateCosts(correctedSummary);
        if (input.costBreakdown) {
            updateCosts(input.costBreakdown);
        }

        if (correctedSummary.costPerPerson !== calculatedCostPerPerson) {
            validationNotes.push("Cost per person recalculated (Total / PeopleCount)");
        }

        // 5. Distance Accuracy
        if (correctedSummary.totalDistance) {
            // Trips within UP (Lucknow, Ayodhya, Varanasi) are typically < 800 km total
            if (correctedSummary.totalDistance > 3000) {
                correctedSummary.totalDistance = Math.max(150, Math.round(correctedSummary.totalDistance / 10));
                validationNotes.push("Total distance corrected for realism");
            }
        }

        // 6. Route Optimization Rules
        if (correctedSummary.routeOptimization) {
            const { originalOrder, optimizedOrder } = correctedSummary.routeOptimization;
            if (Array.isArray(originalOrder) && Array.isArray(optimizedOrder)) {
                // Trivial optimization check: if order is same, mark false
                const isTrivial = JSON.stringify(originalOrder) === JSON.stringify(optimizedOrder);
                if (isTrivial) {
                    correctedSummary.routeOptimized = false;
                }

                // Ensure no new cities injected in optimizedOrder
                const originalSet = new Set(originalOrder.map((s: string) => s.toLowerCase()));
                const hasExtraCities = optimizedOrder.some((city: string) => !originalSet.has(city.toLowerCase()));

                if (hasExtraCities) {
                    correctedSummary.routeOptimization.optimizedOrder = optimizedOrder.filter((city: string) => originalSet.has(city.toLowerCase()));
                    validationNotes.push("Removed non-input cities from optimized route");
                }
            }
        }

        // 7. Localization
        correctedSummary.localization = {
            languages: "Hindi (primary), English (secondary)",
            culturalTips: correctedSummary.culturalTips || []
        };

        // 8. Deduplication & Cleanup
        if (Array.isArray(correctedSummary.culturalTips)) {
            const originalCount = correctedSummary.culturalTips.length;
            correctedSummary.culturalTips = [...new Set(correctedSummary.culturalTips)];
            if (correctedSummary.culturalTips.length !== originalCount) {
                validationNotes.push("Duplicate cultural tips removed");
            }
        }

        // 9. Weather & Date Alignment
        correctedItinerary.forEach((day: any, i: number) => {
            if (day.weather && day.date && day.weather.date !== day.date) {
                day.weather.date = day.date;
                if (!validationNotes.includes("Weather dates aligned with itinerary days")) {
                    validationNotes.push("Weather dates aligned with itinerary days");
                }
            }
        });

        return {
            ...input,
            summary: correctedSummary,
            itinerary: correctedItinerary,
            validationNotes
        };
    }
};
