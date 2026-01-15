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
  const placesList = places.map((p) => `- ${p}`).join("\\n");

  const resolvedEndPoint =
    tripType === "roundtrip" ? startLocation : endLocation;

  const resolvedTripType =
    tripType === "roundtrip"
      ? "Round Trip (Return to Start Location)"
      : "One Way (End at Destination)";

  return (
`You are an expert travel planner and route optimizer specializing in Indian geography.

TRIP PARAMETERS
Start Location: ${String(startLocation)}
End Location: ${String(endLocation)}
Trip Type: ${resolvedTripType}
Places to Visit (attraction or city or state):
${placesList}
Dates: ${String(startDate)} to ${String(endDate)}
Group Size: ${Number(peopleCount)} People

CORE PLANNING RULES
1. Route Logic:
- Start the journey from ${String(startLocation)}.
- If trip type is roundtrip, the final day must involve traveling back to ${String(startLocation)}.
- If trip type is oneway, the journey ends at ${String(endLocation)}.
2. Group attractions by city or state to avoid backtracking.
3. Transport assumptions:
- Use trains for distances under 700 km.
- Use flights for distances over 700 km.
- Use INR currency for all cost estimates.
4. Optimize city sequence based on geographic proximity.

DAILY ITINERARY REQUIREMENTS
Each day must include city, state, attractions, travel mode, duration, cost, stay type, food type, and daily total cost.

OUTPUT FORMAT
Return ONLY valid JSON.
Do not include markdown, code blocks, backticks, or explanations.
Start with { and end with }.

{
  "summary": {
    "startPoint": "${String(startLocation)}",
    "endPoint": "${String(resolvedEndPoint)}",
    "tripType": "${String(tripType)}",
    "totalDays": 0,
    "citiesCovered": [],
    "routeOptimized": true
  },
  "itinerary": [
    {
      "day": 1,
      "city": "",
      "state": "",
      "attractions": [],
      "travel": {
        "mode": "",
        "from": "",
        "to": "",
        "duration": "",
        "cost": 0
      },
      "stay": { "type": "", "cost": 0 },
      "food": { "type": "", "cost": 0 },
      "dailyTotalCost": 0
    }
  ],
  "costBreakdown": {
    "interCityTravel": 0,
    "localTransportAndSightseeing": 0,
    "stay": 0,
    "food": 0,
    "totalTripCost": 0,
    "costPerPerson": 0
  },
  "assumptions": [],
  "tips": []
}`
  );
}
