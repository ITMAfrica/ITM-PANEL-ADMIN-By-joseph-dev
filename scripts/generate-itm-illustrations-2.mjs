/**
 * Series 2 — denser, more complex ITM house illustrations.
 * Run: node scripts/generate-itm-illustrations-2.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'illustrations-2');
const PUBLIC = path.join(ROOT, 'public', 'assets', 'illustrations-2');

const C = {
  ink: '#1D141F',
  lime: '#E2F343',
  mist: '#E8ECEF',
  paper: '#FAFBFC',
  muted: '#8B939E',
  academy: '#D95800',
  slate: '#5C6470',
};

function wrap(inner, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" fill="none" role="img" aria-labelledby="t">
  <title id="t">${title.replace(/&/g, '&amp;')}</title>
  <defs>
    <linearGradient id="gPaper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FAFBFC"/>
      <stop offset="100%" stop-color="#EEF2F5"/>
    </linearGradient>
    <linearGradient id="gInk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2A2030"/>
      <stop offset="100%" stop-color="#1D141F"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <clipPath id="frame"><rect width="640" height="480" rx="32"/></clipPath>
  </defs>
  <g clip-path="url(#frame)">
    <rect width="640" height="480" fill="url(#gPaper)"/>
    <circle cx="560" cy="-20" r="160" fill="${C.lime}" fill-opacity="0.18"/>
    <circle cx="40" cy="460" r="140" fill="${C.ink}" fill-opacity="0.07"/>
    <path d="M0 360c80-40 160-20 240 10s160 40 240-10 120-50 160-20v140H0V360Z" fill="${C.mist}" fill-opacity="0.35"/>
${inner}
  </g>
</svg>
`;
}

const SPECS = [
  ['city-editorial-desk', 'Bureau éditorial panoramique', cityEditorialDesk],
  ['newsletter-assembly-line', 'Chaîne d\'assemblage newsletter', newsletterAssembly],
  ['orbit-workspace', 'Espace de travail orbital', orbitWorkspace],
  ['data-constellation', 'Constellation de données', dataConstellation],
  ['calendar-theater', 'Théâtre calendrier', calendarTheater],
  ['media-galaxy', 'Galerie média profonde', mediaGalaxy],
  ['secure-citadel', 'Citadelle sécurisée', secureCitadel],
  ['automation-gears', 'Mécanisme d\'automation', automationGears],
  ['audience-wave', 'Vague d\'audience', audienceWave],
  ['journey-map', 'Carte de parcours', journeyMap],
  ['empty-cathedral', 'Cathédrale vide (empty state)', emptyCathedral],
  ['error-maze-404', 'Labyrinthe 404', errorMaze404],
];

function cityEditorialDesk() {
  return `
    <!-- desk plane -->
    <path d="M40 340h560l-40 80H80L40 340Z" fill="${C.ink}" fill-opacity="0.9"/>
    <path d="M80 340h480" stroke="${C.lime}" stroke-width="3"/>
    <!-- monitor -->
    <rect x="180" y="120" width="280" height="180" rx="14" fill="url(#gInk)"/>
    <rect x="196" y="136" width="248" height="140" rx="8" fill="${C.paper}"/>
    <rect x="210" y="152" width="90" height="10" rx="5" fill="${C.lime}"/>
    <rect x="210" y="174" width="160" height="7" rx="3.5" fill="${C.mist}"/>
    <rect x="210" y="190" width="140" height="7" rx="3.5" fill="${C.mist}"/>
    <rect x="210" y="220" width="70" height="28" rx="14" fill="${C.ink}"/>
    <rect x="226" y="230" width="38" height="6" rx="3" fill="${C.lime}"/>
    <!-- stand -->
    <rect x="300" y="300" width="40" height="40" fill="${C.ink}"/>
    <rect x="260" y="330" width="120" height="12" rx="4" fill="${C.slate}"/>
    <!-- floating cards -->
    <g transform="translate(470 150) rotate(12)">
      <rect width="110" height="80" rx="12" fill="${C.lime}"/>
      <rect x="14" y="18" width="60" height="8" rx="4" fill="${C.ink}" opacity="0.35"/>
      <rect x="14" y="36" width="82" height="6" rx="3" fill="${C.ink}" opacity="0.2"/>
    </g>
    <g transform="translate(70 170) rotate(-10)">
      <rect width="100" height="120" rx="12" fill="${C.paper}" stroke="${C.mist}" stroke-width="3"/>
      <circle cx="50" cy="48" r="22" fill="${C.ink}"/>
      <rect x="20" y="84" width="60" height="8" rx="4" fill="${C.mist}"/>
    </g>
    <!-- plant -->
    <ellipse cx="540" cy="330" rx="28" ry="10" fill="${C.mist}"/>
    <path d="M540 330c-20-40-10-80 0-90 10 10 20 50 0 90Z" fill="${C.lime}"/>
    <path d="M540 330c20-35 8-75-6-88" fill="${C.lime}" opacity="0.7"/>`;
}

function newsletterAssembly() {
  return `
    <!-- conveyor -->
    <rect x="60" y="280" width="520" height="36" rx="18" fill="${C.ink}"/>
    <circle cx="100" cy="298" r="22" fill="${C.slate}"/>
    <circle cx="540" cy="298" r="22" fill="${C.slate}"/>
    <circle cx="100" cy="298" r="10" fill="${C.lime}"/>
    <circle cx="540" cy="298" r="10" fill="${C.lime}"/>
    <!-- blocks on belt -->
    <g>
      <rect x="150" y="220" width="90" height="70" rx="10" fill="${C.paper}" stroke="${C.mist}" stroke-width="3"/>
      <rect x="162" y="236" width="50" height="6" rx="3" fill="${C.lime}"/>
      <rect x="162" y="250" width="66" height="5" rx="2.5" fill="${C.mist}"/>
    </g>
    <g>
      <rect x="270" y="200" width="100" height="88" rx="12" fill="${C.ink}"/>
      <path d="M280 240l40 22 40-22" stroke="${C.lime}" stroke-width="3"/>
      <rect x="290" y="258" width="60" height="8" rx="4" fill="${C.mist}" opacity="0.3"/>
    </g>
    <g>
      <rect x="400" y="214" width="96" height="76" rx="12" fill="${C.lime}"/>
      <path d="M420 250l20 18 36-36" stroke="${C.ink}" stroke-width="5" stroke-linecap="round" fill="none"/>
    </g>
    <!-- robotic arm -->
    <circle cx="320" cy="100" r="18" fill="${C.ink}"/>
    <path d="M320 118v50" stroke="${C.ink}" stroke-width="14" stroke-linecap="round"/>
    <path d="M320 168l70 40" stroke="${C.ink}" stroke-width="12" stroke-linecap="round"/>
    <rect x="378" y="198" width="36" height="24" rx="6" fill="${C.academy}"/>
    <!-- arcs -->
    <path d="M200 90c40-40 100-40 140 0" stroke="${C.lime}" stroke-width="3" stroke-dasharray="8 8" fill="none"/>`;
}

function orbitWorkspace() {
  return `
    <ellipse cx="320" cy="240" rx="220" ry="90" fill="none" stroke="${C.mist}" stroke-width="3" stroke-dasharray="10 12"/>
    <ellipse cx="320" cy="240" rx="150" ry="60" fill="none" stroke="${C.ink}" stroke-width="2" opacity="0.35"/>
    <circle cx="320" cy="240" r="48" fill="url(#gInk)"/>
    <circle cx="320" cy="240" r="22" fill="${C.lime}"/>
    <!-- satellites -->
    <g transform="translate(140 200)">
      <rect width="70" height="54" rx="12" fill="${C.paper}" stroke="${C.mist}" stroke-width="3"/>
      <rect x="12" y="14" width="36" height="6" rx="3" fill="${C.ink}"/>
      <rect x="12" y="28" width="46" height="5" rx="2.5" fill="${C.mist}"/>
    </g>
    <g transform="translate(450 180)">
      <circle r="34" fill="${C.lime}"/>
      <path d="M-10 0h20M0-10v20" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>
    </g>
    <g transform="translate(380 300)">
      <rect x="-32" y="-24" width="64" height="48" rx="10" fill="${C.academy}"/>
      <rect x="-18" y="-8" width="36" height="6" rx="3" fill="${C.paper}" opacity="0.7"/>
    </g>
    <g transform="translate(210 300)">
      <path d="M0-28l22 48H-22L0-28Z" fill="${C.ink}"/>
      <circle cy="8" r="8" fill="${C.lime}"/>
    </g>
    <!-- connecting dots -->
    <circle cx="220" cy="210" r="5" fill="${C.lime}"/>
    <circle cx="420" cy="210" r="5" fill="${C.ink}"/>
    <path d="M250 220C280 180 360 180 390 220" stroke="${C.lime}" stroke-width="2" fill="none" opacity="0.6"/>`;
}

function dataConstellation() {
  const nodes = [
    [120, 140], [200, 90], [300, 120], [400, 80], [500, 130],
    [160, 230], [260, 210], [360, 250], [460, 220], [320, 320],
    [180, 340], [420, 350], [520, 280],
  ];
  const links = [
    [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 2], [2, 7],
    [7, 8], [8, 4], [6, 9], [7, 9], [9, 10], [9, 11], [8, 12],
  ];
  return `
    ${links
      .map(([a, b]) => {
        const [x1, y1] = nodes[a];
        const [x2, y2] = nodes[b];
        return `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${C.mist}" stroke-width="3"/>`;
      })
      .join('\n    ')}
    ${nodes
      .map(([x, y], i) => {
        const fill = i % 3 === 0 ? C.lime : i % 3 === 1 ? C.ink : C.academy;
        const r = i % 4 === 0 ? 14 : 10;
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/><circle cx="${x}" cy="${y}" r="${
          r + 10
        }" fill="none" stroke="${fill}" stroke-opacity="0.25" stroke-width="2"/>`;
      })
      .join('\n    ')}
    <rect x="250" y="180" width="140" height="70" rx="14" fill="${C.paper}" stroke="${C.ink}" stroke-width="3"/>
    <rect x="268" y="200" width="70" height="8" rx="4" fill="${C.lime}"/>
    <rect x="268" y="218" width="100" height="6" rx="3" fill="${C.mist}"/>`;
}

function calendarTheater() {
  return `
    <!-- stage curtains -->
    <path d="M40 40c40 80 40 160 0 280h80V40H40Z" fill="${C.academy}" opacity="0.85"/>
    <path d="M600 40c-40 80-40 160 0 280h-80V40H600Z" fill="${C.academy}" opacity="0.85"/>
    <path d="M40 40h560" stroke="${C.lime}" stroke-width="8"/>
    <!-- calendar panel -->
    <rect x="150" y="90" width="340" height="260" rx="20" fill="url(#gInk)"/>
    <rect x="150" y="90" width="340" height="56" rx="20" fill="${C.lime}"/>
    <rect x="150" y="128" width="340" height="18" fill="${C.lime}"/>
    ${[0, 1, 2, 3]
      .flatMap((r) =>
        [0, 1, 2, 3, 4].map((c) => {
          const highlight = r === 1 && c === 2;
          return `<rect x="${178 + c * 56}" y="${168 + r * 42}" width="40" height="30" rx="6" fill="${
            highlight ? C.lime : C.mist
          }" opacity="${highlight ? 1 : 0.22}"/>`;
        })
      )
      .join('\n    ')}
    <!-- spotlight -->
    <path d="M320 40l80 200H240L320 40Z" fill="${C.lime}" opacity="0.12"/>`;
}

function mediaGalaxy() {
  return `
    <circle cx="320" cy="230" r="120" fill="${C.ink}" opacity="0.08"/>
    <!-- polaroid stack -->
    <g transform="translate(200 140) rotate(-14)">
      <rect width="150" height="170" rx="10" fill="${C.paper}" stroke="${C.mist}" stroke-width="3"/>
      <rect x="14" y="14" width="122" height="100" rx="6" fill="${C.ink}"/>
      <circle cx="50" cy="50" r="16" fill="${C.lime}"/>
      <path d="M20 95l35-30 28 22 20-18 33 26H20Z" fill="${C.mist}" opacity="0.35"/>
    </g>
    <g transform="translate(300 130) rotate(8)">
      <rect width="150" height="170" rx="10" fill="${C.paper}" stroke="${C.mist}" stroke-width="3"/>
      <rect x="14" y="14" width="122" height="100" rx="6" fill="${C.slate}"/>
      <rect x="30" y="130" width="70" height="8" rx="4" fill="${C.ink}" opacity="0.25"/>
    </g>
    <g transform="translate(250 160) rotate(-2)">
      <rect width="160" height="180" rx="12" fill="${C.paper}" stroke="${C.ink}" stroke-width="3"/>
      <rect x="16" y="16" width="128" height="110" rx="8" fill="url(#gInk)"/>
      <circle cx="56" cy="56" r="18" fill="${C.lime}"/>
      <path d="M24 110l40-40 30 28 22-24 40 36H24Z" fill="${C.mist}" opacity="0.25"/>
      <rect x="32" y="142" width="80" height="8" rx="4" fill="${C.lime}"/>
    </g>
    <!-- orbit sparks -->
    <circle cx="140" cy="120" r="8" fill="${C.lime}"/>
    <circle cx="520" cy="160" r="6" fill="${C.academy}"/>
    <circle cx="480" cy="340" r="10" fill="${C.ink}"/>
    <path d="M150 130c80-60 280-80 360 20" stroke="${C.mist}" stroke-width="2" stroke-dasharray="6 8" fill="none"/>`;
}

function secureCitadel() {
  return `
    <!-- walls -->
    <path d="M80 320h480v40H80Z" fill="${C.ink}"/>
    <path d="M120 200h80v120H120Z" fill="${C.slate}"/>
    <path d="M440 180h80v140H440Z" fill="${C.slate}"/>
    <path d="M220 140h200v180H220Z" fill="url(#gInk)"/>
    <!-- battlements -->
    ${[0, 1, 2, 3, 4]
      .map(
        (i) =>
          `<rect x="${230 + i * 36}" y="120" width="24" height="28" rx="3" fill="${C.ink}"/>`
      )
      .join('\n    ')}
    <!-- gate -->
    <path d="M290 320V240c0-30 20-50 30-50s30 20 30 50v80" fill="${C.lime}"/>
    <circle cx="320" cy="270" r="8" fill="${C.ink}"/>
    <!-- shield badge -->
    <path d="M320 60l50 18v30c0 28-20 46-50 58-30-12-50-30-50-58V78l50-18Z" fill="${C.lime}"/>
    <path d="M300 95l14 14 26-28" stroke="${C.ink}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <!-- locks floating -->
    <rect x="100" y="140" width="40" height="36" rx="8" fill="${C.academy}"/>
    <path d="M110 140v-12a10 10 0 0 1 20 0v12" stroke="${C.academy}" stroke-width="6" fill="none"/>
    <rect x="500" y="150" width="40" height="36" rx="8" fill="${C.lime}"/>
    <path d="M510 150v-12a10 10 0 0 1 20 0v12" stroke="${C.lime}" stroke-width="6" fill="none"/>`;
}

function automationGears() {
  function gear(cx, cy, r, teeth, fill, rot = 0) {
    const pts = [];
    for (let i = 0; i < teeth * 2; i++) {
      const a = (Math.PI * i) / teeth + (rot * Math.PI) / 180;
      const rr = i % 2 === 0 ? r : r * 0.72;
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ') + 'Z';
    return `<path d="${d}" fill="${fill}"/><circle cx="${cx}" cy="${cy}" r="${(r * 0.28).toFixed(
      1
    )}" fill="${C.paper}"/>`;
  }
  return `
    ${gear(240, 230, 110, 10, C.ink, 0)}
    ${gear(400, 200, 80, 8, C.lime, 12)}
    ${gear(390, 320, 55, 7, C.academy, 20)}
    ${gear(160, 320, 48, 6, C.mist, 8)}
    <rect x="250" y="80" width="120" height="40" rx="12" fill="${C.paper}" stroke="${C.ink}" stroke-width="3"/>
    <rect x="268" y="94" width="50" height="8" rx="4" fill="${C.lime}"/>
    <path d="M120 120c40-40 100-20 120 20" stroke="${C.slate}" stroke-width="3" stroke-dasharray="6 6" fill="none"/>`;
}

function audienceWave() {
  const people = Array.from({ length: 18 }, (_, i) => {
    const x = 70 + (i % 9) * 60 + (i >= 9 ? 30 : 0);
    const y = i >= 9 ? 280 : 220;
    const color = i % 3 === 0 ? C.lime : i % 3 === 1 ? C.ink : C.academy;
    return `<g transform="translate(${x} ${y})">
      <circle r="16" fill="${color}"/>
      <path d="M-22 50c6-28 14-36 22-36s16 8 22 36" fill="${color}"/>
    </g>`;
  }).join('\n    ');
  return `
    <path d="M40 180c80-60 160-40 240 0s160 60 240 0v40c-80 60-160 40-240 0s-160-60-240 0v-40Z" fill="${C.mist}" opacity="0.5"/>
    <path d="M40 150c90-50 170-30 250 10s150 50 230-10" stroke="${C.lime}" stroke-width="4" fill="none"/>
    ${people}
    <rect x="220" y="70" width="200" height="70" rx="16" fill="url(#gInk)"/>
    <rect x="245" y="92" width="100" height="10" rx="5" fill="${C.lime}"/>
    <rect x="245" y="112" width="140" height="7" rx="3.5" fill="${C.mist}" opacity="0.35"/>`;
}

function journeyMap() {
  return `
    <path d="M80 340C160 280 180 200 240 180s100 40 140 20 60-100 140-90 80 60 100 100" stroke="${C.ink}" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M80 340C160 280 180 200 240 180s100 40 140 20 60-100 140-90 80 60 100 100" stroke="${C.lime}" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="14 16"/>
    <!-- milestones -->
    ${[
      [80, 340, '1'],
      [240, 180, '2'],
      [380, 200, '3'],
      [520, 150, '4'],
      [580, 250, '5'],
    ]
      .map(
        ([x, y, n], i) => `
    <circle cx="${x}" cy="${y}" r="28" fill="${i === 4 ? C.lime : C.paper}" stroke="${C.ink}" stroke-width="4"/>
    <text x="${x}" y="${Number(y) + 6}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" font-weight="800" fill="${C.ink}">${n}</text>`
      )
      .join('')}
    <!-- landmark cards -->
    <g transform="translate(250 70)">
      <rect width="120" height="70" rx="12" fill="${C.ink}"/>
      <rect x="16" y="18" width="60" height="8" rx="4" fill="${C.lime}"/>
      <rect x="16" y="36" width="88" height="6" rx="3" fill="${C.mist}" opacity="0.3"/>
    </g>`;
}

function emptyCathedral() {
  return `
    <!-- vault -->
    <path d="M100 360V180c0-80 60-130 220-130s220 50 220 130v180" fill="none" stroke="${C.mist}" stroke-width="8"/>
    <path d="M160 360V200c0-50 40-90 160-90s160 40 160 90v160" fill="none" stroke="${C.ink}" stroke-width="5"/>
    <!-- empty pedestal -->
    <ellipse cx="320" cy="340" rx="90" ry="18" fill="${C.mist}"/>
    <rect x="250" y="280" width="140" height="60" rx="10" fill="${C.ink}"/>
    <rect x="270" y="250" width="100" height="36" rx="8" fill="${C.slate}"/>
    <!-- ghost outline -->
    <circle cx="320" cy="180" r="36" fill="none" stroke="${C.lime}" stroke-width="4" stroke-dasharray="8 8"/>
    <path d="M280 230c10-30 25-40 40-40s30 10 40 40" fill="none" stroke="${C.lime}" stroke-width="4" stroke-dasharray="8 8"/>
    <text x="320" y="400" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" font-weight="600" fill="${C.muted}">Rien ici pour le moment</text>`;
}

function errorMaze404() {
  return `
    <!-- maze walls -->
    <path d="M80 80h200v40H160v120h120v40H80V80Z" fill="${C.ink}"/>
    <path d="M280 80h200v80H360v40h120v160H280V280h80v-40h-80V80Z" fill="${C.ink}" opacity="0.9"/>
    <path d="M120 280h120v80H120z" fill="${C.mist}"/>
    <path d="M400 120h120v40H440v160h80v40H360V280h80V160h-40v-40Z" fill="${C.slate}"/>
    <!-- 404 badge -->
    <rect x="200" y="180" width="200" height="100" rx="20" fill="${C.lime}"/>
    <text x="300" y="245" text-anchor="middle" font-family="system-ui,sans-serif" font-size="52" font-weight="900" fill="${C.ink}">404</text>
    <!-- character -->
    <circle cx="150" cy="340" r="20" fill="${C.lime}"/>
    <path d="M130 390c8-30 14-40 20-40s12 10 20 40" fill="${C.lime}"/>
    <path d="M170 340c40-10 80 0 110 20" stroke="${C.academy}" stroke-width="4" stroke-dasharray="6 6" fill="none"/>`;
}

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PUBLIC, { recursive: true });

const manifest = [];
for (const [slug, title, draw] of SPECS) {
  const file = `${slug}.svg`;
  const content = wrap(draw(), title);
  fs.writeFileSync(path.join(OUT, file), content, 'utf8');
  fs.writeFileSync(path.join(PUBLIC, file), content, 'utf8');
  manifest.push({
    id: slug,
    title,
    path: `/assets/illustrations-2/${file}`,
    source: `assets/illustrations-2/${file}`,
    series: 2,
  });
}

const indexPath = path.join(ROOT, 'src', 'lib', 'itm-illustrations-2.ts');
fs.writeFileSync(
  indexPath,
  `/** ITM illustration series 2 — denser compositions (${manifest.length}) */
export const ITM_ILLUSTRATIONS_2 = ${JSON.stringify(manifest, null, 2)} as const;

export type ItmIllustration2Id = (typeof ITM_ILLUSTRATIONS_2)[number]['id'];

export function getIllustration2(id: ItmIllustration2Id) {
  const item = ITM_ILLUSTRATIONS_2.find((i) => i.id === id);
  if (!item) throw new Error(\`Unknown illustration series-2: \${id}\`);
  return item;
}

export const ILLUSTRATION_2_PRESETS = {
  empty: 'empty-cathedral',
  notFound: 'error-maze-404',
  newsletter: 'newsletter-assembly-line',
  analytics: 'data-constellation',
  calendar: 'calendar-theater',
  media: 'media-galaxy',
  security: 'secure-citadel',
  automation: 'automation-gears',
  audience: 'audience-wave',
  onboarding: 'journey-map',
  workspace: 'orbit-workspace',
  desk: 'city-editorial-desk',
} as const satisfies Record<string, ItmIllustration2Id>;
`,
  'utf8'
);

console.log(`Wrote ${manifest.length} complex SVGs → assets/illustrations-2/`);
console.log('Index → src/lib/itm-illustrations-2.ts');
