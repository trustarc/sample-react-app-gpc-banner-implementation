# Sample React App — GPC Banner Implementation

A monorepo containing two React SPAs that demonstrate how to implement and test the TrustArc GPC (Global Privacy Control) banner across cross-origin iframes using `postMessage`.

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
├── pnpm-workspace.yaml       # Declares spa-app and spa-iframe as packages
├── README.md
├── docs/
│   └── GPC_POSTMESSAGE.md    # Technical deep-dive on the postMessage approach
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
└── spa-iframe/               # Iframe host app (localhost:4000)
    ├── src/
    │   ├── gpc.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── pages/
    │       ├── PageOne.jsx   # Iframes back to localhost:5173
    │       ├── PageTwo.jsx
    │       └── PageThree.jsx
    ├── public/
    │   └── page5.html        # Static iframe page for testing
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

---

## Scenarios

### Page One — Banner inside iframe only

The parent page (`localhost:5173`) does **not** run the GPC script and shows no banner. Instead it detects `navigator.globalPrivacyControl` and uses `postMessage` to pass the GPC signal and cookie state to the iframe (`localhost:4000/page1.html`). The iframe renders the banner.

### Page Two — Banner on parent and iframe

The parent runs `loadGPCScript()` on mount — banner appears on the parent page. The iframe (`localhost:4000/page2.html`) also runs its own embed script — banner appears inside the iframe too.

### Page Three — Redirect, banner on both

Redirects to `localhost:4000` (the inverse app). That app runs its own GPC script (banner on its parent page) and iframes `localhost:5173` (banner inside the iframe too).

---

## GPC Browser Extension

To enable the GPC signal during testing, install the [GPC Enabler Chrome extension](https://chromewebstore.google.com/detail/gpc-enabler/ilknagnpcicckgohjailfooamibaolnj).

> **Note:** The extension sets `navigator.globalPrivacyControl = true` on the top-level window only. It does not inject into cross-origin iframes. See `docs/GPC_POSTMESSAGE.md` for how this is handled.
