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
<svg viewBox="0 0 760 360" role="img" aria-label="Why a normal proxy sees Firestore as one opaque connection">
<defs><marker id="ah1" markerWidth="9" markerHeight="9" refX="6.5" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" class="d-arrow"/></marker></defs>
<text class="d-lane" x="14" y="26">ORDINARY REST  ·  PLAIN HTTP</text>
<rect class="d-box" x="40" y="44" width="108" height="46" rx="8"/><text class="d-t" x="94" y="72" text-anchor="middle">app</text>
<rect class="d-box" x="612" y="44" width="108" height="46" rx="8"/><text class="d-t" x="666" y="72" text-anchor="middle">server</text>
<line class="d-edge" x1="152" y1="58" x2="606" y2="58" marker-end="url(#ah1)"/><text class="d-s" x="379" y="51" text-anchor="middle">GET /v1/profile</text>
<line class="d-edge-dim" x1="606" y1="78" x2="156" y2="78" marker-end="url(#ah1)"/><text class="d-s" x="379" y="94" text-anchor="middle">200 · JSON body</text>
<rect class="d-chip" x="196" y="106" width="116" height="22" rx="5"/><text class="d-chip-t" x="254" y="121" text-anchor="middle">GET /profile</text>
<rect class="d-chip" x="320" y="106" width="116" height="22" rx="5"/><text class="d-chip-t" x="378" y="121" text-anchor="middle">POST /login</text>
<rect class="d-chip" x="444" y="106" width="120" height="22" rx="5"/><text class="d-chip-t" x="504" y="121" text-anchor="middle">PATCH /name</text>
<text class="d-ok" x="379" y="152" text-anchor="middle">proxy logs every request as its own entry   [ fully visible ]</text>
<line class="d-div" x1="14" y1="182" x2="746" y2="182"/>
<text class="d-lane" x="14" y="212">FIRESTORE  ·  gRPC OVER HTTP/2 (TLS)</text>
<rect class="d-box" x="40" y="230" width="108" height="46" rx="8"/><text class="d-t" x="94" y="258" text-anchor="middle">app</text>
<rect class="d-box" x="612" y="230" width="108" height="46" rx="8"/><text class="d-t" x="666" y="258" text-anchor="middle">server</text>
<text class="d-s" x="380" y="240" text-anchor="middle">one long-lived stream — protobuf frames, multiplexed</text>
<line class="d-edge-dim" x1="148" y1="259" x2="612" y2="259"/>
<rect class="d-frame" x="162" y="251" width="40" height="16" rx="3"/><text class="d-fl" x="182" y="263" text-anchor="middle">W</text>
<rect class="d-frame2" x="218" y="251" width="40" height="16" rx="3"/><text class="d-fl" x="238" y="263" text-anchor="middle">L</text>
<rect class="d-frame" x="274" y="251" width="40" height="16" rx="3"/><text class="d-fl" x="294" y="263" text-anchor="middle">W</text>
<rect class="d-frame2" x="330" y="251" width="40" height="16" rx="3"/><text class="d-fl" x="350" y="263" text-anchor="middle">L</text>
<rect class="d-frame" x="386" y="251" width="40" height="16" rx="3"/><text class="d-fl" x="406" y="263" text-anchor="middle">W</text>
<rect class="d-frame2" x="442" y="251" width="40" height="16" rx="3"/><text class="d-fl" x="462" y="263" text-anchor="middle">L</text>
<rect class="d-frame" x="498" y="251" width="40" height="16" rx="3"/><text class="d-fl" x="518" y="263" text-anchor="middle">W</text>
<rect class="d-frame2" x="554" y="251" width="40" height="16" rx="3"/><text class="d-fl" x="574" y="263" text-anchor="middle">L</text>
<rect class="d-chip-no" x="244" y="290" width="272" height="22" rx="5"/><text class="d-chip-nt" x="380" y="305" text-anchor="middle">CONNECT firestore.googleapis.com:443</text>
<text class="d-no" x="380" y="338" text-anchor="middle">proxy sees one opaque connection — every op hidden inside   [ invisible ]</text>
</svg>
<figcaption><b>Fig. 01</b> — the transport mismatch. Plain REST gives the proxy one entry per request; Firestore multiplexes every read (<b>L</b>isten) and write (<b>W</b>rite) as binary protobuf frames inside a single TLS stream, so individual operations never surface.</figcaption>
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

