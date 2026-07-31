# Third-party software & attribution

Gerente is released under the MIT License (see [`LICENSE`](LICENSE)). It builds on
the following third-party work. Gerente is an independent project and is **not
affiliated with, endorsed by, or connected to** any of them.

| Component | Project | Licence |
|---|---|---|
| UI framework | [React](https://react.dev) | MIT |
| Routing | [React Router](https://reactrouter.com) | MIT |
| Build tool | [Vite](https://vite.dev) | MIT |
| 3D landing scene | [three.js](https://threejs.org) | MIT |
| Drag & drop | [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) | Apache-2.0 |
| Auth, database & realtime | [Supabase](https://supabase.com) | Apache-2.0 (client library) |
| Offline service worker | [Workbox](https://developer.chrome.com/docs/workbox) via [vite-plugin-pwa](https://vite-pwa-org.netlify.app) | MIT |
| Tests | [Vitest](https://vitest.dev), [Testing Library](https://testing-library.com) | MIT |
| Typeface | [Inter and Inter Tight](https://rsms.me/inter/) by Rasmus Andersson, served by Google Fonts | SIL Open Font License 1.1 |

## Hosting & services

The deployed app is hosted on [Vercel](https://vercel.com). Optional cloud sync is
provided by [Supabase](https://supabase.com). Neither is required to run Gerente:
with no environment variables set, the app runs entirely in the browser using
local storage.

## Brand

The Gerente name, wordmark and pivot mark in [`public/brand/`](public/brand) are
the author's own work and are **not** covered by the MIT licence granted for the
source code. Please do not reuse them to represent a different project.
