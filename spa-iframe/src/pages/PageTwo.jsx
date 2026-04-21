import React from 'react';

const pageStyle = { padding: '24px' };

const labelStyle = {
  display: 'inline-block',
  background: '#f44336',
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
  border: '2px solid #f44336',
  borderRadius: '8px',
};

export default function PageTwo() {
  return (
    <div style={pageStyle}>
      <div style={labelStyle}>PAGE TWO</div>
      <h2 style={{ marginBottom: '8px' }}>Second Page — iframe points back to localhost:5173</h2>
      <p style={{ marginBottom: '16px', color: '#555', fontSize: '14px' }}>
        Navigated via React Router on localhost:4000. The iframe still points back to localhost:5173.
      </p>
      <iframe
        src="http://localhost:5173"
        style={iframeStyle}
        title="Parent SPA iframe - Page Two"
      />
    </div>
  );
}
