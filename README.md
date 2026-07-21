# Sample React App — GPC Banner Implementation

A monorepo containing three React SPAs that demonstrate how to implement and test the TrustArc GPC (Global Privacy Control) banner across cross-origin iframes using `postMessage`, plus how Content-Security-Policy affects embedding the TrustArc DSR form.

---

## Requirements

| Tool    | Version  |
| ------- | -------- |
| Node.js | v24.14.1 |
| pnpm    | 10.13.1  |

---

## Tech Stack

|                 | Package                   |
| --------------- | ------------------------- |
| Framework       | React 18                  |
| Routing         | React Router v6           |
| Build tool      | Vite 5                    |
| Package manager | pnpm (workspace monorepo) |

---

## Project Structure

```
sample-react-app-gpc-banner-implementation/
├── package.json              # Root — workspace scripts
├── pnpm-workspace.yaml       # Declares spa-app, spa-iframe and spa-csp as packages
├── README.md
├── docs/
│   ├── GPC_POSTMESSAGE.md    # Technical deep-dive on the postMessage approach
│   └── CSP_IFRAME.md         # Why CSP blocks the DSR form iframe, and the fix
├── spa-app/                  # Main SPA (localhost:5173)
│   ├── src/
│   │   ├── gpc.js            # GPC embed helpers (loadGPCScript, reinitGPC)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── pages/
│   │       ├── PageOne.jsx   # Scenario 1: iframe banner only (postMessage sync)
│   │       ├── PageTwo.jsx   # Scenario 2: banner on parent and iframe
│   │       └── PageThree.jsx # Scenario 3: redirect to spa-iframe
│   └── index.html
├── spa-iframe/               # Iframe host app (localhost:4000)
│   ├── src/
│   │   ├── gpc.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── pages/
│   │       ├── PageOne.jsx   # Iframes back to localhost:5173
│   │       ├── PageTwo.jsx
│   │       └── PageThree.jsx
│   ├── public/
│   │   └── page5.html        # Static iframe page for testing
│   └── index.html
└── spa-csp/                  # CSP demo app (localhost:5174)
    ├── src/
    │   ├── csp-policies.js   # Both policies — single source of truth
    │   ├── ViolationConsole.jsx  # Shows CSP violations on the page itself
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── pages/
    │       ├── Blocked.jsx   # Strict default — iframe refused
    │       └── Fixed.jsx     # frame-src added — iframe loads
    ├── vite.config.js        # Sends real CSP response headers per route
    └── index.html
```

---

## Getting Started

Install all dependencies from the repo root:

```bash
pnpm install
```

Start both apps in parallel:

```bash
pnpm run start
```

| App                      | URL                   |
| ------------------------ | --------------------- |
| spa-app (main SPA)       | http://localhost:5173 |
| spa-iframe (iframe host) | http://localhost:4000 |
| spa-csp (CSP demo)       | http://localhost:5174 |

To run only the CSP demo:

```bash
pnpm run dev:spa-csp
```

---

## Scenarios

### Page One — Banner inside iframe only

The parent page (`localhost:5173`) does **not** run the GPC script and shows no banner. Instead it detects `navigator.globalPrivacyControl` and uses `postMessage` to pass the GPC signal and cookie state to the iframe (`localhost:4000/page1.html`). The iframe renders the banner.

### Page Two — Banner on parent and iframe

The parent runs `loadGPCScript()` on mount — banner appears on the parent page. The iframe (`localhost:4000/page2.html`) also runs its own embed script — banner appears inside the iframe too.

### Page Three — Redirect, banner on both

Redirects to `localhost:4000` (the inverse app). That app runs its own GPC script (banner on its parent page) and iframes `localhost:5173` (banner inside the iframe too).

---

---

## CSP Demo (`spa-csp`)

A standalone app showing why a Content-Security-Policy blocks the TrustArc DSR form iframe, and the one-line fix. Unlike the GPC scenarios, **this demo needs no browser extension** — it is deterministic.

Both routes are served with a **real CSP response header**, set per-route by middleware in `spa-csp/vite.config.js`. Both policies live in `spa-csp/src/csp-policies.js` and are imported by both the server config and the pages, so the policy displayed on screen is provably the one being enforced.

| Route | Policy | Result |
| ------- | ---------------------------- | ------------------------------------ |
| `/`     | No `frame-src` directive     | Form iframe refused — empty box       |
| `/fixed`| `frame-src` names the origin | Form loads and is fully interactive   |

The blocking is subtle: the strict policy never mentions iframes. With `frame-src` absent, it falls back to `default-src 'self'`, which refuses every cross-origin frame.

```
default-src 'self'; script-src 'self'; style-src 'self'
                                    ← no frame-src, so default-src applies
```

The fix adds one directive:

```
frame-src https://submit-irm.trustarc.eu;
```

Each page also renders a live violation console (`securitypolicyviolation` events), so the error is visible without opening DevTools.

> **Note:** CSP cannot be relaxed by client-side JavaScript — a policy is fixed once the document is delivered. The fix is always to serve a corrected header. See [`docs/CSP_IFRAME.md`](docs/CSP_IFRAME.md) for the full explanation, region caveats (`.eu` vs `.com`), and deployment config for Netlify, Vercel and nginx.

---

## GPC Browser Extension

To enable the GPC signal during testing, install the [GPC Enabler Chrome extension](https://chromewebstore.google.com/detail/gpc-enabler/ilknagnpcicckgohjailfooamibaolnj).

> **Note:** The extension sets `navigator.globalPrivacyControl = true` on the top-level window only. It does not inject into cross-origin iframes. See `docs/GPC_POSTMESSAGE.md` for how this is handled.
