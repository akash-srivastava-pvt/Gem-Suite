export async function geocodeCity(city: string, state: string) {
  const q = encodeURIComponent(`${city}, ${state}, India`);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${q}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data || data.length === 0) return null;

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  };
}
