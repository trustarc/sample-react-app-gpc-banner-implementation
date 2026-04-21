import React, { useEffect, useRef } from 'react';

const GPC_SIGNAL_MESSAGE_TYPE = 'trustarc_gpc_signal';
const GPC_COOKIE_SYNC_REQUEST = 'trustarc_gpc_cookie_request';
const GPC_COOKIE_SYNC_RESPONSE = 'trustarc_gpc_cookie_response';
const GPC_COOKIE_NAME = 'trustarc_gpc_has_submitted_form';

const getGPCCookie = () => {
  const match = document.cookie
    .split(';')
    .find((c) => c.trim().startsWith(GPC_COOKIE_NAME + '='));
  return match ? match.trim().split('=')[1] : null;
};

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
  const iframeRef = useRef(null);

  useEffect(() => {
    const sendGPCSignal = () => {
      if (navigator.globalPrivacyControl) {
        iframeRef.current?.contentWindow?.postMessage(
          { type: GPC_SIGNAL_MESSAGE_TYPE },
          '*'
        );
      }
    };

    const onMessage = (event) => {
      // Respond to iframe's GPC signal ready ping.
      if (event.data?.type === `${GPC_SIGNAL_MESSAGE_TYPE}_request`) {
        if (navigator.globalPrivacyControl) {
          event.source?.postMessage({ type: GPC_SIGNAL_MESSAGE_TYPE }, '*');
        }
      }
      // Respond to iframe's cookie state request.
      if (event.data?.type === GPC_COOKIE_SYNC_REQUEST) {
        event.source?.postMessage(
          { type: GPC_COOKIE_SYNC_RESPONSE, state: getGPCCookie() },
          '*'
        );
      }
    };

    const iframe = iframeRef.current;
    iframe?.addEventListener('load', sendGPCSignal);
    window.addEventListener('message', onMessage);

    return () => {
      iframe?.removeEventListener('load', sendGPCSignal);
      window.removeEventListener('message', onMessage);
    };
  }, []);

  return (
    <div style={pageStyle}>
      <div style={labelStyle}>PAGE ONE</div>
      <h2 style={{ marginBottom: '8px' }}>First Page — banner inside iframe only</h2>
      <p style={{ marginBottom: '16px', color: '#555', fontSize: '14px' }}>
        The parent does not run the GPC script — no banner on this page. It detects{' '}
        <code>navigator.globalPrivacyControl</code> and sends <code>trustarc_gpc_signal</code>{' '}
        and cookie state to the iframe via postMessage. The iframe renders the banner inside.
      </p>
      <iframe
        ref={iframeRef}
        src="http://localhost:4000/page1.html"
        style={iframeStyle}
        title="GPC iframe - Page One"
      />
    </div>
  );
}