FIGURES['fig-jwt-arch'] = `<figure class="diagram">
<svg viewBox="0 0 720 286" role="img" aria-label="Multi-tenant SaaS architecture with the JWT and Source-header flaw">
<defs><marker id="ajw1" markerWidth="9" markerHeight="9" refX="6.5" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" class="d-arrow"/></marker></defs>
<text class="d-lane" x="14" y="26">MULTI-TENANT SAAS · SEGMENTED BY SUBDOMAIN</text>
<rect class="d-box-a" x="28" y="50" width="196" height="50" rx="9"/><text class="d-t" x="126" y="80" text-anchor="middle">b-one.target.com</text>
<rect class="d-box-a" x="28" y="132" width="196" height="50" rx="9"/><text class="d-t" x="126" y="162" text-anchor="middle">b-two.target.com</text>
<rect class="d-box" x="476" y="86" width="216" height="60" rx="9"/><text class="d-t" x="584" y="112" text-anchor="middle">api.target.com</text><text class="d-s" x="584" y="131" text-anchor="middle">one shared API · all tenants</text>
<line class="d-edge-dim" x1="224" y1="75" x2="474" y2="106" marker-end="url(#ajw1)"/><text class="d-no" x="352" y="82" text-anchor="middle">Source: B-One</text>
<line class="d-edge-dim" x1="224" y1="157" x2="474" y2="126" marker-end="url(#ajw1)"/><text class="d-no" x="352" y="166" text-anchor="middle">Source: B-Two</text>
<text class="d-s" x="360" y="212" text-anchor="middle">tenant routing trusts the client-set Source header</text>
<text class="d-s" x="360" y="234" text-anchor="middle">JWT identifies the user by email (username) — no tenant_id / aud / scope</text>
<text class="d-no" x="360" y="268" text-anchor="middle">✕ nothing cryptographically binds a token to its tenant</text>
</svg>
<figcaption><b>Fig. 01</b> — the architecture. Two subdomains share one API; tenants are told apart only by a client-supplied <code>Source</code> header, and JWTs are keyed on email — so a token carries no proof of which tenant it belongs to.</figcaption>
</figure>`;

FIGURES['fig-jwt-attack'] = `<figure class="diagram">
<svg viewBox="0 0 720 268" role="img" aria-label="Cross-tenant JWT account takeover flow">
<defs><marker id="ajw2" markerWidth="9" markerHeight="9" refX="6.5" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" class="d-arrow"/></marker></defs>
<text class="d-lane" x="14" y="24">THE TAKEOVER</text>
<rect class="d-box" x="20" y="42" width="184" height="62" rx="9"/><text class="d-t" x="112" y="68" text-anchor="middle">register victim email</text><text class="d-s" x="112" y="86" text-anchor="middle">on b-two → get JWT</text>
<rect class="d-box" x="266" y="42" width="192" height="62" rx="9"/><text class="d-t" x="362" y="66" text-anchor="middle">replay to api.target.com</text><text class="d-s" x="362" y="84" text-anchor="middle">Authorization: JWT(b-two)</text><text class="d-s" x="362" y="98" text-anchor="middle">Source: B-One</text>
<rect class="d-box-a" x="520" y="42" width="176" height="62" rx="9"/><text class="d-t" x="608" y="68" text-anchor="middle">b-one account</text><text class="d-s" x="608" y="86" text-anchor="middle">taken over</text>
<line class="d-edge" x1="204" y1="73" x2="264" y2="73" marker-end="url(#ajw2)"/>
<line class="d-edge" x1="458" y1="73" x2="518" y2="73" marker-end="url(#ajw2)"/>
<text class="d-s" x="360" y="142" text-anchor="middle">↳ then repeat with an admin email (found via OSINT)</text>
<rect class="d-box" x="20" y="160" width="184" height="56" rx="9"/><text class="d-t" x="112" y="186" text-anchor="middle">admin email</text><text class="d-s" x="112" y="204" text-anchor="middle">register on b-two</text>
<line class="d-edge" x1="204" y1="188" x2="300" y2="188" marker-end="url(#ajw2)"/>
<rect class="d-box-a" x="302" y="160" width="394" height="56" rx="9"/><text class="d-t" x="499" y="186" text-anchor="middle">full admin across the platform</text><text class="d-s" x="499" y="204" text-anchor="middle">all users · reset creds · logs · billing</text>
</svg>
<figcaption><b>Fig. 02</b> — the exploit. A JWT minted on one tenant is replayed against another by flipping the <code>Source</code> header; trusted by email alone, it impersonates the matching user — then the same move with an admin's email yields full control.</figcaption>
</figure>`;

