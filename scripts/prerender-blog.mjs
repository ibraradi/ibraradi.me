// Prebuild step (plain Node): fetch published posts from Storyblok, render their
// markdown to Shiki-highlighted HTML, and write src/generated/posts.json.
//
// Runs in plain Node — where Shiki's grammar loading works reliably (it breaks
// when bundled into the Astro/Vite build). Astro then just outputs this HTML.
import { writeFile, mkdir } from 'node:fs/promises';
import { marked } from 'marked';
import markedShiki from 'marked-shiki';
import { codeToHtml } from 'shiki';

// Load .env locally; on Cloudflare the vars come from the build environment.
try {
  process.loadEnvFile('.env');
} catch {
  /* no .env (e.g. CI) — use process.env */
}

const TOKEN = process.env.STORYBLOK_TOKEN;
const REGION = process.env.STORYBLOK_REGION || 'eu';
const API = REGION === 'us' ? 'https://api-us.storyblok.com' : 'https://api.storyblok.com';
const THEME = 'tokyo-night';

marked.use(
  markedShiki({
    async highlight(code, lang) {
      try {
        return await codeToHtml(code, { lang: lang || 'text', theme: THEME });
      } catch {
        return await codeToHtml(code, { lang: 'text', theme: THEME });
      }
    },
  }),
);

function toTags(t) {
  if (typeof t === 'string') return t.split(',').map((x) => x.trim()).filter(Boolean);
  return Array.isArray(t) ? t : [];
}

async function main() {
  let stories = [];
  if (TOKEN) {
    const url =
      `${API}/v2/cdn/stories?token=${TOKEN}&version=published` +
      `&starts_with=blog/&content_type=post&per_page=100&sort_by=content.date:desc`;
    const res = await fetch(url);
    if (res.ok) {
      stories = (await res.json()).stories || [];
    } else {
      console.error(`Storyblok fetch failed: ${res.status} — writing empty posts.`);
    }
  } else {
    console.error('No STORYBLOK_TOKEN set — writing empty posts.json.');
  }

  const posts = [];
  for (const s of stories) {
    const c = s.content || {};
    posts.push({
      slug: s.slug,
      fullSlug: s.full_slug,
      title: c.title || s.name,
      date: c.date || s.first_published_at || s.created_at || '',
      excerpt: c.excerpt || '',
      tags: toTags(c.tags),
      html: await marked.parse(c.content || ''),
    });
  }

  await mkdir('src/generated', { recursive: true });
  await writeFile('src/generated/posts.json', JSON.stringify(posts, null, 2));
  console.log(`✓ prerendered ${posts.length} post(s) → src/generated/posts.json`);
}

main();
