// Seeds the blog into Storyblok via the Management API:
//   1. creates a `post` content type (markdown body) if missing
//   2. creates a `blog` folder if missing
//   3. creates/updates the WRITEUP.md story under it, then publishes
//
// Run with:  npm run seed:blog
// Requires STORYBLOK_OAUTH_TOKEN (Personal Access Token) + STORYBLOK_SPACE_ID in .env
import { readFile } from 'node:fs/promises';

const SPACE = process.env.STORYBLOK_SPACE_ID;
const TOKEN = process.env.STORYBLOK_OAUTH_TOKEN;
const REGION = process.env.STORYBLOK_REGION || 'eu';
const BASE = REGION === 'us' ? 'https://api-us.storyblok.com/v1' : 'https://mapi.storyblok.com/v1';

if (!SPACE || !TOKEN) {
  console.error('✖ Missing STORYBLOK_SPACE_ID or STORYBLOK_OAUTH_TOKEN in .env');
  console.error('  Get a Personal Access Token: app.storyblok.com → My Account → Personal access tokens');
  process.exit(1);
}

async function api(path, options = {}) {
  const res = await fetch(`${BASE}/spaces/${SPACE}${path}`, {
    ...options,
    headers: { Authorization: TOKEN, 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${options.method || 'GET'} ${path} → ${res.status}: ${body}`);
  }
  return res.status === 204 ? null : res.json();
}

// ---- 1. content type ----
async function ensurePostComponent() {
  const { components } = await api('/components/');
  const existing = components.find((c) => c.name === 'post');
  const schema = {
    title: { type: 'text', pos: 0, display_name: 'Title' },
    date: { type: 'datetime', pos: 1, display_name: 'Date', disable_time: true },
    excerpt: { type: 'textarea', pos: 2, display_name: 'Excerpt' },
    tags: { type: 'text', pos: 3, display_name: 'Tags (comma-separated)' },
    content: { type: 'markdown', pos: 4, display_name: 'Content', rich_markdown: true },
  };
  const payload = { component: { name: 'post', display_name: 'Post', schema, is_root: true, is_nestable: false } };
  if (existing) {
    await api(`/components/${existing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
    console.log('• post content type updated');
  } else {
    await api('/components/', { method: 'POST', body: JSON.stringify(payload) });
    console.log('• post content type created');
  }
}

// ---- 2. blog folder ----
async function ensureBlogFolder() {
  const { stories } = await api('/stories/?with_slug=blog');
  const existing = (stories || []).find((s) => s.slug === 'blog' && s.is_folder);
  if (existing) return existing.id;
  const { story } = await api('/stories/', {
    method: 'POST',
    body: JSON.stringify({ story: { name: 'Blog', slug: 'blog', is_folder: true } }),
  });
  console.log('• blog folder created');
  return story.id;
}

// ---- 3. the post ----
function parseWriteup(md) {
  const lines = md.split('\n');
  const h1 = lines.findIndex((l) => l.startsWith('# '));
  const title = h1 >= 0 ? lines[h1].replace(/^#\s+/, '').trim() : 'Untitled';
  // excerpt = first non-empty, non-heading paragraph after the title
  let excerpt = '';
  for (let i = h1 + 1; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t && !t.startsWith('#') && t !== '---') { excerpt = t.replace(/[*_`]/g, ''); break; }
  }
  // body = everything after the H1 line (title is rendered separately by the page)
  const content = h1 >= 0 ? lines.slice(h1 + 1).join('\n').trim() : md;
  return { title, excerpt, content };
}

async function ensurePost(parentId) {
  const md = await readFile(new URL('../WRITEUP.md', import.meta.url), 'utf8');
  const { title, excerpt, content } = parseWriteup(md);
  const slug = 'intercepting-firestore';
  const story = {
    name: title,
    slug,
    parent_id: parentId,
    content: {
      component: 'post',
      title,
      date: '2026-06-17 00:00',
      excerpt,
      tags: 'firebase, firestore, frida, mobile, write-up',
      content,
    },
  };

  const { stories } = await api(`/stories/?with_slug=blog/${slug}`);
  const existing = (stories || []).find((s) => s.full_slug === `blog/${slug}`);
  if (existing) {
    await api(`/stories/${existing.id}`, { method: 'PUT', body: JSON.stringify({ story, publish: 1 }) });
    console.log(`• post updated & published: blog/${slug}`);
  } else {
    await api('/stories/', { method: 'POST', body: JSON.stringify({ story, publish: 1 }) });
    console.log(`• post created & published: blog/${slug}`);
  }
}

console.log(`Seeding Storyblok space ${SPACE} (${REGION})…`);
await ensurePostComponent();
const folderId = await ensureBlogFolder();
await ensurePost(folderId);
console.log('✓ Done. Rebuild the site to see the post.');
