// One-off: a catchy 1200x630 social card for the Firestore write-up.
// Run:  node scripts/gen-social.mjs   ->  ./firestore-social.png
import sharp from 'sharp';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs>
  <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#34d399"/><stop offset="1" stop-color="#22d3ee"/></linearGradient>
  <radialGradient id="glowA" cx="85%" cy="8%" r="55%"><stop offset="0" stop-color="#22d3ee" stop-opacity="0.16"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></radialGradient>
  <radialGradient id="glowB" cx="6%" cy="95%" r="55%"><stop offset="0" stop-color="#34d399" stop-opacity="0.14"/><stop offset="1" stop-color="#34d399" stop-opacity="0"/></radialGradient>
  <pattern id="grid" width="46" height="46" patternUnits="userSpaceOnUse"><path d="M46 0H0V46" fill="none" stroke="#16202e" stroke-width="1"/></pattern>
  <pattern id="hazard" width="22" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(0)"><rect width="22" height="14" fill="#0a0e14"/><path d="M-4,14 L10,0 M8,14 L22,0 M20,14 L34,0" stroke="#f4b740" stroke-width="5" opacity="0.5"/></pattern>
  <marker id="ar" markerWidth="10" markerHeight="10" refX="6.5" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#34d399"/></marker>
</defs>

<rect width="1200" height="630" fill="#0a0e14"/>
<rect width="1200" height="630" fill="url(#grid)" opacity="0.55"/>
<rect width="1200" height="630" fill="url(#glowA)"/>
<rect width="1200" height="630" fill="url(#glowB)"/>
<rect x="1.5" y="1.5" width="1197" height="627" rx="16" fill="none" stroke="#1e2a3a" stroke-width="2"/>
<rect x="0" y="0" width="1200" height="12" fill="url(#hazard)"/>

<text x="70" y="78" font-family="monospace" font-size="23" letter-spacing="5" fill="#34d399">// OSINT DOSSIER · FIELD NOTES</text>
<text x="1130" y="92" text-anchor="end" font-family="monospace" font-size="58" font-weight="bold" fill="url(#g)">IR</text>

<text x="70" y="168" font-family="Helvetica, Arial, sans-serif" font-size="44" font-weight="bold" fill="#d6deeb" letter-spacing="1">INTERCEPTING &amp; TAMPERING</text>
<text x="66" y="262" font-family="Helvetica, Arial, sans-serif" font-size="104" font-weight="bold" fill="url(#g)">FIRESTORE</text>
<text x="70" y="306" font-family="monospace" font-size="24" fill="#8a99b0">traffic flowing · proxy running · yet nothing captured</text>

<rect x="70" y="372" width="150" height="70" rx="10" fill="rgba(52,211,153,0.10)" stroke="#34d399" stroke-width="1.2"/>
<text x="145" y="404" text-anchor="middle" font-family="monospace" font-size="20" fill="#f4f7fb">app</text>
<text x="145" y="426" text-anchor="middle" font-family="monospace" font-size="13" fill="#5c6b82">Flutter / Android</text>

<rect x="980" y="372" width="150" height="70" rx="10" fill="#161f2e" stroke="#2a3a50" stroke-width="1.2"/>
<text x="1055" y="404" text-anchor="middle" font-family="monospace" font-size="20" fill="#f4f7fb">Firestore</text>
<text x="1055" y="426" text-anchor="middle" font-family="monospace" font-size="13" fill="#5c6b82">gRPC / HTTP-2</text>

<line x1="220" y1="407" x2="980" y2="407" stroke="#34d399" stroke-width="11" opacity="0.4" stroke-linecap="round"/>
<text x="600" y="398" text-anchor="middle" font-family="monospace" font-size="16" fill="#8a99b0">one long-lived stream — binary protobuf Listen / Write frames</text>
<text x="600" y="466" text-anchor="middle" font-family="monospace" font-size="18" fill="#ff6b81">✕  a normal proxy sees one opaque pipe — the writes are hidden inside</text>

<text x="70" y="528" font-family="monospace" font-size="19" fill="#34d399">✓  the fix: hook the SDK with Frida → capture → rebuild → replay over the REST API</text>

<line x1="70" y1="556" x2="1130" y2="556" stroke="#1e2a3a" stroke-width="1"/>
<text x="70" y="592" font-family="monospace" font-size="22" letter-spacing="1" fill="#34d399">ibraradi.me/blog</text>
<text x="1130" y="592" text-anchor="end" font-family="monospace" font-size="18" fill="#8a99b0">full write-up + open-source toolkit</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('firestore-social.png');
console.log('✓ firestore-social.png (1200x630)');
