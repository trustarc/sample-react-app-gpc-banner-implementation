import React from 'react';
import { FORM_URL, FORM_ORIGIN, FIXED_CSP, format } from '../csp-policies.js';
import ViolationConsole from '../ViolationConsole.jsx';

const pageStyle = { padding: '24px', maxWidth: '900px' };

const labelStyle = {
  display: 'inline-block',
  background: '#009688',
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
  whiteSpace: 'pre',
};

const addedLineStyle = { color: '#7cffb2', fontWeight: 'bold' };

const iframeStyle = {
  width: '100%',
  height: '600px',
  border: '2px solid #009688',
  borderRadius: '8px',
};

const noteStyle = {
  background: '#fff8e1',
  borderLeft: '4px solid #ffb300',
  padding: '12px 14px',
  fontSize: '13px',
  color: '#5d4037',
  marginBottom: '16px',
  borderRadius: '4px',
};

const linkStyle = {
  display: 'inline-block',
  marginTop: '20px',
  background: '#e91e63',
  color: '#fff',
  padding: '10px 16px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '14px',
};

const metaCode = `<!-- fixed.html — the policy this page loaded with -->
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self';
           script-src 'self' 'unsafe-inline';
           style-src 'self' 'unsafe-inline';
           frame-src ${FORM_ORIGIN}"
/>`;

const headerCode = `// In production, send it as a response header instead.
// nginx:
add_header Content-Security-Policy
  "default-src 'self'; frame-src ${FORM_ORIGIN}" always;

// Express:
res.setHeader(
  'Content-Security-Policy',
  "default-src 'self'; frame-src ${FORM_ORIGIN}"
);`;

export default function Fixed() {
  const lines = format(FIXED_CSP).split('\n');

  return (
    <div style={pageStyle}>
      <div style={labelStyle}>FIXED — FRAME-SRC ALLOWED</div>
      <h2 style={{ marginBottom: '8px' }}>The DSR form iframe loads</h2>
      <p style={textStyle}>
        Same policy as the blocked page, plus one directive naming the form
        origin. <code>frame-src</code> is what governs <code>&lt;iframe&gt;</code>{' '}
        sources, so this is the only change required.
      </p>

      <div style={noteStyle}>
        <strong>CSP cannot be loosened by JavaScript.</strong> A policy takes
        effect when the document is delivered and cannot be relaxed afterwards —
        that restriction is the whole point of CSP. This is also why the demo uses
        two separate HTML files rather than two routes in one SPA: client-side
        navigation does not fetch a new document, so a single-page app cannot
        change its own policy. The fix is <em>a different document with a
        corrected policy</em>.
      </div>

      <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>
        Policy sent as a response header on this route
      </h3>
      <pre style={codeBlockStyle}>
        {lines.map((line, i) => (
          <div key={i} style={line.includes('frame-src') ? addedLineStyle : undefined}>
            {line}
            {line.includes('frame-src') ? '   ← the only line that changed' : ''}
          </div>
        ))}
      </pre>

      <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>
        The code — how this page declares it
      </h3>
      <pre style={codeBlockStyle}>{metaCode}</pre>

      <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>
        The same policy in production
      </h3>
      <pre style={codeBlockStyle}>{headerCode}</pre>

      <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>
        Live CSP violations on this page
      </h3>
      <ViolationConsole emptyMessage="No violations — the iframe loaded successfully." />

      <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>
        The output — a working, interactive form
      </h3>
      <iframe
        style={iframeStyle}
        src={FORM_URL}
        title="TrustArc DSR Form (allowed by CSP)"
        width="100%"
        height="100%"
        scrolling="no"
        frameBorder="no"
        allow="fullscreen"
      />

      <div>
        <a href="/" style={linkStyle}>
          ← Back to the blocked version
        </a>
      </div>
    </div>
  );
}
