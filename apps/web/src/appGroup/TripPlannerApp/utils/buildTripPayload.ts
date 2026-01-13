import {sanitize} from './tripSanitizer.js';

export function buildTripPayload(input: any) {
  const places: string[] = [];

  // cities coming from UI
  const cities = Array.isArray(input.cities) ? input.cities : [];

  cities.forEach((c: any) => {
    const stateCode = c.state;
    const city = c.city;
    const attractions = Array.isArray(c.attractions) ? c.attractions : [];

    attractions.forEach((a: string) => {
      if (a && city && stateCode) {
        places.push(
          `${sanitize(a)}/${sanitize(city)}/${stateCode.toUpperCase()}`
        );
      }
    });
  });

  return {
    tripType: input.tripType,
    startLocation: sanitize(input.startLocation),
    endLocation: sanitize(input.endLocation || ''),
    startDate: input.startDate,
    endDate: input.endDate,
    peopleCount: Number(input.peopleCount || 1),
    places
  };
}
