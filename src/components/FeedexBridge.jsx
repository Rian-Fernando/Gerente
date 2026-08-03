import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { APP_VERSION } from '../constants/appInfo';

/**
 * Gives the Feedex widget just enough context to make a report actionable:
 * which page it came from, which build, and — only when someone has chosen to
 * sign in — who to reply to.
 *
 * Deliberately never sends task content. Gerente's whole claim is that tasks
 * stay on the device unless you opt into sync, and a feedback widget is not a
 * reason to weaken that.
 *
 * Renders nothing. Safe when the widget is absent: with no project key set the
 * script is never injected (see scripts/feedex-plugin.js), so this quietly
 * gives up and the app is unaffected.
 *
 * @see https://feedex.rianfernando.com/docs/widget
 */

const POLL_MS = 400;
const GIVE_UP_MS = 20000;

/** Resolves with window.Feedex once the deferred script has booted, or null. */
function whenFeedexReady() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(null);
    if (window.Feedex) return resolve(window.Feedex);

    let waited = 0;
    const id = setInterval(() => {
      waited += POLL_MS;
      if (window.Feedex) {
        clearInterval(id);
        resolve(window.Feedex);
      } else if (waited >= GIVE_UP_MS) {
        clearInterval(id);
        resolve(null);
      }
    }, POLL_MS);
  });
}

export default function FeedexBridge() {
  const location = useLocation();
  const { user } = useAuth();
  const email = user?.email ?? null;

  useEffect(() => {
    let cancelled = false;

    whenFeedexReady().then((feedex) => {
      if (!feedex || cancelled) return;
      try {
        if (email) feedex.identify({ email });
        feedex.setMetadata({
          route: location.pathname,
          storage: email ? 'supabase' : 'local',
          version: APP_VERSION,
          theme: document.body.classList.contains('dark') ? 'dark' : 'light',
        });
      } catch {
        // Context is a nicety — never let it break the page.
      }
    });

    return () => {
      cancelled = true;
    };
  }, [location.pathname, email]);

  return null;
}
