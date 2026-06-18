// Prebuild step (plain Node): fetch published posts from Storyblok, render their
// markdown to Shiki-highlighted HTML, and write src/generated/posts.json.
//
// Runs in plain Node — where Shiki's grammar loading works reliably (it breaks
// when bundled into the Astro/Vite build). Astro then just outputs this HTML.
import { writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';
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

// Add anchor ids to <h2> headings and collect a table of contents.
function withHeadingsAndToc(rawHtml) {
  const toc = [];
  const seen = new Set();
  const html = rawHtml.replace(/<h2>([\s\S]*?)<\/h2>/g, (_m, inner) => {
    const text = inner
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .trim();
    let id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section';
    while (seen.has(id)) id += '-x';
    seen.add(id);
    toc.push({ id, text });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html, toc };
}

// Schematic diagrams, themed via .diagram CSS classes. Referenced from the
// markdown with a placeholder on its own line, e.g.  [[fig-transport]]
const FIGURES = {
  'fig-transport': `<figure class="diagram">
<svg viewBox="0 0 720 248" role="img" aria-label="A normal proxy sees Firestore as one opaque connection">
<defs><marker id="ah1" markerWidth="9" markerHeight="9" refX="6.5" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" class="d-arrow"/></marker></defs>
<text class="d-lane" x="14" y="28">ORDINARY REST</text>
<rect class="d-box" x="56" y="42" width="104" height="44" rx="8"/><text class="d-t" x="108" y="69" text-anchor="middle">app</text>
<rect class="d-box" x="560" y="42" width="118" height="44" rx="8"/><text class="d-t" x="619" y="69" text-anchor="middle">server</text>
<line class="d-edge" x1="166" y1="56" x2="554" y2="56" marker-end="url(#ah1)"/><text class="d-s" x="360" y="49" text-anchor="middle">request</text>
<line class="d-edge-dim" x1="554" y1="72" x2="172" y2="72" marker-end="url(#ah1)"/><text class="d-s" x="360" y="86" text-anchor="middle">response</text>
<text class="d-ok" x="360" y="112" text-anchor="middle">proxy logs one entry per pair   [ visible ]</text>
<line class="d-div" x1="14" y1="130" x2="706" y2="130"/>
<text class="d-lane" x="14" y="158">FIRESTORE  ·  gRPC OVER HTTP/2</text>
<rect class="d-box" x="56" y="172" width="104" height="44" rx="8"/><text class="d-t" x="108" y="199" text-anchor="middle">app</text>
<rect class="d-box" x="560" y="172" width="118" height="44" rx="8"/><text class="d-t" x="619" y="199" text-anchor="middle">server</text>
<line class="d-pipe" x1="166" y1="194" x2="560" y2="194"/>
<text class="d-s" x="363" y="187" text-anchor="middle">one long-lived stream — protobuf Listen / Write frames</text>
<text class="d-no" x="360" y="234" text-anchor="middle">proxy sees one opaque pipe; writes hidden inside   [ invisible ]</text>
</svg>
<figcaption><b>Fig. 01</b> — the transport mismatch. Discrete REST pairs each surface in the proxy; Firestore multiplexes every read and write inside a single stream, so individual operations never appear.</figcaption>
</figure>`,
  'fig-pipeline': `<figure class="diagram">
<svg viewBox="0 0 720 292" role="img" aria-label="One capture feeding two front-ends">
<defs><marker id="ah2" markerWidth="9" markerHeight="9" refX="6.5" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" class="d-arrow"/></marker></defs>
<rect class="d-box-a" x="24" y="40" width="156" height="58" rx="9"/><text class="d-t" x="102" y="66" text-anchor="middle">app</text><text class="d-s" x="102" y="84" text-anchor="middle">Frida-hooked SDK</text>
<rect class="d-box" x="282" y="40" width="156" height="58" rx="9"/><text class="d-t" x="360" y="66" text-anchor="middle">local listener</text><text class="d-s" x="360" y="84" text-anchor="middle">rebuild Firestore REST</text>
<rect class="d-box" x="540" y="40" width="156" height="58" rx="9"/><text class="d-t" x="618" y="66" text-anchor="middle">Firestore</text><text class="d-s" x="618" y="84" text-anchor="middle">REST API</text>
<line class="d-edge" x1="180" y1="62" x2="280" y2="62" marker-end="url(#ah2)"/><text class="d-s" x="230" y="55" text-anchor="middle">capture</text><text class="d-s" x="230" y="120" text-anchor="middle">op · path · data · token</text>
<line class="d-edge" x1="438" y1="62" x2="538" y2="62" marker-end="url(#ah2)"/><text class="d-s" x="488" y="55" text-anchor="middle">replay</text><text class="d-s" x="488" y="120" text-anchor="middle">Bearer + project from aud</text>
<line class="d-edge-dim" x1="360" y1="98" x2="360" y2="150"/>
<line class="d-edge-dim" x1="360" y1="150" x2="278" y2="194" marker-end="url(#ah2)"/>
<line class="d-edge-dim" x1="360" y1="150" x2="484" y2="194" marker-end="url(#ah2)"/>
<rect class="d-box" x="198" y="196" width="160" height="58" rx="9"/><text class="d-t" x="278" y="222" text-anchor="middle">Workbench</text><text class="d-s" x="278" y="240" text-anchor="middle">standalone GUI</text>
<rect class="d-box" x="394" y="196" width="180" height="58" rx="9"/><text class="d-t" x="484" y="222" text-anchor="middle">Burp extension</text><text class="d-s" x="484" y="240" text-anchor="middle">Proxy → HTTP history</text>
</svg>
<figcaption><b>Fig. 02</b> — one capture, two front-ends. The Frida agent's feed drives both the standalone Workbench and the Burp extension; either rebuilds the Firestore REST call and replays it.</figcaption>
</figure>`,
};

function injectFigures(html) {
  return html.replace(/<p>\s*\[\[([a-z0-9-]+)\]\]\s*<\/p>/g, (_m, key) => FIGURES[key] || '');
}

// ---- per-post social thumbnail (1200x630), generated from the title ----
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function wrapText(text, max) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if (cur && (cur + ' ' + w).length > max) { lines.push(cur); cur = w; }
    else cur = cur ? cur + ' ' + w : w;
  }
  if (cur) lines.push(cur);
  return lines;
}
function ogSvg({ title, date, tags }) {
  let lines = wrapText(title, 24);
  let fs = 64, lh = 78;
  if (lines.length > 3) { lines = wrapText(title, 30); fs = 52; lh = 64; }
  if (lines.length > 4) { lines = lines.slice(0, 4); lines[3] = lines[3].replace(/[^\w)]+$/, '') + '…'; }
  const blockH = lines.length * lh;
  const topY = Math.round(300 - blockH / 2);
  const dateLabel = date
    ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
    : '';
  const meta = [dateLabel, (tags || []).slice(0, 4).join('  ·  ')].filter(Boolean).join('       ');
  const titleSvg = lines
    .map((l, i) =>
      `<text x="104" y="${Math.round(topY + i * lh + fs * 0.78)}" font-family="Helvetica, Arial, sans-serif" font-size="${fs}" font-weight="bold" fill="#f4f7fb">${esc(l)}</text>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#34d399"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs>
<rect width="1200" height="630" fill="#0a0e14"/>
<rect x="1.5" y="1.5" width="1197" height="627" rx="16" fill="none" stroke="#1e2a3a" stroke-width="2"/>
<rect x="80" y="${topY}" width="6" height="${blockH}" fill="url(#g)"/>
<text x="104" y="118" font-family="monospace" font-size="25" letter-spacing="6" fill="#34d399">// FIELD NOTES · OSINT DOSSIER</text>
${titleSvg}
<text x="104" y="556" font-family="monospace" font-size="24" letter-spacing="2" fill="#8a99b0">${esc(meta)}</text>
<text x="104" y="595" font-family="monospace" font-size="26" letter-spacing="3" fill="#34d399">ibraradi.me</text>
<text x="1086" y="120" font-family="monospace" font-size="72" font-weight="bold" fill="url(#g)">IR</text>
</svg>`;
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
  await mkdir('public/og', { recursive: true });
  for (const s of stories) {
    const c = s.content || {};
    const { html, toc } = withHeadingsAndToc(injectFigures(await marked.parse(c.content || '')));
    const post = {
      slug: s.slug,
      fullSlug: s.full_slug,
      title: c.title || s.name,
      date: c.date || s.first_published_at || s.created_at || '',
      excerpt: c.excerpt || '',
      tags: toTags(c.tags),
      html,
      toc,
    };
    posts.push(post);
    // Auto-generate a 1200x630 social thumbnail from the title.
    await sharp(Buffer.from(ogSvg(post))).png().toFile(`public/og/${post.slug}.png`);
  }

  await mkdir('src/generated', { recursive: true });
  await writeFile('src/generated/posts.json', JSON.stringify(posts, null, 2));
  console.log(`✓ prerendered ${posts.length} post(s) → src/generated/posts.json`);
}

main();
