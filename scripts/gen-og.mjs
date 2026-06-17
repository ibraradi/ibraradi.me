// Generates public/og.png (1200x630) — the social preview card.
// Run once with: node scripts/gen-og.mjs   (re-run if the text changes)
import sharp from 'sharp';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#34d399"/>
      <stop offset="1" stop-color="#22d3ee"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#0a0e14"/>
  <rect x="0" y="0" width="1200" height="630" fill="none" stroke="#1e2a3a" stroke-width="2"/>
  <rect x="80" y="150" width="6" height="330" fill="url(#g)"/>
  <text x="120" y="138" font-family="Arial, Helvetica, sans-serif" font-size="26" letter-spacing="6" fill="#34d399">// OSINT DOSSIER · SUBJECT PROFILE</text>
  <text x="116" y="300" font-family="Arial, Helvetica, sans-serif" font-size="118" font-weight="bold" fill="#f4f7fb">Ibrahim Radi</text>
  <text x="120" y="372" font-family="Arial, Helvetica, sans-serif" font-size="46" fill="#8a99b0">Security Engineer &amp; builder</text>
  <text x="120" y="446" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#c9d1d9">ASM · Threat Intel · Pentesting · CTF</text>
  <text x="120" y="540" font-family="Arial, Helvetica, sans-serif" font-size="30" letter-spacing="2" fill="#34d399">ibraradi.me</text>
  <text x="990" y="138" font-family="Arial, Helvetica, sans-serif" font-size="80" font-weight="bold" fill="url(#g)">IR</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/og.png');
console.log('✓ public/og.png generated');
