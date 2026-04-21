import React from 'react';

const pageStyle = { padding: '24px' };

const labelStyle = {
  display: 'inline-block',
  background: '#4caf50',
  color: '#fff',
  padding: '4px 10px',
  borderRadius: '4px',
  fontSize: '12px',
  marginBottom: '12px',
  fontWeight: 'bold',
};

const iframeStyle = {
  width: '100%',
  height: '600px',
  border: '2px solid #4caf50',
  borderRadius: '8px',
};

export default function PageOne() {
  return (
    <div style={pageStyle}>
      <div style={labelStyle}>PAGE ONE</div>
      <h2 style={{ marginBottom: '8px' }}>First Page — iframe points back to localhost:5173</h2>
      <p style={{ marginBottom: '16px', color: '#555', fontSize: '14px' }}>
        This app (localhost:4000) runs its own GPC script and iframes the original SPA (localhost:5173).
        This is the inverse of the bug scenario — the roles of parent and iframe are swapped.
      </p>
      <iframe
        src="http://localhost:5173"
        style={iframeStyle}
        title="Parent SPA iframe - Page One"
      />
    </div>
  );
}
