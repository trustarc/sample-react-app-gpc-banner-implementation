# CSP Blocking the TrustArc DSR Form Iframe

## Background

A common integration embeds the TrustArc DSR (Data Subject Request) form as an iframe on the customer's own page:

```html
<iframe
  style="border: 1px #ffffff none"
  src="https://submit-irm.trustarc.com/services/validation/fe7532e0-3ef9-476a-9ea6-19d94c70a58b"
  title="Data Subject Access Request Form"
  width="100%" height="100%" scrolling="no" frameborder="no" allow="fullscreen">
</iframe>
```

If the customer's site sends a Content-Security-Policy, that policy decides whether the browser is allowed to load this iframe at all.

---

## The Problem

When the policy has **no `frame-src` directive**, the iframe is refused and the form renders as an empty box. Nothing on the page explains why — the space where the form should be is simply blank.

The console shows:

```
Refused to frame 'https://submit-irm.trustarc.com/' because it violates
the following Content Security Policy directive: "default-src 'self'".
Note that 'frame-src' was not explicitly set, so 'default-src' is used as a fallback.
```

That last sentence is the key to the whole problem. A policy does not need to mention iframes to block them:

```
default-src 'self'; script-src 'self'; style-src 'self'
```

There is no `frame-src` here, so it **inherits `default-src 'self'`**. Every cross-origin iframe is blocked. This is why the failure surprises people — the policy looks like it has nothing to do with iframes.

---

## Why It Is Never TrustArc's Side

The instinct when an iframe fails is to suspect the embedded site is refusing to be framed. For this form, it is not.

Verified against all three regional origins (`.com`, `.eu`, `.in`) — each responds `200` with **no `X-Frame-Options`** and **no `frame-ancestors`** directive. TrustArc deliberately permits these pages to be embedded.

The distinction that matters:

| Directive | Set by | Controls |
|---|---|---|
| `frame-src` | The **parent** page | What that page is allowed to embed |
| `frame-ancestors` | The **embedded** page | Who is allowed to embed that page |
| `X-Frame-Options` | The **embedded** page | Legacy equivalent of `frame-ancestors` |

Since TrustArc sets neither of the latter two, a blocked form is **always** the parent's `frame-src`. Fix it on your side.

One trap worth knowing: `frame-ancestors` **cannot be set via `<meta>`** — it is ignored there and only works as a real response header. Time gets lost on this.

---

## Diagnosing

Read the **verb** in the console error. It names the directive:

| Console message | Directive at fault |
|---|---|
| `Refused to frame '…'` | `frame-src` |
| `Refused to connect to '…'` | `connect-src` |
| `Refused to load the script '…'` | `script-src` |
| `Refused to apply inline style` | `style-src` |

Programmatically, every refusal also fires an event carrying the same detail:

```js
document.addEventListener('securitypolicyviolation', (e) => {
  console.log(e.violatedDirective);   // what blocked it
  console.log(e.blockedURI);          // what was blocked
  console.log(e.effectiveDirective);  // the directive that actually applied
});
```

`effectiveDirective` is worth checking: when the block came from a `default-src` fallback rather than an explicit rule, it reveals the real directive to add.

---

## Solution

Add **one directive** naming the form's origin:

```
frame-src https://submit-irm.trustarc.com;
```

That is the entire fix. The framed page is self-contained — its CSS, jQuery and Bootstrap all load as relative paths from `submit-irm.trustarc.com` itself. Those requests are governed by the **iframe's** origin, not the parent's policy, so no other directive is required in the parent.

In particular, the parent does **not** need `connect-src` for `submit-irm`. The parent page never calls that host; the iframe does, from inside its own origin.

### Region matters

The form origin must match the region actually serving your form:

| Region | Origin |
|---|---|
| US / global | `https://submit-irm.trustarc.com` |
| EU | `https://submit-irm.trustarc.eu` |
| India | `https://submit-irm.trustarc.in` |

These are **distinct origins**, not aliases. A policy allowing `.com` **will still block** a `.eu` or `.in` form. The failure is silent and looks identical to having no `frame-src` at all — which makes it easy to spend a long time re-checking a policy that is already "correct" apart from its TLD.

Copy the origin directly from your iframe's `src` rather than assuming. If you serve forms from more than one region, list each origin you actually use:

```
frame-src https://submit-irm.trustarc.com https://submit-irm.trustarc.eu;
```

Do **not** reach for a wildcard like `https://*.trustarc.com` to sidestep the problem — see the Security Note.

