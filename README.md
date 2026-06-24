# ibraradi.me

Personal website & blog of **Ibrahim Radi** - Security Engineer & technical co-founder of Flawtrack.

Built with [Astro](https://astro.build) as a fully static site, deployed on **Cloudflare Pages**.

## Tech

- **Astro 5** - static output, zero client JS except a tiny mobile-menu toggle
- **Content Collections** - blog posts in Markdown (`src/content/blog/`)
- **@astrojs/sitemap** + **@astrojs/rss** - `sitemap-index.xml` and `/rss.xml`
- Hand-rolled CSS (no framework), dark theme with terminal/mono accents
- Fonts: Inter + JetBrains Mono (Google Fonts)

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # output to ./dist
npm run preview  # preview the production build
```

## Editing content

Almost everything on the homepage is data-driven from **`src/consts.ts`** - experience,
skills, awards, education, certificates, volunteering, stats, and social links. Edit that
file and the page updates.

### Blog posts

Add a Markdown file to `src/content/blog/`. Frontmatter:

```yaml
---
title: "Post title"
description: "Short summary for listings and SEO."
pubDate: 2026-06-17
updatedDate: 2026-06-20   # optional
tags: ["asm", "engineering"]
draft: false              # set true to hide from the site
---
```

The URL is derived from the filename: `my-post.md` → `/blog/my-post/`.

## Deploy to Cloudflare Pages

This is a static site, so **no adapter is needed**.

### Option A - Git integration (recommended)

1. Push this repo to GitHub.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**.
3. Select the repo and use these build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** set env var `NODE_VERSION` = `20` (or newer) if needed
4. Deploy. Every push to `main` redeploys automatically.

### Option B - Direct upload via Wrangler

```bash
npm run build
npx wrangler pages deploy dist --project-name=ibraradi-me
```

### Custom domain

In the Pages project → **Custom domains**, add `ibraradi.me` (and `www` if desired).
Cloudflare handles TLS automatically. The `public/_headers` file adds security headers
and long-term caching for hashed assets.

## Structure

```
src/
  consts.ts            # all site/CV content + social links
  content.config.ts    # blog collection schema
  content/blog/        # Markdown posts
  layouts/             # BaseLayout (head, SEO, OG)
  components/          # Header, Footer
  pages/
    index.astro        # homepage (all sections)
    404.astro
    blog/index.astro   # post list
    blog/[...slug].astro
    rss.xml.js
  styles/global.css
public/
  favicon.svg, robots.txt, _headers
```
