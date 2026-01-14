import React, { useState } from 'react';
import { TripPlanForm } from './TripPlanForm.jsx';
import { TripPlannerApp } from './TripPlannerApp.jsx';
import { tripService } from '../services/tripService.js';
import { theme } from '../../../theme.js';

export const TripPlannerIndex = () => {
  const [tripData, setTripData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateTrip = async (payload: any) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[CLIENT] Submitting payload:', payload);
      const response = await tripService.query(payload);
      console.log('[CLIENT] Trip response:', response);
      setTripData(response);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '500px 1fr',
        height: '100%',
        overflow: 'auto',
        backgroundColor: theme.colors.background,
        fontFamily: "'Inter', sans-serif" // Assuming global font or default
      }}
    >
      {/* LEFT: FORM SIDEBAR */}
      <div
        style={{
          borderRight: `1px solid ${theme.colors.border}`,
          overflowY: 'auto',
          height: '100%',
          padding: '24px',
          backgroundColor: theme.colors.surface,
          boxShadow: theme.shadows.card
        }}
      >
        <TripPlanForm onSubmit={handleGenerateTrip} loading={loading} />
      </div>

      {/* RIGHT: PREVIEWS */}
      <div
        style={{
          position: 'relative',
          overflowY: 'auto',
          height: '100%',
          padding: '32px',
          backgroundColor: theme.colors.background
        }}
      >
        {error && (
          <div style={{
            color: '#d32f2f',
            backgroundColor: '#ffebee',
            padding: '12px',
            borderRadius: theme.borderRadius.sm,
            marginBottom: '24px',
            border: '1px solid #ffcdd2'
          }}>
            {error}
          </div>
        )}

        <TripPlannerApp data={tripData} />

        {/* Loading overlay */}
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              color: theme.colors.primary
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>Generating Trip...</div>
            <div style={{ fontSize: '16px', color: theme.colors.textSecondary }}>Using Gem AI to plan your adventure</div>
          </div>
        )}
      </div>
    </div>
  );
};
