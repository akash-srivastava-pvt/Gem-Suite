import html2pdf from 'html2pdf.js';
import React from 'react';

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

  return (
    <>
      {/* ================= DOWNLOAD BUTTON ================= */}
      <div style={{ textAlign: 'right', margin: '16px 0' }}>
        <button
          onClick={downloadPdf}
          style={{
            padding: '8px 16px',
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          ⬇ Download PDF
        </button>
      </div>

      {/* ================= PDF CONTENT ================= */}
      <div
        id="trip-preview"
        style={{
          padding: 32,
          maxWidth: 900,
          margin: '0 auto',
          fontFamily: 'Arial, sans-serif',
          color: '#222'
        }}
      >
        {/* ================= SUMMARY ================= */}
        <section style={{ marginBottom: 32 }}>
          <h1 style={{ marginBottom: 8 }}>Trip Itinerary</h1>

          <p>
            <strong>Route:</strong>{' '}
            {summary.startPoint} → {summary.endPoint}
          </p>

          <p>
            <strong>Trip Type:</strong> {summary.tripType}
          </p>

          <p>
            <strong>Total Days:</strong> {summary.totalDays}
          </p>

          <p>
            <strong>Cities Covered:</strong>{' '}
            {(summary.citiesCovered || []).join(', ')}
          </p>

          <p>
            <strong>Route Optimized:</strong>{' '}
            {summary.routeOptimized ? 'Yes' : 'No'}
          </p>
        </section>

        {/* ================= DAY WISE ITINERARY ================= */}
        <section>
          <h2 style={{ borderBottom: '2px solid #000', paddingBottom: 6 }}>
            Day-wise Plan
          </h2>

          {itinerary.map((day: any) => (
            <div
              key={day.day}
              style={{
                border: '1px solid #ddd',
                borderRadius: 6,
                padding: 16,
                marginBottom: 20,
                pageBreakInside: 'avoid'
              }}
            >
              <h3 style={{ marginTop: 0 }}>
                Day {day.day}: {day.city}, {day.state}
              </h3>

              <p>
                <strong>Attractions:</strong>{' '}
                {day.attractions?.length
                  ? day.attractions.join(', ')
                  : 'No attractions planned'}
              </p>

              <div style={{ marginTop: 8 }}>
                <strong>Travel</strong>
                <ul>
                  <li>Mode: {day.travel?.mode}</li>
                  <li>
                    From: {day.travel?.from} → {day.travel?.to}
                  </li>
                  <li>Duration: {day.travel?.duration}</li>
                  <li>Cost: ₹{day.travel?.cost}</li>
                </ul>
              </div>

              <div>
                <strong>Stay</strong>
                <ul>
                  <li>Type: {day.stay?.type}</li>
                  <li>Cost: ₹{day.stay?.cost}</li>
                </ul>
              </div>

              <div>
                <strong>Food</strong>
                <ul>
                  <li>Type: {day.food?.type}</li>
                  <li>Cost: ₹{day.food?.cost}</li>
                </ul>
              </div>

              <p style={{ marginTop: 8 }}>
                <strong>Daily Total Cost:</strong> ₹{day.dailyTotalCost}
              </p>
            </div>
          ))}
        </section>

        {/* ================= COST BREAKDOWN ================= */}
        <section style={{ marginTop: 32 }}>
          <h2>Cost Breakdown</h2>

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: 12
            }}
          >
            <tbody>
              {Object.entries(costBreakdown).map(([key, value]: any) => (
                <tr key={key}>
                  <td
                    style={{
                      border: '1px solid #ddd',
                      padding: 8,
                      textTransform: 'capitalize'
                    }}
                  >
                    {key.replace(/([A-Z])/g, ' $1')}
                  </td>
                  <td
                    style={{
                      border: '1px solid #ddd',
                      padding: 8,
                      textAlign: 'right'
                    }}
                  >
                    ₹{value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ================= ASSUMPTIONS ================= */}
        <section style={{ marginTop: 32 }}>
          <h2>Assumptions</h2>
          <ul>
            {assumptions.map((a: string, i: number) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </section>

        {/* ================= TIPS ================= */}
        <section style={{ marginTop: 32 }}>
          <h2>Travel Tips</h2>
          <ul>
            {tips.map((tip: string, i: number) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
};
