import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import feedexWidget, { resolveKey, widgetTag } from '../scripts/feedex-plugin.js';

/**
 * The widget is embedded at build time from an env var, so none of it shows up
 * in a rendered component test. These cover the plugin directly.
 */

const KEY = 'pk_fdx_testkey000000000000';

const bootPlugin = (env) => {
  const plugin = feedexWidget();
  const saved = { ...process.env };
  // loadEnv reads process.env, so drive the plugin through it.
  delete process.env.VITE_FEEDEX_KEY;
  delete process.env.NEXT_PUBLIC_FEEDEX_KEY;
  Object.assign(process.env, env);
  try {
    plugin.config.call({ warn: () => {} }, {}, { mode: 'production' });
    return plugin.transformIndexHtml.handler('');
  } finally {
    process.env = saved;
  }
};

describe('key resolution', () => {
  test('prefers the idiomatic Vite name', () => {
    expect(resolveKey({ VITE_FEEDEX_KEY: 'a', NEXT_PUBLIC_FEEDEX_KEY: 'b' })).toBe('a');
  });

  test('accepts the NEXT_PUBLIC_ name Feedex documents', () => {
    // Vite exposes only VITE_* to client code, so this works purely because
    // the key is read during the build. Losing it would silently un-embed the
    // widget on a deploy that only sets the NEXT_PUBLIC_ name.
    expect(resolveKey({ NEXT_PUBLIC_FEEDEX_KEY: 'from-next' })).toBe('from-next');
  });

  test('is empty when neither is set', () => {
    const saved = { ...process.env };
    delete process.env.VITE_FEEDEX_KEY;
    delete process.env.NEXT_PUBLIC_FEEDEX_KEY;
    try {
      expect(resolveKey({})).toBe('');
    } finally {
      process.env = saved;
    }
  });
});

describe('injection', () => {
  test('embeds nothing without a key, so local dev stays out of the inbox', () => {
    expect(bootPlugin({})).toEqual([]);
  });

  test('embeds the widget when a key is present', () => {
    const [tag] = bootPlugin({ VITE_FEEDEX_KEY: KEY });
    expect(tag.tag).toBe('script');
    expect(tag.injectTo).toBe('body');
    expect(tag.attrs.src).toBe('https://feedex.rianfernando.com/widget.js');
    expect(tag.attrs['data-feedex-key']).toBe(KEY);
  });

  test('works from the NEXT_PUBLIC_ name alone', () => {
    const [tag] = bootPlugin({ NEXT_PUBLIC_FEEDEX_KEY: KEY });
    expect(tag.attrs['data-feedex-key']).toBe(KEY);
  });

  test('loads deferred, off the critical path', () => {
    const { attrs } = widgetTag(KEY);
    expect(attrs.defer).toBe(true);
  });
});

describe('placement and branding', () => {
  // The launcher is fixed at bottom: 20px with height: 44px, and carries
  // z-index 2147483000 against the toast stack's 1100 — so anything left in
  // that corner is painted over, not just crowded.
  const LAUNCHER_TOP_EDGE = 20 + 44;

  const toastCss = () =>
    readFileSync(resolve(process.cwd(), 'src/components/Toast.css'), 'utf8');

  test('sits bottom-right', () => {
    expect(widgetTag(KEY).attrs['data-feedex-position']).toBe('bottom-right');
  });

  test('the toast stack clears the launcher at every breakpoint', () => {
    // Regression: toasts used to sit at bottom: 28px, straight behind the
    // launcher — and this app toasts on nearly every action.
    const offsets = [...toastCss().matchAll(/--toast-offset:\s*(\d+)px/g)].map((m) =>
      Number(m[1])
    );

    expect(offsets.length).toBeGreaterThanOrEqual(2); // default + narrow screens
    offsets.forEach((offset) => expect(offset).toBeGreaterThan(LAUNCHER_TOP_EDGE));
  });

  test('the toast stack is positioned from that offset, not a hard-coded value', () => {
    expect(toastCss()).toMatch(/bottom:\s*var\(--toast-offset\)/);
  });

  test('uses the brand accent so it matches on first paint', () => {
    expect(widgetTag(KEY).attrs['data-feedex-accent']).toBe('#E25A3C');
  });

  test('offers the documented categories', () => {
    expect(widgetTag(KEY).attrs['data-feedex-categories']).toBe('bug,feature,ui,other');
  });
});
