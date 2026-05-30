# Architecture decisions

This is the short-form log of the load-bearing technical choices in Gerente, with the trade-offs each one accepts. It exists so the reasoning doesn't have to live in commit messages or in my head.

---

## Vite over Create React App

CRA was deprecated and frozen on React 18 + Webpack 4. The migration to Vite 8 gave:

- **Cold start under 300 ms** vs ~10 s on CRA
- Native ESM in dev, esbuild for transpilation
- First-class config for PWA, sourcemaps, and env vars (`VITE_*` prefix)
- Smaller, more transparent toolchain — no `react-scripts` black box

The migration also unblocked React 19 (CRA wasn't going to support it).

**Trade-off:** `vite-plugin-pwa@1.2.0` doesn't yet declare Vite 8 in its peer range, so the project pins `legacy-peer-deps=true` in [`.npmrc`](../.npmrc). This is a temporary smell that will go away when the plugin updates.

---

## Supabase over Firebase

Both were viable for "cheap, fast cloud sync with auth". Supabase won because:

- **Postgres** instead of a document store. Tasks are tabular data with sort positions and timestamps — relational fits naturally.
- **Row-Level Security policies** ([`supabase/schema.sql`](../supabase/schema.sql)) push authorization into the database itself. The frontend can't bypass it even if it tried.
- **Realtime channels** scoped by `user_id` via `postgres_changes` filter give cross-device sync without writing any custom WebSocket plumbing.
- **Open source + self-hostable.** If the project ever outgrows the free tier, exit is painless.

**Trade-off:** Supabase JS adds ~163 KB gzipped to the bundle. The PWA precaches it, so it's a one-time cost per user, but it's the main reason the bundle is over the 500 KB warning threshold. Code-splitting it behind an "if signed in" lazy import is a follow-up worth doing.

---

## Offline-first with a cloud-sync opt-in

Most portfolio task apps force you to make an account to do anything. Gerente flips that:

- **Signed out** → tasks live in `localStorage`. Everything works, nothing leaves the device.
- **Signed in** → the same hook (`useTaskManager`) swaps the storage layer to Supabase with optimistic writes + realtime subscription.

The branch is one boolean in [`src/hooks/useTaskManager.js`](../src/hooks/useTaskManager.js) (`const cloud = Boolean(user && supabase)`), and the UI is identical in both modes.

**Trade-off:** Tasks created locally before sign-in aren't auto-migrated to the cloud account. That import flow is a one-time UX detail I haven't built yet — it's deliberately deferred because most portfolio visitors will either browse signed out or sign in fresh.

**Trade-off:** Signed-in mode requires connectivity. Offline writes from a signed-in session would need a write-queue + replay-on-reconnect, which is real engineering. Scope-cut for v1.

---

## react-router-dom 7

Only two real routes (`/`, `/about`) and a 404. Could've been done with conditional rendering and saved 12 KB gzipped. Used react-router because:

- Real URLs are crawlable and shareable (sitemap entries point at them)
- `/about` is what the portfolio backlink and JSON-LD `author` block resolve against
- It's the convention recruiters expect in a React project, and "I avoided react-router" requires more justification than "I used it"

**Trade-off:** ~12 KB gzipped of overhead for two pages. Acceptable.

---

## @hello-pangea/dnd for drag-and-drop

`react-beautiful-dnd` is the classic, but it's archived and incompatible with React 19's stricter `StrictMode` behavior. `@hello-pangea/dnd` is the maintained community fork — same API, React 19-ready.

**Trade-off:** Still a heavy DnD library for what's effectively single-list reordering. Native HTML5 drag-and-drop would be lighter but is famously painful for keyboard accessibility and touch. Punt.

---

## vite-plugin-pwa over hand-rolled service worker

A real service worker has to handle: precaching with content hashing, cleanup of stale caches, navigation fallbacks, update detection, and not breaking development. Doing all of that by hand is a multi-day rabbit hole.

`vite-plugin-pwa` with `generateSW` mode handles every one of those, and exposes a clean React hook (`useRegisterSW` from `virtual:pwa-register/react`) for the "new version available" prompt — see [`src/components/pwa/PWAUpdatePrompt.jsx`](../src/components/pwa/PWAUpdatePrompt.jsx).

**Trade-off:** The Workbox runtime adds ~2 KB gzipped. Negligible.

---

## Brand: the Pivot mark + Apple-style UI

The brand identity (two interlocking L-shapes with a coral accent square, named "Pivot") came from a separate handoff and was wired in across favicon, app icons, manifest, OG card, and React component variants ([`src/components/brand/GerenteLogo.jsx`](../src/components/brand/GerenteLogo.jsx)).

The visual language deliberately echoes Apple's design system:
- Paper background (`#F4F1EC`) and ink text (`#111114`) instead of pure white/black
- Glass surfaces with `backdrop-filter: saturate(180%) blur(30px)`
- Coral (`#E25A3C`) as the single accent color — used sparingly
- Inter Tight for the wordmark, weight 700 with `-0.04em` tracking
- iOS-style segmented control for workspace tabs

The favicon ships in three forms: a light/dark adaptive SVG via `prefers-color-scheme`, a multi-resolution `.ico` rasterized from the dark app-icon for older browsers and link unfurlers, and the manifest icons for the PWA install flow.

**Trade-off:** Apple aesthetics are heavy on `backdrop-filter`, which costs GPU on low-end devices. The bottom-of-screen toasts and the auth sheet both use it; on a four-year-old Android the scroll perf takes a hit. Acceptable for a portfolio piece, would be the first thing I'd profile if this had real users.

---

## Hosting on Vercel + Cloudflare DNS

- **Vercel** — auto-deploys from `main`, gives a real SSL cert, handles 308-redirects from the legacy `.vercel.app` URL to the custom subdomain, and the dashboard handles env vars cleanly.
- **Cloudflare** — only used for DNS (grey-cloud, not proxied — Vercel needs to handle its own SSL). The portfolio domain `rianfernando.com` already lives there.

**Trade-off:** This stack assumes Vercel stays generous on the hobby plan. A self-hosted alternative (Cloudflare Pages or a $5 VPS with Caddy) would be more sovereign and roughly the same money-per-month, but the dev velocity Vercel gives on push-to-deploy is hard to beat for a single maintainer.

---

## SEO surface

Every choice on this list was made with a specific platform in mind:

- **`sitemap.xml`** lists `/` and `/about` with absolute URLs. Crawlers don't have to discover routes.
- **`robots.txt`** declares `Allow: /` and an absolute `Sitemap:` pointer.
- **Canonical link + Open Graph + Twitter card + JSON-LD** all point at `https://gerente.rianfernando.com`, with a `Person` author block linking back to `https://rianfernando.com` — a crawlable round-trip between the portfolio and the product.
- **OG image** is a real PNG (1200×630), built from brand tokens via [`scripts/build-og-image.sh`](../scripts/build-og-image.sh). SVG OG images don't unfurl in LinkedIn, Slack, iMessage, or Discord.
- **404 sets `noindex`** so accidental dead links don't pollute the index.

The whole surface was validated against Google's rich-results test and opengraph.xyz.

---

## What's deliberately not here

Things that would be reasonable to add but were scope-cut for the portfolio version:

- **Offline writes when signed in.** Needs an outbox + replay-on-reconnect.
- **Local-to-cloud task import on first sign-in.** One-time UX flow, not hard but not load-bearing for the demo.
- **Bundle code-splitting.** Supabase + dnd + Workbox could be lazy-loaded behind their use cases to drop the initial JS by ~60%.
- **End-to-end tests.** Vitest covers the sort/format logic; Playwright would cover the auth + drag-drop happy paths. Worth adding if this ever grew real users.
- **Internationalization.** All copy is English, dates are `toLocaleString`-naive.

Each of these is a known cut, not a forgotten one.