---

## The Fix Cannot Be Client-Side

A natural assumption is that JavaScript can relax the policy once the page notices the block. **It cannot.** A CSP takes effect when the document is delivered and cannot be loosened afterwards — if page scripts could widen their own policy, CSP would provide no protection at all.

Specifically, these do **not** work:

- Injecting a `<meta http-equiv="Content-Security-Policy">` after load — a policy added late does not apply retroactively, and cannot widen one already in force
- Rewriting the `<iframe src>` attribute — the origin is still blocked
- Removing and re-adding the iframe — same policy, same result

The fix is always to **serve a corrected policy** with the document. What the code does is set that header; it is a server concern, not a client one.

### The SPA corollary

This has a consequence that catches people building demos or staging comparisons: **a single-page app cannot show two different policies on two routes.**

Client-side routing does not fetch a new document. Navigating from `/` to `/fixed` in a React/Vue/Angular router swaps components in the page that is already loaded, so the policy delivered with the *original* document remains in force. Per-route CSP middleware appears to work when you check with `curl` — the header really is different — but the browser never requests the second document, so it never sees the second policy.

If you need two policies, you need two documents. This repo's `spa-csp` app uses two separate HTML entry points (`index.html` and `fixed.html`) with plain `<a href>` links between them, precisely so each page load carries its own policy.

The same applies in production: a route-scoped CSP only takes effect on a full page load, not on client-side navigation into that route.

---

## Deployment Reference

The demo app declares its policy in a `<meta>` tag so each HTML file is self-contained and obvious. Production should send a real header from whatever serves the page:

**Vite (local dev)** — `vite.config.js`:

```js
server: {
  headers: {
    'Content-Security-Policy':
      "default-src 'self'; frame-src https://submit-irm.trustarc.com",
  },
}
```

**Netlify** — `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; frame-src https://submit-irm.trustarc.com"
```

**Vercel** — `vercel.json`:

```json
{
  "headers": [{
    "source": "/(.*)",
    "headers": [{
      "key": "Content-Security-Policy",
      "value": "default-src 'self'; frame-src https://submit-irm.trustarc.com"
    }]
  }]
}
```

**nginx**:

```nginx
add_header Content-Security-Policy "default-src 'self'; frame-src https://submit-irm.trustarc.com" always;
```

A `<meta http-equiv="Content-Security-Policy">` in the HTML works as a fallback when headers are not available, but it cannot express `frame-ancestors` or `report-uri`, and it only applies to content parsed after the tag. Prefer the header.

---

## A Different Pattern — the JS Embed

This repo's other apps (`spa-app`, `spa-iframe`) use a different TrustArc integration: the `client.js` embed from `form-renderer.trustarc.com`, which renders the banner and form **inline into the host page** rather than in an iframe.

The two patterns fail differently, and conflating them sends people down the wrong path:

| | **Iframe embed** | **JS embed** (`gpc.js`) |
|---|---|---|
| How the form renders | Cross-origin iframe | Inline DOM in your page |
| Blocking directive | **`frame-src`** | **`connect-src`** |
| Console error | `Refused to frame…` | `Refused to connect…` |
| `submit-irm` in `frame-src`? | **Required** | Does nothing |

In the JS embed, `submit-irm.trustarc.eu/.com` is reached by `fetch()` — form submission, `/storage/upload`, `/validation/api/v1/forms/idiq`. Since it is a fetch and not a frame, `frame-src` has no effect on it and `connect-src` is what must allow it. That integration also needs `script-src https://form-renderer.trustarc.com` to load the bundle in the first place.

Check which pattern you have before choosing a directive: if the form is inside an `<iframe>` tag you wrote, it is `frame-src`; if a script draws the form into your own page, it is `connect-src`.

---

## Security Note

Keep `frame-src` scoped to the exact origins you intend to embed. Widening it to `https:` or `*` to make the error disappear permits **any** site to be framed on your page, which enables clickjacking and UI-redress attacks.

Wildcards are a weaker version of the same mistake. `https://*.trustarc.com` covers every current and future subdomain, including any that is compromised or repurposed later; it also does **not** solve the region problem, since `.eu` and `.in` are different registrable domains that no `.com` wildcard matches. Listing the two or three exact origins you use is both safer and actually correct.

The demo app uses `'unsafe-inline'` for `script-src` and `style-src` to keep the example readable; production policies should replace it with a nonce or hash.
