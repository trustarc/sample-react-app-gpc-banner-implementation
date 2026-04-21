# GPC Banner in Cross-Origin Iframes — postMessage Approach

## Background

The TrustArc GPC (Global Privacy Control) script detects whether a user has enabled the GPC signal in their browser via `navigator.globalPrivacyControl`. When detected, it renders a consent banner.

A common customer pattern is to embed the GPC script inside an **iframe** hosted on a TrustArc domain, while the parent page belongs to the customer's own domain. This creates a **cross-origin** boundary between the parent and the iframe.

---

## The Problem

### 1. GPC Signal Not Available in Cross-Origin Iframes

The [GPC Enabler Chrome extension](https://chromewebstore.google.com/detail/gpc-enabler/ilknagnpcicckgohjailfooamibaolnj) sets `navigator.globalPrivacyControl = true` on the **top-level window only**. Due to browser security restrictions, it cannot inject into cross-origin iframes.

This means when the GPC script runs inside a cross-origin iframe and polls `navigator.globalPrivacyControl`, it always gets `undefined` — and times out after 5 seconds without showing the banner.

### 2. Cookie State Not Shared Across Origins

The GPC state cookie (`trustarc_gpc_has_submitted_form`) is scoped to the origin that sets it. When a user ignores or submits the banner on `domain-a.com`, that cookie is invisible to an iframe running on `domain-b.com`.

This causes the banner to re-appear on every page with an iframe on a different origin, even if the user has already acted on it.

---

## Why postMessage?

`window.postMessage()` is the browser-native API designed for **safe cross-origin communication** between a parent window and an iframe. Unlike direct property access (e.g. `window.parent.navigator`), which throws a security error across origins, `postMessage` works across any origin boundary.

This makes it the correct tool to:
- Relay the GPC signal from the parent (where the extension sets it) to the iframe
- Sync cookie state between the parent and the iframe

---

## Solution

### GPC Signal Relay

**Parent → Iframe**

When the parent detects `navigator.globalPrivacyControl = true`, it broadcasts a `trustarc_gpc_signal` message to all iframes on the page:

```js
document.querySelectorAll('iframe').forEach((iframe) => {
  iframe.contentWindow?.postMessage({ type: 'trustarc_gpc_signal' }, '*');
});
```

**Iframe → Parent (ready ping)**

The iframe's `waitForGPC` function also sends a ready ping to the parent as soon as it initializes, in case the parent already detected GPC before the iframe finished loading:

```js
window.parent.postMessage({ type: 'trustarc_gpc_signal_request' }, '*');
```

The parent listens for this and responds with the signal if GPC is active:

```js
window.addEventListener('message', (event) => {
  if (event.data?.type === 'trustarc_gpc_signal_request' && navigator.globalPrivacyControl) {
    event.source.postMessage({ type: 'trustarc_gpc_signal' }, '*');
  }
});
```

**Iframe receives the signal**

Inside the iframe, `waitForGPC` listens for `trustarc_gpc_signal` alongside its own polling of `navigator.globalPrivacyControl`. Whichever resolves first wins:

```js
window.addEventListener('message', (event) => {
  if (event.data?.type === 'trustarc_gpc_signal') {
    resolve(true); // GPC is enabled
  }
});
```

---

### Cookie State Sync

**Iframe requests state from parent**

When the GPC script initializes inside an iframe and finds no local cookie, it requests the parent's cookie state:

```js
window.parent.postMessage({ type: 'trustarc_gpc_cookie_request' }, '*');
```

**Parent replies with its cookie**

```js
window.addEventListener('message', (event) => {
  if (event.data?.type === 'trustarc_gpc_cookie_request') {
    event.source.postMessage({
      type: 'trustarc_gpc_cookie_response',
      state: getCookie('trustarc_gpc_has_submitted_form'),
    }, '*');
  }
});
```

**Iframe receives and writes the cookie locally**

```js
window.addEventListener('message', (event) => {
  if (event.data?.type === 'trustarc_gpc_cookie_response' && event.data.state) {
    setCookie('trustarc_gpc_has_submitted_form', event.data.state);
  }
});
```

**Parent pushes state changes to iframes**

When the user ignores or submits the banner on the parent, the updated cookie state is immediately broadcast to all iframes so they stay in sync without needing to re-request:

```js
document.querySelectorAll('iframe').forEach((iframe) => {
  iframe.contentWindow?.postMessage({
    type: 'trustarc_gpc_cookie_response',
    state: newState,
  }, '*');
});
```

---

## Message Types Reference

| Message Type | Direction | Purpose |
|---|---|---|
| `trustarc_gpc_signal` | Parent → Iframe | Relay GPC signal to iframe |
| `trustarc_gpc_signal_request` | Iframe → Parent | Iframe ready ping — request signal from parent |
| `trustarc_gpc_cookie_request` | Iframe → Parent | Request current cookie state from parent |
| `trustarc_gpc_cookie_response` | Parent → Iframe | Reply with cookie state (also pushed on state change) |

---

## Use Cases

### Use Case 1 — Banner in iframe only (Page One)

**Scenario:** The customer's parent page does not want to show any GPC UI itself. The banner should appear exclusively inside the iframe.

**How it works:**
- Parent detects `navigator.globalPrivacyControl` and sends `trustarc_gpc_signal` to the iframe
- Parent responds to `trustarc_gpc_cookie_request` with its local cookie state
- Iframe receives the signal → `waitForGPC` resolves `true` → banner renders inside the iframe
- Parent page remains clean — no banner, no GPC script loaded

**Why postMessage is needed:** The extension cannot set `navigator.globalPrivacyControl` inside the cross-origin iframe. Without postMessage, the iframe times out and never shows the banner.

---

### Use Case 2 — Banner on parent and iframe (Page Two)

**Scenario:** Both the parent page and the iframe should show the GPC banner independently.

**How it works:**
- Parent loads `client.js` and calls `gpc.init()` — banner renders on the parent
- Parent's `waitForGPC` detects GPC and broadcasts `trustarc_gpc_signal` to the iframe automatically
- Iframe also runs its own embed script — receives the signal and renders its own banner
- Cookie state is synced bidirectionally via postMessage

**Why postMessage is needed:** Same reason — the iframe cannot detect the GPC signal on its own. The parent's broadcast makes both banners appear simultaneously.

---

### Use Case 3 — Redirect to a different domain (Page Three)

**Scenario:** The user navigates from the customer's SPA (`localhost:5173`) to a completely separate app on a different domain (`localhost:4000`). That new app also runs the GPC script and iframes the original SPA.

**How it works:**
- `localhost:5173` Page Three redirects to `localhost:4000` via `window.location.href`
- `localhost:4000` loads fresh — its own `App.jsx` calls `loadGPCScript()`, banner appears on its parent
- `localhost:4000` pages iframe `localhost:5173` — the same postMessage sync applies in the inverse direction: `localhost:4000` is now the parent, `localhost:5173` is the iframe

**Why postMessage is needed:** The two origins have separate cookie jars and separate `navigator` contexts. postMessage is the only way to share GPC signal and cookie state across them.

---

## Security Note

All `postMessage` calls in this implementation use `'*'` as the target origin for simplicity in a local development context. In a production environment, replace `'*'` with the specific trusted origin (e.g. `'https://your-iframe-domain.com'`) to prevent unintended message interception.
