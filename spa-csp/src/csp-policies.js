/**
 * Single source of truth for both policies.
 *
 * vite.config.js imports these to set the real response header, and the pages
 * import the same constants to display them. The policy shown on screen is
 * therefore guaranteed to be the policy actually enforced — they cannot drift.
 */

// The origin serving the TrustArc DSR form.
//
// Region matters: a form hosted on .eu is NOT covered by a policy that allows
// submit-irm.trustarc.com. The mismatch fails silently — the iframe is simply
// blocked, with no hint that the region is the reason.
export const FORM_ORIGIN = 'https://submit-irm.trustarc.com';

// Same formId used by the GPC embed in spa-app/src/gpc.js and spa-iframe/src/gpc.js.
export const FORM_URL = `${FORM_ORIGIN}/services/validation/fe7532e0-3ef9-476a-9ea6-19d94c70a58b`;

/**
 * Strict default — no frame-src directive at all.
 *
 * default-src 'self' is the fallback for any fetch directive that is absent,
 * so frame-src inherits 'self'. Cross-origin iframes are refused, and the
 * TrustArc form renders as an empty box.
 */
export const STRICT_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  // ws: covers Vite's HMR socket on whatever port the dev server ends up on.
  "connect-src 'self' ws: wss:",
].join('; ');

/**
 * Fixed policy — identical, plus one directive naming the form origin.
 *
 * frame-src is what governs <iframe> sources. It is the only change required;
 * everything the form needs loads inside the iframe from its own origin, which
 * this parent policy does not govern.
 */
export const FIXED_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  // ws: covers Vite's HMR socket on whatever port the dev server ends up on.
  "connect-src 'self' ws: wss:",
  `frame-src ${FORM_ORIGIN}`,
].join('; ');

/** Pretty-printed for display, one directive per line. */
export const format = (policy) => policy.split('; ').join(';\n');