FIGURES['fig-response-manip'] = `<figure class="diagram">
<svg viewBox="0 0 720 300" role="img" aria-label="Free to paid by rewriting the response the client trusts">
<defs><marker id="arm" markerWidth="9" markerHeight="9" refX="6.5" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" class="d-arrow"/></marker></defs>
<text class="d-lane" x="14" y="26">CLIENT-SIDE ENTITLEMENTS · THE GATE LIVES IN THE RESPONSE</text>
<rect class="d-box" x="24" y="60" width="150" height="58" rx="9"/><text class="d-t" x="99" y="86" text-anchor="middle">server</text><text class="d-s" x="99" y="104" text-anchor="middle">sends index page</text>
<rect class="d-box-a" x="275" y="60" width="170" height="58" rx="9"/><text class="d-t" x="360" y="86" text-anchor="middle">browser extension</text><text class="d-s" x="360" y="104" text-anchor="middle">rewrite response stream</text>
<rect class="d-box" x="546" y="60" width="150" height="58" rx="9"/><text class="d-t" x="621" y="86" text-anchor="middle">app (browser)</text><text class="d-s" x="621" y="104" text-anchor="middle">renders as paid</text>
<line class="d-edge" x1="174" y1="89" x2="273" y2="89" marker-end="url(#arm)"/>
<line class="d-edge" x1="445" y1="89" x2="544" y2="89" marker-end="url(#arm)"/>
<text class="d-lane" x="14" y="162">BEFORE · AS SERVED TO A FREE USER</text>
<rect class="d-chip-no" x="24" y="176" width="320" height="24" rx="5"/><text class="d-chip-nt" x="184" y="192" text-anchor="middle">User.Plan = "Free"  ·  x5 in response</text>
<rect class="d-chip-no" x="24" y="208" width="320" height="24" rx="5"/><text class="d-chip-nt" x="184" y="224" text-anchor="middle">FeaturesMap: false · "Limited_Access"</text>
<text class="d-lane" x="376" y="162">AFTER · REWRITTEN IN FLIGHT</text>
<rect class="d-chip" x="376" y="176" width="320" height="24" rx="5"/><text class="d-chip-t" x="536" y="192" text-anchor="middle">s/Free/Paid/g → User.Plan = "Paid"</text>
<rect class="d-chip" x="376" y="208" width="320" height="24" rx="5"/><text class="d-chip-t" x="536" y="224" text-anchor="middle">FeaturesMap: true · "Full_Access"</text>
<text class="d-no" x="360" y="268" text-anchor="middle">✕ no server-side check — the client trusts the response it is given</text>
</svg>
<figcaption><b>Fig. 01</b> — the entitlement gate lived entirely in the response. The extension rewrites the index-page stream in flight, flipping the <code>Plan</code> string and every feature flag, so a free account renders with full paid access.</figcaption>
</figure>`;

