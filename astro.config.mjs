// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { BLOG_ENABLED } from './src/consts.ts';

// https://astro.build/config
// In Docker, source is bind-mounted, so file changes must be detected via
// polling for hot-module-reload to fire reliably (set by docker-compose).
const usePolling = process.env.DOCKER_DEV === 'true';

export default defineConfig({
  site: 'https://ibraradi.me',
  integrations: [
    sitemap({
      // Drop /blog URLs from the sitemap while the blog is disabled.
      filter: (page) => BLOG_ENABLED || !page.includes('/blog'),
    }),
  ],
  prefetch: true,
  server: { host: true, port: 4321 },
  vite: {
    server: {
      watch: usePolling ? { usePolling: true, interval: 300 } : undefined,
    },
  },
});
