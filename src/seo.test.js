import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { FAQ, FEATURES, SITE_URL, STEPS } from './constants/siteInfo';

/**
 * Guards the discoverability work — the parts that break silently. Nothing here
 * renders anything; it checks the files that search engines and AI answer
 * engines actually read, so a regression fails CI instead of the next crawl.
 */

const read = (file) => readFileSync(resolve(process.cwd(), file), 'utf8');

describe('robots.txt', () => {
  const robots = read('public/robots.txt');

  // Several of these default to no-access unless the site names them.
  const AI_CRAWLERS = [
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-Web',
    'anthropic-ai',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'Applebot-Extended',
    'CCBot',
    'Amazonbot',
    'Bytespider',
    'cohere-ai',
  ];

  test.each(AI_CRAWLERS)('allows %s by name', (crawler) => {
    expect(robots).toContain(`User-agent: ${crawler}`);
  });

  test('allows the whole site and points at the sitemap', () => {
    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });

  test('blocks nothing, since there is nothing private to block', () => {
    expect(robots).not.toContain('Disallow: /');
  });
});

describe('llms.txt', () => {
  const llms = read('public/llms.txt');

  test('follows the convention: H1, then a blockquote summary', () => {
    const lines = llms.split('\n');
    expect(lines[0]).toBe('# Gerente');
    expect(lines.find((l) => l.startsWith('>'))).toBeDefined();
  });

  test('summary is a single substantial paragraph', () => {
    const summary = llms.split('\n').find((l) => l.startsWith('>'));
    expect(summary.length).toBeGreaterThan(400);
  });

  test('carries the sections an answer engine needs', () => {
    ['## What it does', '## Key features', '## Tech stack', '## Links'].forEach((heading) => {
      expect(llms).toContain(heading);
    });
  });

  test('links to the live site, the source and the author', () => {
    expect(llms).toContain(`Live: ${SITE_URL}`);
    expect(llms).toContain('https://github.com/Rian-Fernando/Gerente');
    expect(llms).toContain('Built by Rian Fernando — https://rianfernando.com');
  });
});

describe('sitemap.xml', () => {
  const sitemap = read('public/sitemap.xml');

  test.each(['/', '/app', '/about'])('lists %s', (path) => {
    expect(sitemap).toContain(`<loc>${SITE_URL}${path === '/' ? '/' : path}</loc>`);
  });

  test('every URL is absolute and on the custom subdomain', () => {
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBeGreaterThan(0);
    locs.forEach((loc) => expect(loc.startsWith(`${SITE_URL}/`)).toBe(true));
  });
});

describe('structured-data source copy', () => {
  test('FAQ has between 3 and 6 pairs, as rich results expect', () => {
    expect(FAQ.length).toBeGreaterThanOrEqual(3);
    expect(FAQ.length).toBeLessThanOrEqual(6);
  });

  test('every FAQ answer is a quotable, self-contained sentence', () => {
    FAQ.forEach(({ q, a }) => {
      expect(q.endsWith('?')).toBe(true);
      expect(a.length).toBeGreaterThan(80);
      expect(a.trim()).toMatch(/[.!?]$/);
    });
  });

  test('the three headline questions an answer engine asks are covered', () => {
    const questions = FAQ.map((f) => f.q.toLowerCase()).join(' ');
    expect(questions).toContain('what is gerente');
    expect(questions).toContain('free');
    expect(questions).toContain('account');
  });

  test('features and steps carry real prose, not labels', () => {
    [...FEATURES, ...STEPS].forEach(({ title, body }) => {
      expect(title.length).toBeGreaterThan(2);
      expect(body.length).toBeGreaterThan(60);
    });
  });
});

describe('vercel.json', () => {
  const vercel = JSON.parse(read('vercel.json'));

  test('redirects *.vercel.app to the custom subdomain so nothing double-indexes', () => {
    const redirect = vercel.redirects.find((r) =>
      r.has?.some((h) => h.type === 'host' && h.value.includes('vercel\\.app'))
    );
    expect(redirect).toBeDefined();
    expect(redirect.destination).toContain(SITE_URL);
    expect(redirect.permanent).toBe(true);
  });
});
