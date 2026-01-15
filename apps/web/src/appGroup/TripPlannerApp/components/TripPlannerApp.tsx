import React, { useState } from 'react';
import { TripItineraryPreview } from './TripItineraryPreview.jsx';
// import { TripMap } from './TripMap.jsx';
// import { TripJsonPreview } from './TripJsonPreview.jsx';
import { theme } from '../../../theme.js';

type Tab = 'preview' | 'map' | 'json';

export const TripPlannerApp = ({ data }: { data: any }) => {
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const hasData = data?.itinerary?.length > 0;
  const tabSet = ['preview'];

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    borderRadius: theme.borderRadius.md,
    backgroundColor: active ? theme.colors.primary : 'transparent',
    color: active ? theme.colors.surface : theme.colors.textSecondary,
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: theme.transitions.default
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: theme.colors.background }}>
      <header style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.surface,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: theme.colors.primary }}>Trip Itinerary</h2>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: theme.colors.textSecondary }}>
            {hasData ? `Plan for ${data.summary.startPoint} to ${data.summary.endPoint}` : 'Specify details to generate a plan'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6, backgroundColor: theme.colors.background, padding: '4px', borderRadius: theme.borderRadius.md }}>
          {tabSet.map(t => (
            <button key={t} style={tabStyle(activeTab === t)} onClick={() => setActiveTab(t as Tab)}>
              {t === 'preview' ? 'Itinerary' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {!hasData && (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.colors.textSecondary,
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ fontSize: '32px' }}>🗺️</div>
            <p style={{ fontSize: '14px', fontWeight: 500 }}>Your adventure starts here.</p>
          </div>
        )}
        {hasData && activeTab === 'preview' && <TripItineraryPreview data={data} />}
      </main>
    </div>
  );
};
