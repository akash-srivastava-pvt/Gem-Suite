import React, { useMemo, useState } from 'react';
import { CITY_DATA } from '../data/cities.js';

/* ---------- TYPES ---------- */

export type CitySelection = {
  state: string;
  city: string;
  attractions: string[];
};

type Props = {
  value: CitySelection[];
  onChange: (v: CitySelection[]) => void;
};

/* ---------- COMPONENT ---------- */

export const CityAttractions = ({ value, onChange }: Props) => {
  const [query, setQuery] = useState('');

  /* ---------- FLATTEN STATE → CITY LIST ---------- */
  const options = useMemo(() => {
    return Object.entries(CITY_DATA).flatMap(([state, cities]) =>
      cities.map(c => ({
        state,
        city: c.name
      }))
    );
  }, []);

  /* ---------- FILTER SEARCH ---------- */
  const filtered = options.filter(o =>
    `${o.city} ${o.state}`.toLowerCase().includes(query.toLowerCase())
  );

  /* ---------- ADD CITY (ATTRACTIONS AUTO ATTACHED) ---------- */
  const addCity = (state: string, city: string) => {
    if (value.some(v => v.state === state && v.city === city)) return;

    const cityObj = CITY_DATA[state]?.find(c => c.name === city);
    if (!cityObj) return;

    const next: CitySelection[] = [
      ...value,
      {
        state,
        city,
        attractions: [...cityObj.attractions]
      }
    ];

    onChange(next);
    setQuery('');
  };

  /* ---------- REMOVE CITY ---------- */
  const removeCity = (state: string, city: string) => {
    onChange(value.filter(v => !(v.state === state && v.city === city)));
  };

  /* ---------- UI ---------- */
  return (
    <div style={box}>
      <label>Cities</label>

      <input
        placeholder="Search city or state"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      {query && (
        <div style={dropdown}>
          {filtered.map(o => (
            <div
              key={`${o.state}-${o.city}`}
              style={option}
              onClick={() => addCity(o.state, o.city)}
            >
              {o.city}, {o.state}
            </div>
          ))}
        </div>
      )}

      {/* Selected cities (chips) */}
      <div style={chipWrap}>
        {value.map(v => (
          <div key={`${v.state}-${v.city}`} style={chip}>
            {v.city}, {v.state}
            <button onClick={() => removeCity(v.state, v.city)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------- STYLES ---------- */

const box: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8
};

const dropdown: React.CSSProperties = {
  border: '1px solid #ccc',
  maxHeight: 180,
  overflowY: 'auto'
};

const option: React.CSSProperties = {
  padding: 8,
  cursor: 'pointer'
};

const chipWrap: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6
};

const chip: React.CSSProperties = {
  border: '1px solid #ddd',
  padding: '4px 8px',
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  gap: 6
};
