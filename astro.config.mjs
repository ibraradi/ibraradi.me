// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { storyblok } from '@storyblok/astro';
import { loadEnv } from 'vite';
import { BLOG_ENABLED } from './src/consts.ts';

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

// https://astro.build/config
// In Docker, source is bind-mounted, so file changes must be detected via
// polling for hot-module-reload to fire reliably (set by docker-compose).
const usePolling = process.env.DOCKER_DEV === 'true';

export default defineConfig({
  site: 'https://ibraradi.me',
  integrations: [
    storyblok({
      accessToken: env.STORYBLOK_TOKEN,
      apiOptions: { region: env.STORYBLOK_REGION || 'eu' },
      // We render posts with our own templates, so no component map or
      // visual-editor bridge is needed for the static build.
      bridge: false,
      components: {},
    }),
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
