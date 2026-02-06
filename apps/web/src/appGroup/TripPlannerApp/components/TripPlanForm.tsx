import React, { useState, useEffect, useMemo } from 'react';
import { CityAttractions, CitySelection } from './CityAttractions.js';
import { formStorage } from '../../../utils/storage.js';
import { CITY_DATA } from '../data/cities.js';

const APP_NAME = "trip-planner";

const defaultFormData = {
  tripType: 'roundtrip',
  startLocation: '',
  endLocation: '',
  startDate: '',
  endDate: '',
  peopleCount: 1,
  cities: [] as CitySelection[]
};

export const TripPlanForm = ({ onSubmit, loading, initialData }: any) => {
  // Load persisted form data
  const persistedData = formStorage.load<typeof defaultFormData>(APP_NAME, defaultFormData);
  const [input, setInput] = useState<typeof defaultFormData>(initialData || persistedData);

  // Flatten CITY_DATA for dropdowns
  const cityOptions = useMemo(() => {
    return Object.entries(CITY_DATA).flatMap(([state, cities]) =>
      cities.map(c => c.name)
    ).sort();
  }, []);

  // Automatic inclusion of start and end locations in cities
  useEffect(() => {
    const locations = [input.startLocation];
    if (input.tripType === 'oneway' && input.endLocation) {
      locations.push(input.endLocation);
    }

    let updatedCities = [...input.cities];
    let changed = false;

    locations.forEach(loc => {
      if (!loc) return;

      // Find if location exists in CITY_DATA
      for (const [state, cities] of Object.entries(CITY_DATA)) {
        const cityObj = cities.find(c => c.name === loc);
        if (cityObj) {
          // Add if not already present
          if (!updatedCities.some(v => v.city === loc)) {
            updatedCities.push({
              state,
              city: loc,
              attractions: [...cityObj.attractions]
            });
            changed = true;
          }
          break;
        }
      }
    });

    if (changed) {
      setInput(prev => ({ ...prev, cities: updatedCities }));
    }
  }, [input.startLocation, input.endLocation, input.tripType]);

  // Update input if initialData changes (e.g. on load)
  useEffect(() => {
    if (initialData) {
      setInput(initialData);
    }
  }, [initialData]);

  // Persist form changes
  useEffect(() => {
    const timer = setTimeout(() => {
      formStorage.save(APP_NAME, input);
    }, 500); // Debounce saves
    return () => clearTimeout(timer);
  }, [input]);

  const update = <K extends keyof typeof input>(
    key: K,
    value:
      | typeof input[K]
      | ((prev: typeof input[K]) => typeof input[K])
  ) => {
    setInput(prev => ({
      ...prev,
      [key]:
        typeof value === 'function'
          ? (value as any)(prev[key])
          : value
    }));
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit(input);
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      <datalist id="city-list">
        {cityOptions.map(city => (
          <option key={city} value={city} />
        ))}
      </datalist>

      <div style={{ paddingBottom: '16px', borderBottom: `1px solid var(--border)` }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Plan Your Adventure</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          AI will craft a personalized travel experience for you.
        </p>
      </div>

      <div>
        <label style={labelStyle}>Trip Type</label>
        <select
          value={input.tripType}
          onChange={e => update('tripType', e.target.value)}
          style={{ width: '100%' }}
        >
          <option value="roundtrip">Round Trip</option>
          <option value="oneway">One Way</option>
        </select>
      </div>

      <div>
        <label style={labelStyle}>Start Location</label>
        <input
          placeholder="Select or enter start city"
          list="city-list"
          value={input.startLocation}
          onChange={e => update('startLocation', e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      {input.tripType === 'oneway' && (
        <div>
          <label style={labelStyle}>End Location</label>
          <input
            placeholder="Select or enter end city"
            list="city-list"
            value={input.endLocation}
            onChange={e => update('endLocation', e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Departure</label>
          <input
            type="date"
            value={input.startDate}
            onChange={e => update('startDate', e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label style={labelStyle}>Return</label>
          <input
            type="date"
            value={input.endDate}
            onChange={e => update('endDate', e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Number of Travelers</label>
        <input
          type="number"
          min={1}
          value={input.peopleCount}
          onChange={e => update('peopleCount', +e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ paddingTop: '8px' }}>
        <CityAttractions
          value={input.cities}
          onChange={(cities: any) => update('cities', cities)}
        />
      </div>

      <div style={{
        padding: '12px',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.8rem',
        color: '#b45309'
      }}>
        <span>⚠️</span>
        <span>Currently supports trip itinerary generation for India region only.</span>
      </div>

      <div style={{ marginTop: '12px' }}>
        <button
          type="submit"
          className="primary-btn"
          disabled={loading || !input.startLocation.trim() || !input.startDate || !input.endDate || input.cities.length === 0 || (input.tripType === 'oneway' && !input.endLocation.trim())}
          style={{ width: '100%', padding: '0.8rem', opacity: (loading || !input.startLocation.trim() || !input.startDate || !input.endDate || input.cities.length === 0 || (input.tripType === 'oneway' && !input.endLocation.trim())) ? 0.6 : 1 }}
        >
          {loading ? 'Curating your trip...' : 'Generate Itinerary'}
        </button>
      </div>
    </form>
  );
};
