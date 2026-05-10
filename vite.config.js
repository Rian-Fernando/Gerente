import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.ico',
        'robots.txt',
        'brand/gerente-mark.svg',
        'brand/gerente-mark-mono.svg',
        'brand/gerente-mark-reverse.svg',
        'brand/gerente-lockup.svg',
      ],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,woff2}'],
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/auth/],
      },
      manifest: {
        name: 'Gerente',
        short_name: 'Gerente',
        description:
          'A focused task manager with workspaces, priorities, and a built-in Pomodoro timer.',
        start_url: '/',
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
