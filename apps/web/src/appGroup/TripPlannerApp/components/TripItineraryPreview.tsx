import html2pdf from 'html2pdf.js';
import React from 'react';
import { theme } from '../../../theme.js';

export const TripItineraryPreview = ({ data }: any) => {
  if (!data) return null;

  const {
    summary = {},
    itinerary = [],
    costBreakdown = {},
    assumptions = [],
    tips = []
  } = data;

  const downloadPdf = () => {
    const element = document.getElementById('trip-preview');
    if (!element) return;

    html2pdf()
      .set({
        margin: 10,
        filename: `Trip-Itinerary-${summary.startPoint || 'Trip'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        }
      })
      .from(element)
      .save();
  };

  const sectionHeaderStyle: React.CSSProperties = {
    borderBottom: `2px solid ${theme.colors.primary}`,
    paddingBottom: '8px',
    marginBottom: '16px',
    fontSize: '16px',
    fontWeight: 700,
    color: theme.colors.primary
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: '16px',
    marginBottom: '16px',
    boxShadow: theme.shadows.card,
    border: `1px solid ${theme.colors.border}`,
    transition: theme.transitions.default
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 700,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '4px'
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* ================= ACTIONS ================= */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <button
          onClick={downloadPdf}
          style={{
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: theme.colors.primary,
            color: theme.colors.surface,
            border: 'none',
            borderRadius: theme.borderRadius.sm,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: theme.shadows.card
          }}
        >
          <span>⬇</span> Download PDF Itinerary
        </button>
      </div>

      {/* ================= PDF CONTENT ================= */}
      <div id="trip-preview" style={{ color: theme.colors.text }}>

        {/* SUMMARY SECTION */}
        <div style={{ ...cardStyle, background: theme.colors.primary, color: theme.colors.surface }}>
          <h1 style={{ fontSize: '24px', margin: '0 0 12px' }}>Trip to {summary.endPoint}</h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ ...labelStyle, color: 'rgba(255,255,255,0.6)' }}>Route</div>
              <div style={{ fontWeight: 600 }}>{summary.startPoint} → {summary.endPoint}</div>
            </div>
            <div>
              <div style={{ ...labelStyle, color: 'rgba(255,255,255,0.6)' }}>Duration</div>
              <div style={{ fontWeight: 600 }}>{summary.totalDays} Days</div>
            </div>
            <div>
              <div style={{ ...labelStyle, color: 'rgba(255,255,255,0.6)' }}>Cities</div>
              <div style={{ fontWeight: 600 }}>{(summary.citiesCovered || []).length} Cities</div>
            </div>
          </div>
        </div>

        {/* DAY WISE ITINERARY */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={sectionHeaderStyle}>Day-by-Day Journey</h2>

          {itinerary.map((day: any) => (
            <div key={day.day} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <div style={{ ...labelStyle }}>Day {day.day}</div>
                  <h3 style={{ margin: 0, fontSize: '16px', color: theme.colors.primary }}>{day.city}, {day.state}</h3>
                </div>
                <div style={{ backgroundColor: theme.colors.background, padding: '6px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: 600 }}>
                  ₹{day.dailyTotalCost}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                <div>
                  <div style={labelStyle}>✨ Attractions</div>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6 }}>
                    {day.attractions?.join(', ') || 'Scenic exploration'}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🚗</div>
                    <div>
                      <div style={{ ...labelStyle, fontSize: '10px' }}>Travel</div>
                      <div style={{ fontSize: '13px' }}>{day.travel?.mode} • {day.travel?.duration}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏨</div>
                    <div>
                      <div style={{ ...labelStyle, fontSize: '10px' }}>Stay</div>
                      <div style={{ fontSize: '13px' }}>{day.stay?.type}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* DETAILS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>

          {/* COST BREAKDOWN */}
          <section>
            <h2 style={sectionHeaderStyle}>Budgeting</h2>
            <div style={cardStyle}>
              {Object.entries(costBreakdown).map(([key, value]: any) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${theme.colors.border}` }}>
                  <span style={{ textTransform: 'capitalize', fontSize: '14px', fontWeight: 500 }}>{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span style={{ fontWeight: 600 }}>₹{value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* TIPS & ASSUMPTIONS */}
          <section>
            <h2 style={sectionHeaderStyle}>Good to Know</h2>
            <div style={{ ...cardStyle, backgroundColor: '#fdfdfd' }}>
              <div style={labelStyle}>Travel Tips</div>
              <ul style={{ margin: '8px 0 20px', paddingLeft: '20px', fontSize: '14px', color: theme.colors.textSecondary }}>
                {tips.map((tip: string, i: number) => <li key={i} style={{ marginBottom: '8px' }}>{tip}</li>)}
              </ul>

              <div style={labelStyle}>Key Assumptions</div>
              <ul style={{ margin: '8px 0 0', paddingLeft: '20px', fontSize: '13px', color: '#888' }}>
                {assumptions.map((a: string, i: number) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
