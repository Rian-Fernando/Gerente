# Changelog

All notable changes to Gerente are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/), and the project aims to follow
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- In-app feedback via [Feedex](https://feedex.rianfernando.com). The widget is
  injected into `index.html` at build time from a project key, so nothing is
  embedded when no key is configured and local development never posts into the
  real inbox.
- Reports carry the route they came from, the app version, the active theme and,
  for signed-in users, an email to reply to. Task content is never included.
- The launcher sits bottom-right. It is fixed at `bottom: 20px` with a 44px
  height and `z-index: 2147483000`, far above the toast stack's `1100`, so
  toasts sharing that corner were painted over rather than merely crowded. The
  stack now starts above the launcher via a `--toast-offset` custom property,
  and a test asserts the clearance holds at every breakpoint.
- Accepts either `VITE_FEEDEX_KEY` or `NEXT_PUBLIC_FEEDEX_KEY`. Vite exposes only
  `VITE_*` to client code, so the `NEXT_PUBLIC_` name works here purely because
  the key is read during the build rather than at runtime.

## [1.1.0] — 2026-07-31

A front door for the project, and the work needed for search engines and AI
answer engines to read and cite it.

### Landing page
- New scroll-driven 3D landing page at `/`, built with three.js: task cards
  tumble loose, sort themselves into workspace columns, one lifts out and a
  Pomodoro ring closes around it, then the board settles. Scrolling the page is
  the product demo.
- Keyframed camera path, instanced cards with per-priority emissive edges,
  ACES filmic tone mapping and a bloom pass that peaks as the timer completes.
- The task board moved from `/` to `/app`. Tasks are unaffected — local storage
  and Supabase are both route-independent — and the installed PWA now launches
  straight to `/app`.
- Under `prefers-reduced-motion` the scene renders a single still frame and the
  scroll story is replaced by all four captions shown at once.
- Falls back to a CSS gradient when WebGL is unavailable or blocked.

### Discoverability
- `/llms.txt` following the [llms.txt convention](https://llmstxt.org): H1,
  blockquote summary, then what it does, who it is for, features, pricing,
  privacy, stack and links.
- `robots.txt` now names and allows the major AI crawlers explicitly — GPTBot,
  OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, anthropic-ai,
  PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, CCBot,
  Amazonbot, Bytespider and cohere-ai.
- JSON-LD for `SoftwareApplication` and a six-question `FAQPage`, generated at
  build time from the same constants the page renders, so the structured data
  and the visible copy can never drift apart.
- A `<noscript>` content shell carrying the full landing copy, so crawlers that
  do not execute JavaScript get real prose instead of an empty `<div id="root">`.
- IndexNow ping on every successful production deploy, so Bing-backed engines
  re-index changed pages immediately.
- `*.vercel.app` now redirects permanently to `gerente.rianfernando.com`, and
  `/app` joined the sitemap.

### Repository
- `CHANGELOG.md`, `NOTICE.md`, Dependabot config and a CodeQL analysis workflow.
- README rebuilt with badges, a Mermaid architecture diagram and current routes.
- New `src/seo.test.js` suite covering robots, llms.txt, the sitemap, the FAQ
  copy and the Vercel redirect, so the discoverability work is guarded by CI.

### Fixed
- Due dates rendered one day early (a date picked as Jan 1 displayed as
  Dec 31), and a task due today was counted as overdue. Both came from parsing
  the `YYYY-MM-DD` value of a date input as UTC midnight while comparing it
  against local time; date-only strings are now parsed as local midnight.
- Adding a task after switching workspaces filed it under the *previous*
  workspace, where it immediately disappeared from view. The composer now
  follows the active workspace.
- The Pomodoro timer counted down one tick per second, so a background tab —
  where browsers throttle timers to roughly once a minute — lost minutes over a
  session. It now derives the remaining time from the session's end timestamp
  and recomputes on return to the foreground, staying accurate however few
  ticks actually run.
- Closing the timer restored a hard-coded tab title that no longer matched any
  route; it now restores whatever the title actually was.
- Reopening the timer on a different task inherited the previous task's state,
  often landing mid-break with its clock still running. Each task now starts a
  fresh focus session.
- The completion banner could never appear, because finishing a phase refills
  the clock for the next one before the frame was painted.
- The alert sound was streamed from a third-party host, so it failed offline —
  the one situation this app is built for. It is now synthesised locally with
  the Web Audio API.
- The timer's clock was a second `<h1>`, giving the page two top-level headings
  whenever it was open.

### Changed
- Task board layout: workspace tabs moved to the top as the primary navigation,
  the duplicated stats block was removed from the list (the summary strip above
  it already showed the same numbers), and sort and clear now sit on the list
  header they act on rather than above the composer.
- The task composer is a real `<form>` with labelled controls, a disabled Add
  button while empty, and focus returned to the field after adding.
- Both dialogs manage focus: the timer traps Tab, focuses on open and restores
  focus on close.

### Performance
- The landing page and its three.js scene are code-split, cutting the task
  board's JavaScript from 317 kB to 148 kB gzipped.
- The service worker's navigation fallback no longer swallows `/llms.txt`,
  `/robots.txt`, `/sitemap.xml` or `/og-image.png`.

## [1.0.0] — 2026-05-30

First tagged release: the task manager itself.

### Tasks
- Workspaces (Personal, Work, School, Fitness, Other) with live open counts in a
  segmented tab bar.
- High / Medium / Low priorities rendered as coloured left-edge accents.
- Due dates with automatic Overdue, Due Today and Due Soon states.
- Drag-and-drop reordering within a workspace.
- Sort by priority, due date, name or completion, plus a summary dashboard of
  open, overdue and completed counts.
- Built-in Pomodoro timer scoped to a single task, mirroring the countdown into
  the browser tab title.
- Keyboard shortcuts, with `?` opening the full list.

### Platform
- Light and dark themes with persistence.
- Installable PWA with an offline app shell and an in-app update prompt.
- Optional Supabase auth (email/password and GitHub OAuth) with cross-device
  sync, optimistic writes, realtime updates and row-level security policies.
- Local-storage mode when signed out, requiring no account and no network.
- Brand identity: pivot wordmark, adaptive favicon and a 1200×630 social card.

[1.1.0]: https://github.com/Rian-Fernando/Gerente/releases/tag/v1.1.0
[1.0.0]: https://github.com/Rian-Fernando/Gerente/releases/tag/v1.0.0
