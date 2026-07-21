import React from 'react';
import { FORM_URL, STRICT_CSP, format } from '../csp-policies.js';
import ViolationConsole from '../ViolationConsole.jsx';

const pageStyle = { padding: '24px', maxWidth: '900px' };

const labelStyle = {
  display: 'inline-block',
  background: '#e91e63',
  color: '#fff',
  padding: '4px 10px',
  borderRadius: '4px',
  fontSize: '12px',
  marginBottom: '12px',
  fontWeight: 'bold',
};

const textStyle = { marginBottom: '16px', color: '#555', fontSize: '14px' };

const codeBlockStyle = {
  background: '#1a1a2e',
  color: '#00d4ff',
  fontFamily: 'monospace',
  fontSize: '12px',
  padding: '12px 14px',
  borderRadius: '6px',
  overflowX: 'auto',
  marginBottom: '16px',
};

const iframeStyle = {
  width: '100%',
  height: '500px',
  border: '2px solid #e91e63',
  borderRadius: '8px',
};

const linkStyle = {
  display: 'inline-block',
  marginTop: '20px',
  background: '#009688',
  color: '#fff',
  padding: '10px 16px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '14px',
};

export default function Blocked() {
  return (
    <div style={pageStyle}>
      <div style={labelStyle}>BLOCKED — DEFAULT STRICT POLICY</div>
      <h2 style={{ marginBottom: '8px' }}>The DSR form iframe is refused</h2>
      <p style={textStyle}>
        This page is served with a strict policy that has <strong>no{' '}
        <code>frame-src</code> directive</strong>. When <code>frame-src</code> is
        absent, it falls back to <code>default-src 'self'</code> — so the browser
        refuses to load any cross-origin iframe. The TrustArc form below is
        blocked and renders as an empty box.
      </p>

      <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>
        Policy sent as a response header on this route
      </h3>
      <pre style={codeBlockStyle}>{format(STRICT_CSP)}</pre>

      <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>
        Live CSP violations on this page
      </h3>
      <ViolationConsole emptyMessage="Waiting for a violation… (if this stays empty, reload the page — violations fire during load)" />

      <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>
        The embed — blocked
      </h3>
      <iframe
        style={iframeStyle}
        src={FORM_URL}
        title="TrustArc DSR Form (blocked by CSP)"
        width="100%"
        height="100%"
        scrolling="no"
        frameBorder="no"
        allow="fullscreen"
      />

      {/* A real link, not client-side routing — the fixed policy only applies
          if the browser loads a new document. */}
      <div>
        <a href="/fixed.html" style={linkStyle}>
          See the fix →
        </a>
      </div>
    </div>
  );
}
