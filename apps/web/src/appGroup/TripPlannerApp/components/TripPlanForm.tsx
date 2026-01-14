import React, { useState } from 'react';
import { CityAttractions, CitySelection } from './CityAttractions.js';
import { theme } from '../../../theme.js';

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

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    fontSize: '16px',
    outline: 'none',
    transition: theme.transitions.default,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '12px',
    fontWeight: 600,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em'
  };

  const handleFocus = (e: any) => {
    e.target.style.borderColor = theme.colors.primary;
    e.target.style.boxShadow = `0 0 0 2px ${theme.colors.hoverOverlay}`;
  };

  const handleBlur = (e: any) => {
    e.target.style.borderColor = theme.colors.border;
    e.target.style.boxShadow = 'none';
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit(input);
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
    >
      <div style={{ paddingBottom: '16px', borderBottom: `1px solid ${theme.colors.border}` }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.primary, margin: 0 }}>Plan Your Trip</h2>
        <p style={{ margin: '8px 0 0', color: theme.colors.textSecondary, fontSize: '14px' }}>
          Let AI guide your next adventure
        </p>
      </div>

      <div>
        <label style={labelStyle}>Trip Type</label>
        <select
          value={input.tripType}
          onChange={e => update('tripType', e.target.value)}
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          <option value="roundtrip">Round Trip</option>
          <option value="oneway">One Way</option>
        </select>
      </div>

      <div>
        <label style={labelStyle}>Start Location</label>
        <input
          placeholder="e.g. New York, NY"
          value={input.startLocation}
          onChange={e => update('startLocation', e.target.value)}
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      {input.tripType === 'oneway' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <label style={labelStyle}>End Location</label>
          <input
            placeholder="e.g. London, UK"
            value={input.endLocation}
            onChange={e => update('endLocation', e.target.value)}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Start Date</label>
          <input
            type="date"
            value={input.startDate}
            onChange={e => update('startDate', e.target.value)}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
        <div>
          <label style={labelStyle}>End Date</label>
          <input
            type="date"
            value={input.endDate}
            onChange={e => update('endDate', e.target.value)}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Travelers</label>
        <input
          type="number"
          min={1}
          value={input.peopleCount}
          onChange={e => update('peopleCount', +e.target.value)}
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      <div style={{ paddingTop: '16px', borderTop: `1px solid ${theme.colors.border}` }}>
        <CityAttractions
          value={input.cities}
          onChange={(cities: any) => update('cities', cities)}
        />
      </div>

      <div style={{ marginTop: '8px' }}>
        <button
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: theme.colors.primary,
            color: theme.colors.surface,
            padding: '14px',
            fontSize: '16px',
            fontWeight: 600,
            border: 'none',
            borderRadius: theme.borderRadius.md,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: theme.transitions.default,
            boxShadow: theme.shadows.card
          }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'none')}
        >
          {loading ? 'Generating Itinerary...' : 'Generate Trip ✈️'}
        </button>
      </div>
    </form>
  );
};
