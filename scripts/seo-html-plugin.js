import {
  AUDIENCE,
  AUTHOR_NAME,
  AUTHOR_URL,
  FAQ,
  FEATURES,
  ONE_LINER,
  REPO_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  STACK,
  STEPS,
} from '../src/constants/siteInfo.js';

/**
 * Vite plugin: generates everything a search or answer engine reads from
 * `src/constants/siteInfo.js`, so the copy has exactly one source of truth.
 *
 * It injects three things into index.html:
 *
 *   1. Head metadata — title, description, Open Graph, Twitter card, canonical.
 *      These are the static defaults; `useDocumentMeta` rewrites them per route
 *      once React is running.
 *   2. JSON-LD — SoftwareApplication and FAQPage. This is the machine-readable
 *      path that works with no JavaScript at all, and the FAQPage answers are
 *      byte-identical to the ones rendered on the landing page, as Google's
 *      structured-data policy requires.
 *   3. A <noscript> content shell. Gerente is a client-rendered SPA, so a
 *      crawler that does not execute JavaScript — which is most AI crawlers,
 *      including CCBot and PerplexityBot — would otherwise find an empty
 *      <div id="root">. The shell puts the real product copy in the raw HTML.
 *      It lives in <noscript> deliberately: browsers with JS never render it,
 *      so it costs nothing in layout shift or first paint.
 */

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const OG_IMAGE = `${SITE_URL}/og-image.png`;
const OG_ALT = `${SITE_NAME} — ${SITE_TAGLINE}`;
const TITLE = `${SITE_NAME} — Free task manager with workspaces and a Pomodoro timer`;

const softwareApplication = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  alternateName: 'Gerente Task Manager',
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: 'ProductivityApplication',
  applicationSubCategory: 'Task Management',
  operatingSystem: 'Web browser (Chrome, Safari, Firefox, Edge)',
  browserRequirements: 'Requires JavaScript. Installable as a progressive web app.',
  image: OG_IMAGE,
  screenshot: OG_IMAGE,
  license: 'https://opensource.org/licenses/MIT',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: FEATURES.map((f) => f.title),
  author: { '@type': 'Person', name: AUTHOR_NAME, url: AUTHOR_URL },
  publisher: { '@type': 'Person', name: AUTHOR_NAME, url: AUTHOR_URL },
  sameAs: [REPO_URL],
};

const faqPage = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

/** Plain, complete HTML version of the landing page for non-JS clients. */
function noscriptShell() {
  return [
    '<main>',
    `<h1>${esc(SITE_NAME)} — ${esc(SITE_TAGLINE)}</h1>`,
    `<p>${esc(ONE_LINER)}</p>`,
    `<p>${esc(AUDIENCE)}</p>`,
    '<h2>How Gerente works</h2>',
    '<ol>',
    ...STEPS.map((s) => `<li><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p></li>`),
    '</ol>',
    '<h2>What is in it</h2>',
    ...FEATURES.map((f) => `<h3>${esc(f.title)}</h3><p>${esc(f.body)}</p>`),
    '<h2>Built with</h2>',
    '<ul>',
    ...STACK.map((item) => `<li>${esc(item)}</li>`),
    '</ul>',
    '<h2>Frequently asked questions</h2>',
    ...FAQ.map((item) => `<h3>${esc(item.q)}</h3><p>${esc(item.a)}</p>`),
    '<h2>Links</h2>',
    '<ul>',
    `<li><a href="${SITE_URL}/app">Open the ${esc(SITE_NAME)} task board</a></li>`,
    `<li><a href="${SITE_URL}/about">About ${esc(SITE_NAME)}</a></li>`,
    `<li><a href="${REPO_URL}">Source code on GitHub</a></li>`,
    `<li><a href="${AUTHOR_URL}" rel="author">Built by ${esc(AUTHOR_NAME)}</a></li>`,
    '</ul>',
    `<p>${esc(SITE_NAME)} needs JavaScript enabled to run the task board.</p>`,
    '</main>',
  ].join('');
}

export default function seoHtml() {
  return {
    name: 'gerente-seo-html',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const tags = [
          { tag: 'title', children: TITLE, injectTo: 'head-prepend' },
          {
            tag: 'meta',
            attrs: { name: 'description', content: SITE_DESCRIPTION },
            injectTo: 'head-prepend',
          },
          { tag: 'link', attrs: { rel: 'canonical', href: `${SITE_URL}/` }, injectTo: 'head' },

          // Open Graph
          { tag: 'meta', attrs: { property: 'og:type', content: 'website' }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:site_name', content: SITE_NAME }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:title', content: TITLE }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:description', content: SITE_DESCRIPTION }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:url', content: `${SITE_URL}/` }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:image', content: OG_IMAGE }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:image:type', content: 'image/png' }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:image:height', content: '630' }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:image:alt', content: OG_ALT }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:locale', content: 'en_US' }, injectTo: 'head' },

          // Twitter card
          { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' }, injectTo: 'head' },
          { tag: 'meta', attrs: { name: 'twitter:title', content: TITLE }, injectTo: 'head' },
          { tag: 'meta', attrs: { name: 'twitter:description', content: SITE_DESCRIPTION }, injectTo: 'head' },
          { tag: 'meta', attrs: { name: 'twitter:image', content: OG_IMAGE }, injectTo: 'head' },
          { tag: 'meta', attrs: { name: 'twitter:image:alt', content: OG_ALT }, injectTo: 'head' },

          { tag: 'link', attrs: { rel: 'author', href: AUTHOR_URL }, injectTo: 'head' },
          {
            tag: 'script',
            attrs: { type: 'application/ld+json' },
            children: JSON.stringify(softwareApplication),
            injectTo: 'head',
          },
          {
            tag: 'script',
            attrs: { type: 'application/ld+json' },
            children: JSON.stringify(faqPage),
            injectTo: 'head',
          },
        ];

        return {
          html: html.replace('<!--seo-shell-->', `<noscript>${noscriptShell()}</noscript>`),
          tags,
        };
      },
    },
  };
}
