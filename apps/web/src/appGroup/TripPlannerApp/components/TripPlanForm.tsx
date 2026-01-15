import React, { useState, useEffect } from 'react';
import { CityAttractions, CitySelection } from './CityAttractions.js';
import { formStorage } from '../../../utils/storage.js';

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

export const TripPlanForm = ({ onSubmit, loading }: any) => {
  // Load persisted form data
  const persistedData = formStorage.load<typeof defaultFormData>(APP_NAME, defaultFormData);
  const [input, setInput] = useState<typeof defaultFormData>(persistedData);

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
          placeholder="e.g. San Francisco, CA"
          value={input.startLocation}
          onChange={e => update('startLocation', e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      {input.tripType === 'oneway' && (
        <div>
          <label style={labelStyle}>End Location</label>
          <input
            placeholder="e.g. Kyoto, Japan"
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

      <div style={{ marginTop: '12px' }}>
        <button
          type="submit"
          className="primary-btn"
          disabled={loading}
          style={{ width: '100%', padding: '0.8rem' }}
        >
          {loading ? 'Curating your trip...' : 'Generate Itinerary'}
        </button>
      </div>
    </form>
  );
};
