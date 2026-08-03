import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import seoHtml from './scripts/seo-html-plugin.js';
import feedexWidget from './scripts/feedex-plugin.js';

export default defineConfig({
  plugins: [
    react(),
    seoHtml(),
    feedexWidget(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.ico',
        'robots.txt',
        'sitemap.xml',
        'llms.txt',
        'og-image.png',
        'brand/gerente-mark.svg',
        'brand/gerente-mark-mono.svg',
        'brand/gerente-mark-reverse.svg',
        'brand/gerente-lockup.svg',
      ],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,woff2}'],
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        // Without these, navigating to a real file served from public/ would be
        // answered with the SPA shell once the service worker is installed —
        // /llms.txt in particular has to stay readable as plain text.
        navigateFallbackDenylist: [
          /^\/api/,
          /^\/auth/,
          /^\/llms\.txt$/,
          /^\/robots\.txt$/,
          /^\/sitemap\.xml$/,
          /^\/og-image\.png$/,
        ],
      },
      manifest: {
        name: 'Gerente',
        short_name: 'Gerente',
        description:
          'A focused task manager with workspaces, priorities, and a built-in Pomodoro timer.',
        // Installed from the home screen, Gerente should open the task board
        // rather than the marketing landing page.
        start_url: '/app',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#111114',
        background_color: '#F4F1EC',
        icons: [
          {
            src: '/brand/gerente-mark.svg',
            type: 'image/svg+xml',
            sizes: 'any',
            purpose: 'any',
          },
          {
            src: '/brand/gerente-app-icon.svg',
            type: 'image/svg+xml',
            sizes: '512x512',
            purpose: 'any maskable',
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: { port: 3000, open: true },
  build: { outDir: 'dist', sourcemap: true },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    css: true,
  },
});