FIGURES['fig-soql-xss'] = `<figure class="diagram">
<svg viewBox="0 0 720 300" role="img" aria-label="Stored XSS via a SOQL query console that returns HTML">
<defs><marker id="asx" markerWidth="9" markerHeight="9" refX="6.5" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" class="d-arrow"/></marker></defs>
<text class="d-lane" x="14" y="26">STORED PAYLOAD → SOQL CONSOLE → HTML RESPONSE</text>
<rect class="d-box-a" x="24" y="54" width="184" height="66" rx="9"/><text class="d-t" x="116" y="80" text-anchor="middle">attacker</text><text class="d-s" x="116" y="98" text-anchor="middle">seeds XSS in a user record</text><text class="d-s" x="116" y="112" text-anchor="middle">on site.redacted.sites</text>
<rect class="d-box" x="268" y="54" width="184" height="66" rx="9"/><text class="d-t" x="360" y="80" text-anchor="middle">QueryConsole</text><text class="d-s" x="360" y="98" text-anchor="middle">api.redacted.com</text><text class="d-s" x="360" y="112" text-anchor="middle">SELECT … FROM User</text>
<rect class="d-box" x="512" y="54" width="184" height="66" rx="9"/><text class="d-t" x="604" y="80" text-anchor="middle">console user</text><text class="d-s" x="604" y="98" text-anchor="middle">admin or anyone with</text><text class="d-s" x="604" y="112" text-anchor="middle">QueryConsole access</text>
<line class="d-edge-dim" x1="208" y1="86" x2="266" y2="86" marker-end="url(#asx)"/><text class="d-s" x="237" y="78" text-anchor="middle">store</text>
<line class="d-edge" x1="452" y1="86" x2="510" y2="86" marker-end="url(#asx)"/><text class="d-s" x="481" y="78" text-anchor="middle">render</text>
<rect class="d-chip" x="150" y="152" width="420" height="26" rx="5"/><text class="d-chip-t" x="360" y="169" text-anchor="middle">GET /QueryConsole?q=SELECT Id,FirstName,… FROM User</text>
<rect class="d-chip-no" x="150" y="188" width="420" height="26" rx="5"/><text class="d-chip-nt" x="360" y="205" text-anchor="middle">Content-Type: text/html — not JSON, not encoded</text>
<text class="d-no" x="360" y="248" text-anchor="middle">✕ the dashboard UI encoded the output, the raw endpoint did not</text>
<text class="d-ok" x="360" y="274" text-anchor="middle">payload executes for every consumer of the endpoint</text>
</svg>
<figcaption><b>Fig. 01</b> — the dashboard escaped query results, but the underlying <code>QueryConsole</code> endpoint returned raw HTML. A payload stored in a user record on the managed site executes in the browser of anyone who runs the query.</figcaption>
</figure>`;

FIGURES['fig-appt-arch'] = `<figure class="diagram">
<svg viewBox="0 0 720 250" role="img" aria-label="Appointment booking architecture with GET-parameter session tokens">
<defs><marker id="aap" markerWidth="9" markerHeight="9" refX="6.5" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" class="d-arrow"/></marker></defs>
<text class="d-lane" x="14" y="26">APPOINTMENT BOOKING · SESSIONS CARRIED IN GET PARAMETERS</text>
<rect class="d-box-a" x="28" y="54" width="176" height="60" rx="9"/><text class="d-t" x="116" y="80" text-anchor="middle">admin</text><text class="d-s" x="116" y="98" text-anchor="middle">manages appointments</text>
<rect class="d-box" x="272" y="54" width="176" height="60" rx="9"/><text class="d-t" x="360" y="80" text-anchor="middle">admin panel</text><text class="d-s" x="360" y="98" text-anchor="middle">appointment manager</text>
<rect class="d-box" x="516" y="54" width="180" height="60" rx="9"/><text class="d-t" x="606" y="80" text-anchor="middle">booking website</text><text class="d-s" x="606" y="98" text-anchor="middle">PHP back end</text>
<line class="d-edge" x1="204" y1="84" x2="270" y2="84" marker-end="url(#aap)"/>
<line class="d-edge-dim" x1="448" y1="84" x2="514" y2="84" marker-end="url(#aap)"/>
<rect class="d-box-a" x="516" y="166" width="180" height="56" rx="9"/><text class="d-t" x="606" y="190" text-anchor="middle">guest</text><text class="d-s" x="606" y="208" text-anchor="middle">quick visit · no account</text>
<line class="d-edge" x1="606" y1="166" x2="606" y2="116" marker-end="url(#aap)"/><text class="d-s" x="606" y="142" text-anchor="middle">books</text>
<rect class="d-chip-no" x="28" y="150" width="430" height="26" rx="5"/><text class="d-chip-nt" x="243" y="167" text-anchor="middle">?…&amp;PHPSESSID=…  →  session token rides in the URL</text>
<text class="d-no" x="243" y="206" text-anchor="middle">✕ leaks to history, logs, referrers, Wayback</text>
</svg>
<figcaption><b>Fig. 01</b> — the architecture. Guests book appointments without an account; the site tracks sessions with a <code>PHPSESSID</code> in the query string instead of a cookie, so the token leaks into archived URLs.</figcaption>
</figure>`;

