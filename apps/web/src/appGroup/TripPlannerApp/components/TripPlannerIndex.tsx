import React, { useState, useEffect } from 'react';
import { TripPlanForm } from './TripPlanForm.jsx';
import { TripPlannerApp } from './TripPlannerApp.jsx';
import { tripService } from '../services/tripService.js';
import ResizableLayout from '../../../components/ResizableLayout.js';
import { aiCache } from '../../../utils/storage.js';
import { buildTripPayload } from '../utils/buildTripPayload.js';
import { LoadingAnimation } from '../../components/LoadingAnimation.js';
import { SaveControls } from '../../../components/SaveControls.js';
import { SavedArtifact } from '@gem/shared';
import { useShell } from '../../../context/ShellContext.js';

const APP_NAME = "trip-planner";

export const TripPlannerIndex = () => {
  const { setHeaderActions } = useShell();
  const [tripData, setTripData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDataLoaded = (artifact: SavedArtifact) => {
    try {
      const parsedData = JSON.parse(artifact.data);
      setTripData(parsedData);
      setError(null);
    } catch (err) {
      console.error('Failed to parse trip data:', err);
      setError('Failed to load trip data');
    }
  };

  const handleCreateNew = () => {
    setTripData(null);
    setError(null);
  };

  // Update header actions
  useEffect(() => {
    setHeaderActions(
      <>
        <SaveControls
          appName="tripplanner"
          currentData={tripData ? JSON.stringify(tripData) : ''}
          dataType="trip"
          onDataLoaded={handleDataLoaded}
          onCreateNew={handleCreateNew}
        />
      </>
    );
    return () => setHeaderActions(null);
  }, [tripData]);

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

      {loading ? (
        <LoadingAnimation
          app="trip"
          customMessage="🗺️ AI is crafting your perfect travel adventure..."
        />
      ) : (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <TripPlannerApp data={tripData} />
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
