import React, { useState } from 'react';
import { TripPlanForm } from './TripPlanForm.jsx';
import { TripPlannerApp } from './TripPlannerApp.jsx';
import { tripService } from '../services/tripService.js';

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
        gridTemplateColumns: '380px 1fr',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* LEFT: FORM */}
      <div
        style={{
          borderRight: '1px solid #e5e7eb',
          overflowY: 'auto',
          height: '100%',
          padding: 16,
        }}
      >
        <TripPlanForm onSubmit={handleGenerateTrip} loading={loading} />
      </div>

      {/* RIGHT: PREVIEWS */}
      <div
        style={{
          position: 'relative', // for overlay
          overflowY: 'auto',
          height: '100%',
          padding: 16,
        }}
      >
        {error && (
          <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>
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
              backgroundColor: 'rgba(255,255,255,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 'bold',
              zIndex: 10,
            }}
          >
            Loading...
          </div>
        )}
      </div>
    </div>
  );
};
