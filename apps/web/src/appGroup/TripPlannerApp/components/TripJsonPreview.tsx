export const TripJsonPreview = ({ data }: any) => (
  <pre style={{ padding: 16, overflow: 'auto', height: '100%', background: '#0f172a', color: '#e5e7eb' }}>
    {JSON.stringify(data, null, 2)}
  </pre>
);
