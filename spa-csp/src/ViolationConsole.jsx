import React, { useEffect, useState } from 'react';

const boxStyle = {
  background: '#1a1a2e',
  color: '#e0e0e0',
  fontFamily: 'monospace',
  fontSize: '12px',
  padding: '12px 14px',
  borderRadius: '6px',
  overflowX: 'auto',
  marginBottom: '16px',
  minHeight: '52px',
};

const emptyStyle = { color: '#7c8', fontStyle: 'italic' };
const errorStyle = { color: '#ff6b8a', whiteSpace: 'pre-wrap' };

/**
 * Surfaces CSP violations on the page itself.
 *
 * The browser fires 'securitypolicyviolation' on every refusal, carrying the
 * directive that blocked it and the URI that was blocked — the same information
 * the DevTools console shows, but readable without opening DevTools.
 */
export default function ViolationConsole({ emptyMessage }) {
  const [violations, setViolations] = useState([]);

  useEffect(() => {
    const onViolation = (e) => {
      setViolations((prev) => [
        ...prev,
        {
          directive: e.violatedDirective,
          blockedURI: e.blockedURI,
          // effectiveDirective names the directive that actually applied, which
          // differs from violatedDirective when the block came from a
          // default-src fallback rather than an explicit directive.
          effective: e.effectiveDirective,
          // The policy the browser actually enforced. If this does not match
          // the policy shown on the page, something downstream of the server
          // is injecting its own CSP — typically a browser extension.
          source: e.originalPolicy || '(none reported)',
        },
      ]);
    };

    document.addEventListener('securitypolicyviolation', onViolation);
    return () =>
      document.removeEventListener('securitypolicyviolation', onViolation);
  }, []);

  return (
    <pre style={boxStyle}>
      {violations.length === 0 ? (
        <span style={emptyStyle}>{emptyMessage}</span>
      ) : (
        violations.map((v, i) => (
          <div key={i} style={errorStyle}>
            {`Blocked '${v.blockedURI}'\n  violated: ${v.directive}\n  effective: ${v.effective}\n  source: ${v.source}`}
          </div>
        ))
      )}
    </pre>
  );
}
