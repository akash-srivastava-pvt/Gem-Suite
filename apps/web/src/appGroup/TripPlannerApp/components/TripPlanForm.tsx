import React, { useState } from 'react';
import { CityAttractions, CitySelection } from './CityAttractions.js';

export const TripPlanForm = ({ onSubmit, loading }: any) => {
  const [input, setInput] = useState<{
    tripType: string;
    startLocation: string;
    endLocation: string;
    startDate: string;
    endDate: string;
    peopleCount: number;
    cities: CitySelection[];
  }>({
    tripType: 'roundtrip',
    startLocation: '',
    endLocation: '',
    startDate: '',
    endDate: '',
    peopleCount: 1,
    cities: []
  });

  /**
   * ✅ SAFE UPDATE
   * Supports both direct values and functional updaters
   */
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

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        console.log('[TripPlanForm] Submitting form with input:', input);
        onSubmit(input);
      }}
      style={form}
    >
      <h2>Plan Your Trip</h2>

      {/* Trip Type */}
      <label>Trip Type</label>
      <select
        value={input.tripType}
        onChange={e => update('tripType', e.target.value)}
      >
        <option value="roundtrip">Round Trip</option>
        <option value="oneway">One Way</option>
      </select>

      {/* Locations */}
      <label>Start Location</label>
      <input
        placeholder="City / State"
        value={input.startLocation}
        onChange={e => update('startLocation', e.target.value)}
      />

      {input.tripType === 'oneway' && (
        <>
          <label>End Location</label>
          <input
            placeholder="City / State"
            value={input.endLocation}
            onChange={e => update('endLocation', e.target.value)}
          />
        </>
      )}

      {/* Dates */}
      <label>Start Date</label>
      <input
        type="date"
        value={input.startDate}
        onChange={e => update('startDate', e.target.value)}
      />

      <label>End Date</label>
      <input
        type="date"
        value={input.endDate}
        onChange={e => update('endDate', e.target.value)}
      />

      {/* People */}
      <label>People</label>
      <input
        type="number"
        min={1}
        value={input.peopleCount}
        onChange={e => update('peopleCount', +e.target.value)}
      />

      {/* Cities & Attractions */}
      <CityAttractions
        value={input.cities}
        onChange={cities => update('cities', cities)}
      />

      <button disabled={loading}>
        {loading ? 'Generating...' : 'Generate Trip'}
      </button>
    </form>
  );
};

/* ---------- Styles ---------- */

const form: React.CSSProperties = {
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 10
};