FIGURES['fig-upload-xss'] = `<figure class="diagram">
<svg viewBox="0 0 720 300" role="img" aria-label="Stored XSS through an unsanitised upload URL reflected into the admin panel">
<defs><marker id="aux" markerWidth="9" markerHeight="9" refX="6.5" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" class="d-arrow"/></marker></defs>
<text class="d-lane" x="14" y="26">FILE UPLOAD · ATTACKER-CONTROLLED URL REFLECTED TO ADMIN</text>
<rect class="d-box-a" x="28" y="52" width="150" height="54" rx="9"/><text class="d-t" x="103" y="76" text-anchor="middle">guest</text><text class="d-s" x="103" y="94" text-anchor="middle">uploads a file</text>
<rect class="d-box" x="430" y="52" width="170" height="54" rx="9"/><text class="d-t" x="515" y="76" text-anchor="middle">cloud storage</text><text class="d-s" x="515" y="94" text-anchor="middle">third-party service</text>
<line class="d-edge" x1="178" y1="72" x2="428" y2="72" marker-end="url(#aux)"/><text class="d-s" x="303" y="64" text-anchor="middle">1 · upload file</text>
<line class="d-edge-dim" x1="428" y1="92" x2="180" y2="92" marker-end="url(#aux)"/><text class="d-s" x="304" y="106" text-anchor="middle">2 · returns file URL, saved in a post parameter</text>
<rect class="d-box-a" x="28" y="150" width="150" height="56" rx="9"/><text class="d-t" x="103" y="174" text-anchor="middle">guest</text><text class="d-s" x="103" y="192" text-anchor="middle">controls the URL</text>
<rect class="d-box" x="285" y="150" width="170" height="56" rx="9"/><text class="d-t" x="370" y="174" text-anchor="middle">server</text><text class="d-s" x="370" y="192" text-anchor="middle">stores URL, no sanitising</text>
<rect class="d-box" x="546" y="150" width="150" height="56" rx="9"/><text class="d-t" x="621" y="174" text-anchor="middle">admin panel</text><text class="d-s" x="621" y="192" text-anchor="middle">URL placed in href</text>
<line class="d-edge" x1="178" y1="178" x2="283" y2="178" marker-end="url(#aux)"/><text class="d-s" x="230" y="170" text-anchor="middle">3 · send URL</text>
<line class="d-edge" x1="455" y1="178" x2="544" y2="178" marker-end="url(#aux)"/><text class="d-s" x="500" y="170" text-anchor="middle">4 · reflect</text>
<rect class="d-chip-no" x="180" y="234" width="360" height="26" rx="5"/><text class="d-chip-nt" x="360" y="251" text-anchor="middle">"&gt;&lt;img src=x onerror=alert()&gt;</text>
<text class="d-no" x="360" y="288" text-anchor="middle">✕ attacker-set URL rendered in href, unsanitised → XSS in admin session</text>
</svg>
<figcaption><b>Fig. 02</b> — the upload data flow. The guest controls the file URL the cloud service returns; the server stores it and the admin panel renders it inside an <code>href</code> without sanitising, so a crafted URL executes as script in the admin's session.</figcaption>
</figure>`;

