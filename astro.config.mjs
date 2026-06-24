// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { storyblok } from '@storyblok/astro';
import { loadEnv } from 'vite';
import { BLOG_ENABLED } from './src/consts.ts';

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

// Map blog-post URLs -> ISO date so the sitemap can advertise <lastmod>,
// which helps search engines recrawl updated posts. The file is produced by
// scripts/prerender-blog.mjs before `astro build` runs.
const postLastmod = {};
try {
  const posts = JSON.parse(readFileSync(new URL('./src/generated/posts.json', import.meta.url), 'utf-8'));
  for (const p of posts) {
    if (p?.slug && p?.date) postLastmod[`https://ibraradi.me/blog/${p.slug}/`] = new Date(p.date).toISOString();
  }
} catch {
  /* posts.json not generated yet - sitemap simply omits lastmod */
}

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
      serialize(item) {
        const lastmod = postLastmod[item.url];
        if (lastmod) item.lastmod = lastmod;
        return item;
      },
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
