import React, { useState } from 'react';
import { TripPlanForm } from './TripPlanForm.jsx';
import { TripPlannerApp } from './TripPlannerApp.jsx';
import { tripService } from '../services/tripService.js';
import ResizableLayout from '../../../components/ResizableLayout.js';
import { aiCache } from '../../../utils/storage.js';
import { buildTripPayload } from '../utils/buildTripPayload.js';

const APP_NAME = "trip-planner";

export const TripPlannerIndex = () => {
  const [tripData, setTripData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateTrip = async (payload: any) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check cache first
      const tripPayload = buildTripPayload(payload);
      const cached = aiCache.get<any>(APP_NAME, tripPayload);
      
      if (cached) {
        setTripData(cached);
        setLoading(false);
        return;
      }

      const response = await tripService.query(payload);
      
      // Cache the result
      aiCache.set(APP_NAME, tripPayload, response);
      
      setTripData(response);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate trip');
    } finally {
      setLoading(false);
    }
  };

  const LeftPanel = (
    <div style={{ padding: '2rem', height: '100%', background: 'var(--surface)' }}>
      <TripPlanForm onSubmit={handleGenerateTrip} loading={loading} />
    </div>
  );

  const RightPanel = (
    <div style={{ position: 'relative', height: '100%', padding: '24px', background: 'var(--background)' }}>
      {error && (
        <div className="card" style={{
          color: 'var(--error)',
          padding: '16px',
          marginBottom: '24px',
          borderLeft: '4px solid var(--error)',
          borderRadius: 'var(--radius-md)'
        }}>
          {error}
        </div>
      )}

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <TripPlannerApp data={tripData} />
      </div>

      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>Crafting Itinerary...</div>
          <div style={{ color: 'var(--text-secondary)' }}>Gem AI is searching for the best destinations</div>
        </div>
      )}
    </div>
  );

  return (
    <ResizableLayout
      leftPanel={LeftPanel}
      rightPanel={RightPanel}
      initialLeftWidth={400}
    />
  );
};