FIGURES['fig-attachment-takeover'] = `<figure class="diagram">
<svg viewBox="0 0 720 330" role="img" aria-label="Infrastructure takeover via insecure attachment handling">
<defs><marker id="aat" markerWidth="9" markerHeight="9" refX="6.5" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" class="d-arrow"/></marker></defs>
<text class="d-lane" x="14" y="24">ATTACHMENT FETCHER · NATIVE RUBY · ON AWS · SERVER-SIDE</text>
<rect class="d-box-a" x="20" y="44" width="150" height="58" rx="9"/><text class="d-t" x="95" y="70" text-anchor="middle">attacker</text><text class="d-s" x="95" y="88" text-anchor="middle">sends an email</text>
<rect class="d-box" x="266" y="44" width="188" height="58" rx="9"/><text class="d-t" x="360" y="68" text-anchor="middle">email + attachment API</text><text class="d-s" x="360" y="86" text-anchor="middle">fetches attachment URL server-side</text>
<rect class="d-box-a" x="550" y="44" width="150" height="58" rx="9"/><text class="d-t" x="625" y="68" text-anchor="middle">attacker inbox</text><text class="d-s" x="625" y="86" text-anchor="middle">receives the file</text>
<line class="d-edge" x1="170" y1="73" x2="264" y2="73" marker-end="url(#aat)"/>
<line class="d-edge" x1="454" y1="73" x2="548" y2="73" marker-end="url(#aat)"/>
<text class="d-s" x="217" y="116" text-anchor="middle">attachment.url</text>
<text class="d-s" x="501" y="116" text-anchor="middle">file content</text>
<text class="d-lane" x="14" y="156">PROBES</text>
<rect class="d-chip-no" x="20" y="168" width="332" height="24" rx="5"/><text class="d-chip-nt" x="186" y="184" text-anchor="middle">http://169.254.169.254/  ·  file://  ·  blocked by WAF</text>
<rect class="d-chip" x="368" y="168" width="332" height="24" rx="5"/><text class="d-chip-t" x="534" y="184" text-anchor="middle">/proc/self/environ  ·  bare path, no protocol  ·  read</text>
<text class="d-lane" x="14" y="224">EXFILTRATED FROM /proc/self/environ</text>
<rect class="d-chip" x="20" y="236" width="178" height="24" rx="5"/><text class="d-chip-t" x="109" y="252" text-anchor="middle">AWS_SECRET_ACCESS_KEY</text>
<rect class="d-chip" x="210" y="236" width="118" height="24" rx="5"/><text class="d-chip-t" x="269" y="252" text-anchor="middle">DATABASE_URL</text>
<rect class="d-chip" x="340" y="236" width="150" height="24" rx="5"/><text class="d-chip-t" x="415" y="252" text-anchor="middle">Twilio · Stripe</text>
<rect class="d-chip" x="502" y="236" width="100" height="24" rx="5"/><text class="d-chip-t" x="552" y="252" text-anchor="middle">SendGrid</text>
<rect class="d-chip" x="614" y="236" width="86" height="24" rx="5"/><text class="d-chip-t" x="657" y="252" text-anchor="middle">RSA key</text>
<text class="d-no" x="360" y="296" text-anchor="middle">✕ a URL fetcher that resolves local paths is a file read — and the file body is the secrets store</text>
</svg>
<figcaption><b>Fig. 01</b> — the attachment fetcher accepted a bare local path instead of a URL, turning an email feature into a server-side file read. Reading <code>/proc/self/environ</code> returned the process environment and its secrets straight into the attacker's inbox.</figcaption>
</figure>`;

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
