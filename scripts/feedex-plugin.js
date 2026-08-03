import { loadEnv } from 'vite';

/**
 * Vite plugin: embeds the Feedex feedback widget.
 *
 * Feedex is a plain script tag with no package to install, so this injects it
 * into index.html at build time — the same approach the SEO metadata uses, and
 * it keeps the project key out of the committed source.
 *
 * The key is a *public* key (`pk_fdx_…`) and is designed to be visible in the
 * page; the env var exists so the widget can be pointed at a different project
 * (or switched off entirely) without a code change. With no key set — the
 * default when running locally — nothing is injected at all, so development
 * never posts into the real feedback inbox.
 *
 * @see https://feedex.rianfernando.com/docs/widget
 */

const WIDGET_SRC = 'https://feedex.rianfernando.com/widget.js';

/**
 * Gerente's dashboard config lives here rather than in Feedex's remote config
 * so the widget matches the brand on first paint, with no restyle flash.
 */
const WIDGET_CONFIG = {
  // Bottom-right, sharing a corner with Gerente's toasts. The launcher is
  // fixed at bottom: 20px, height: 44px, z-index 2147483000 — far above the
  // toast stack's 1100 — so the toasts are the ones that have to move: they
  // start at --toast-offset in Toast.css, clearing the launcher. Changing this
  // position means revisiting that offset.
  'data-feedex-position': 'bottom-right',
  'data-feedex-accent': '#E25A3C', // brand terracotta
  'data-feedex-label': 'Feedback',
  'data-feedex-title': 'Send feedback on Gerente',
  'data-feedex-description':
    'Found a bug, or want something Gerente does not do yet? Tell me here.',
  'data-feedex-icon': 'chat',
  'data-feedex-theme': 'auto',
  'data-feedex-categories': 'bug,feature,ui,other',
};

/** Reads the key from either prefix, so it works whichever one is configured. */
export function resolveKey(env = {}) {
  return (
    env.VITE_FEEDEX_KEY ||
    env.NEXT_PUBLIC_FEEDEX_KEY ||
    process.env.VITE_FEEDEX_KEY ||
    process.env.NEXT_PUBLIC_FEEDEX_KEY ||
    ''
  ).trim();
}

export function widgetTag(key) {
  return {
    tag: 'script',
    attrs: {
      src: WIDGET_SRC,
      'data-feedex-key': key,
      ...WIDGET_CONFIG,
      // Off the critical path: the widget must never delay first paint or
      // interactivity, since Core Web Vitals feed search ranking.
      defer: true,
    },
    injectTo: 'body',
  };
}

export default function feedexWidget() {
  let key = '';

  return {
    name: 'gerente-feedex-widget',

    config(_config, { mode }) {
      // Empty prefix so this sees unprefixed names too — Vite only exposes
      // VITE_* to client code, but the build process can read anything, which
      // is how a NEXT_PUBLIC_-named variable still works here.
      const env = loadEnv(mode, process.cwd(), '');
      key = resolveKey(env);

      if (!key) {
        this.warn?.(
          'Feedex: no VITE_FEEDEX_KEY or NEXT_PUBLIC_FEEDEX_KEY set — the feedback widget will not be embedded.'
        );
      } else if (!key.startsWith('pk_fdx_')) {
        this.warn?.(
          `Feedex: key does not look like a public key (expected a "pk_fdx_" prefix, got "${key.slice(0, 7)}…").`
        );
      }
    },

    transformIndexHtml: {
      order: 'post',
      handler() {
        return key ? [widgetTag(key)] : [];
      },
    },
  };
}
