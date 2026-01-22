import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { geocodeCity } from '../utils/geocode.js';

/* ---------- Fix Leaflet Icons ---------- */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/* ---------- Types ---------- */
type ItineraryItem = {
  city: string;
  state: string;
  attractions?: string[];
};

type MarkerItem = {
  lat: number;
  lng: number;
  label: string;
  attractions: string[];
};

/* ---------- Component ---------- */
export const TripMap = ({ itinerary = [] }: { itinerary: ItineraryItem[] }) => {
  const [markers, setMarkers] = useState<MarkerItem[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------- Load coordinates AFTER render ---------- */
  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      const results: MarkerItem[] = [];

      for (const item of itinerary) {
        if (!item.city || !item.state) continue;

        const geo = await geocodeCity(item.city, item.state);
        if (geo) {
          results.push({
            lat: geo.lat,
            lng: geo.lng,
            label: `${item.city}, ${item.state}`,
            attractions: item.attractions ?? [],
          });
        }
      }

      if (active) {
        setMarkers(results);
        setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [itinerary]);

  /* ---------- Stable center ---------- */
  const center = useMemo<[number, number]>(() => {
    return markers.length > 0
      ? [markers[0].lat, markers[0].lng]
      : [22.9734, 78.6569]; // India center fallback
  }, [markers]);

  /* ---------- Render ---------- */
  if (loading) {
    return <div style={{ padding: 16 }}>Loading map…</div>;
  }

  if (!markers.length) {
    return <div style={{ padding: 16 }}>No coordinates found</div>;
  }

  return (
    <MapContainer
      center={center}
      zoom={6}
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {markers.map(m => (
        <Marker key={m.label} position={[m.lat, m.lng]}>
          <Popup>
            <strong>{m.label}</strong>
            {m.attractions.length > 0 && (
              <ul>
                {m.attractions.map(a => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
