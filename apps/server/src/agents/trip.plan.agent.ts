import { TripPromptInput } from "@gem/shared";


export function buildTripPlannerPrompt({
  places,
  startDate,
  endDate,
  peopleCount,
  startLocation,
  endLocation,
  tripType,
}: TripPromptInput): string {
  return `
You are an expert travel planner and route optimizer specializing in Indian geography.

---

### TRIP PARAMETERS
- **Start Location:** ${startLocation}
- **End Location:** ${endLocation}
- **Trip Type:** ${tripType === 'roundtrip' ? 'Round Trip (Return to Start Location)' : 'One Way (End at Destination)'}
- **Places to Visit (attraction/city/state):**
${places.map(p => `- ${p}`).join("\n")}

- **Dates:** ${startDate} to ${endDate}
- **Group Size:** ${peopleCount} People

---

### CORE PLANNING RULES
1. **Route Logic:** - Start the journey from ${startLocation}.
   - If Trip Type is "roundtrip", the final day must involve traveling back to ${startLocation} from the last visited city.
   - If Trip Type is "oneway", the journey ends at ${endLocation}.
2. **Grouping:** Group attractions by city/state to avoid backtracking.
3. **Transport Assumptions:** - Use trains for <700km and flights for >700km distances from the Start Location and between cities.
   - Use INR (₹) for all estimates based on current Indian budget-to-mid-range standards.
4. **Efficiency:** Optimize the sequence of cities based on geographical proximity to minimize total travel time.

---

### DAILY ITINERARY & COST REQUIREMENTS
Each day must include city/state, attractions, travel mode/duration/cost, stay type/cost, and food style/cost.

---

### OUTPUT FORMAT (STRICT JSON ONLY)
Return ONLY valid JSON matching this structure:

{
  "summary": {
    "startPoint": "${startLocation}",
    "endPoint": "${tripType === 'roundtrip' ? startLocation : endLocation}",
    "tripType": "${tripType}",
    "totalDays": number,
    "citiesCovered": string[],
    "routeOptimized": boolean
  },
  "itinerary": [
    {
      "day": number,
      "city": string,
      "state": string,
      "attractions": string[],
      "travel": {
        "mode": string,
        "from": string,
        "to": string,
        "duration": string,
        "cost": number
      },
      "stay": { "type": string, "cost": number },
      "food": { "type": string, "cost": number },
      "dailyTotalCost": number
    }
  ],
  "costBreakdown": {
    "interCityTravel": number,
    "localTransportAndSightseeing": number,
    "stay": number,
    "food": number,
    "totalTripCost": number,
    "costPerPerson": number
  },
  "assumptions": string[],
  "tips": string[]
}

Return ONLY JSON. No markdown backticks. No conversational text.
`;
}