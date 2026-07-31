/**
 * Single source of truth for everything a search or answer engine reads.
 *
 * Imported by the React pages *and* by `vite.config.js`, which injects the
 * JSON-LD and a no-JS content shell into `index.html` at build time. Keep this
 * file free of JSX and browser globals so Node can import it directly.
 *
 * Copy rule: write plain, checkable sentences. AI answer engines quote whole
 * sentences verbatim, so every line here should still be true and readable
 * with no surrounding context.
 */

export const SITE_URL = 'https://gerente.rianfernando.com';
export const SITE_NAME = 'Gerente';
export const REPO_URL = 'https://github.com/Rian-Fernando/Gerente';
export const AUTHOR_NAME = 'Rian Fernando';
export const AUTHOR_URL = 'https://rianfernando.com';

export const SITE_TAGLINE = 'A focused task manager with workspaces, priorities, and a built-in Pomodoro timer.';

export const SITE_DESCRIPTION =
  'Gerente is a free task manager for people who want one uncluttered place to plan the day. ' +
  'Tasks are grouped into workspaces, ranked by priority, given due dates, reordered by drag and drop, ' +
  'and worked through with a built-in Pomodoro timer. It runs offline in the browser and syncs across devices once you sign in.';

/** One-sentence answers to "what is this", used in the hero and in llms.txt. */
export const ONE_LINER =
  'Gerente is a free, offline-first task manager that combines workspaces, priorities and due dates with a built-in Pomodoro timer.';

export const AUDIENCE =
  'It is built for students, freelancers and solo developers who juggle several areas of life at once and want the plan and the focus timer in the same place.';

/** Landing page pillars — rendered as <h3> sections and mirrored into llms.txt. */
export const FEATURES = [
  {
    title: 'Workspaces',
    body: 'Separate Personal, Work, School, Fitness and Other into their own lists, each with a live count of what is still open, so one busy area never buries the rest.',
  },
  {
    title: 'Priorities and due dates',
    body: 'Every task carries a High, Medium or Low priority shown as a coloured edge, plus an optional due date that turns the task Due Soon, Due Today or Overdue on its own.',
  },
  {
    title: 'Drag-and-drop ordering',
    body: 'Reorder a workspace by dragging tasks into the sequence you actually intend to work them, instead of accepting the order they were typed in.',
  },
  {
    title: 'Built-in Pomodoro timer',
    body: 'Start a 25-minute focus session against a specific task. The countdown is mirrored into the browser tab title, so the timer keeps working while you are in another tab.',
  },
  {
    title: 'Works offline, installs as an app',
    body: 'Gerente is a progressive web app. It installs to the dock or home screen, opens in its own window, and keeps working with no network connection.',
  },
  {
    title: 'Optional cloud sync',
    body: 'Signed out, tasks stay in the browser and never leave the device. Sign in and they move to a Postgres database with row-level security, syncing across devices in real time.',
  },
];

/** How it works — the three-step flow, also emitted as HowTo-style prose. */
export const STEPS = [
  {
    title: 'Capture',
    body: 'Type a task, pick its workspace, priority and due date. No account is needed and nothing is uploaded until you choose to sign in.',
  },
  {
    title: 'Order',
    body: 'Sort by priority, due date or your own drag-and-drop order, then use the summary bar to see what is open, overdue and finished at a glance.',
  },
  {
    title: 'Focus',
    body: 'Start the Pomodoro timer on one task and work a single 25-minute block. The tab title becomes the countdown so you can see it from anywhere.',
  },
];

export const STACK = [
  'React 19 and react-router-dom 7, bundled by Vite 8',
  'three.js for the animated landing scene',
  'Supabase Postgres with row-level security and realtime for optional sync',
  'vite-plugin-pwa and Workbox for the offline service worker',
  'Vitest for the test suite, GitHub Actions for CI, Vercel for hosting',
];

/**
 * FAQ — rendered as visible <h3>/<p> content on the landing page AND emitted as
 * FAQPage JSON-LD. Google rich results and AI answer engines both read this,
 * and the visible copy must match the structured data or it is a policy breach.
 */
export const FAQ = [
  {
    q: 'What is Gerente?',
    a: 'Gerente is a free task manager for the web. It groups tasks into workspaces such as Personal, Work and School, ranks them by priority, tracks due dates, and includes a built-in Pomodoro timer so you can plan the day and focus on it in the same place. The name is Portuguese for "manager".',
  },
  {
    q: 'Is Gerente free?',
    a: 'Yes. Gerente is completely free and has no paid tier, no trial and no advertising. The source code is published on GitHub under the MIT licence.',
  },
  {
    q: 'Do I need an account to use Gerente?',
    a: 'No. Gerente works fully without an account, storing tasks in your browser so they stay on your device. Signing in is optional and only adds cross-device sync.',
  },
  {
    q: 'Does Gerente work offline?',
    a: 'Yes. Gerente is a progressive web app with a service worker that caches the whole interface, so it opens and works with no network connection. You can install it to your dock or home screen and run it in its own window.',
  },
  {
    q: 'How does the Pomodoro timer work?',
    a: 'You start the timer on one specific task and work a 25-minute focus block followed by a short break. The remaining time is written into the browser tab title, so the countdown stays visible even when Gerente is not the tab you are looking at.',
  },
  {
    q: 'Where is my data stored?',
    a: 'Signed out, tasks are stored only in your browser’s local storage and are never sent anywhere. Signed in, they are stored in a Supabase Postgres database protected by row-level security policies, so each account can read and write only its own rows.',
  },
];
