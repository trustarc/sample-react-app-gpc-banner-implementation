import React, { useEffect } from 'react';
import { loadGPCScript } from '../gpc.js';

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
  useEffect(() => {
    loadGPCScript();
    return () => {
      window.trustarc?.irm?.destroy?.();
    };
  }, []);

  return (
    <div style={pageStyle}>
      <div style={labelStyle}>PAGE TWO</div>
      <h2 style={{ marginBottom: '8px' }}>Second Page — banner on parent and iframe</h2>
      <p style={{ marginBottom: '16px', color: '#555', fontSize: '14px' }}>
        The parent runs <code>loadGPCScript()</code> on mount — banner shows on the parent page.
        The iframe also runs its own embed script — banner shows inside the iframe too.
      </p>
      <iframe
        src="http://localhost:4000/page2.html"
        style={iframeStyle}
        title="GPC iframe - Page Two"
      />
    </div>
  );
}
