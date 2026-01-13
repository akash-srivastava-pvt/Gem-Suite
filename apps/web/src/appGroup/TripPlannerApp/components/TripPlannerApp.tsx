import React, { useState } from 'react';
import { TripItineraryPreview } from './TripItineraryPreview.jsx';
// import { TripMap } from './TripMap.jsx';
// import { TripJsonPreview } from './TripJsonPreview.jsx';

type Tab = 'preview' | 'map' | 'json';

export const TripPlannerApp = ({ data }: { data: any }) => {
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const hasData = data?.itinerary?.length > 0;
  const tabSet = ['preview'];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
        <h2>Trip Planner</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {tabSet.map(t => (
            <button key={t} onClick={() => setActiveTab(t as Tab)}>{t}</button>
          ))}
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {!hasData && <p style={{ padding: 20 }}>No trip data</p>}
        {hasData && activeTab === 'preview' && <TripItineraryPreview data={data} />}
      </main>
    </div>
  );
};
