/**
 * One-shot generator: 50 ITM house-style SVG illustrations.
 * Run: node scripts/generate-itm-illustrations.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'illustrations');
const PUBLIC = path.join(ROOT, 'public', 'assets', 'illustrations');

const C = {
  ink: '#1D141F',
  lime: '#E2F343',
  mist: '#E8ECEF',
  paper: '#FAFBFC',
  muted: '#8B939E',
  academy: '#D95800',
};

function svg(inner, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360" fill="none" role="img"${
    title ? ` aria-labelledby="t"` : ' aria-hidden="true"'
  }>
${title ? `  <title id="t">${escapeXml(title)}</title>` : ''}
  <rect width="480" height="360" rx="28" fill="${C.paper}"/>
  <circle cx="420" cy="32" r="88" fill="${C.lime}" fill-opacity="0.16"/>
  <circle cx="48" cy="328" r="72" fill="${C.ink}" fill-opacity="0.06"/>
${inner}
</svg>
`;
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const SPECS = [
  // Empty / zero states
  ['empty-box', 'Boîte vide', emptyBox],
  ['empty-inbox', 'Boîte de réception vide', emptyInbox],
  ['empty-folder', 'Dossier vide', emptyFolder],
  ['empty-search', 'Aucun résultat', emptySearch],
  ['empty-calendar', 'Calendrier vide', emptyCalendar],
  ['empty-media', 'Médiathèque vide', emptyMedia],
  ['empty-users', 'Aucun utilisateur', emptyUsers],
  ['empty-chart', 'Pas de données', emptyChart],
  ['empty-newsletter', 'Aucune newsletter', emptyNewsletter],
  ['empty-messages', 'Aucun message', emptyMessages],
  // Errors / 404
  ['error-404', 'Page introuvable', error404],
  ['error-lost', 'Chemin perdu', errorLost],
  ['error-broken-link', 'Lien brisé', errorBrokenLink],
  ['error-offline', 'Hors ligne', errorOffline],
  ['error-server', 'Erreur serveur', errorServer],
  ['error-forbidden', 'Accès refusé', errorForbidden],
  ['error-timeout', 'Délai dépassé', errorTimeout],
  ['error-maintenance', 'Maintenance', errorMaintenance],
  // Product / content
  ['compose-newsletter', 'Composer une newsletter', composeNewsletter],
  ['compose-article', 'Rédiger un article', composeArticle],
  ['compose-social', 'Publication sociale', composeSocial],
  ['schedule-post', 'Programmation', schedulePost],
  ['send-email', 'Envoi email', sendEmail],
  ['open-mail', 'Lecture email', openMail],
  ['flash-news', 'Flash actus', flashNews],
  ['event-agenda', 'Agenda événements', eventAgenda],
  ['learning-path', 'Parcours formation', learningPath],
  ['academy-badge', 'Academy', academyBadge],
  // Success / progress
  ['success-check', 'Succès', successCheck],
  ['success-send', 'Envoyé', successSend],
  ['success-grow', 'Croissance', successGrow],
  ['success-target', 'Objectif atteint', successTarget],
  // UI metaphors
  ['spotlight', 'À la une', spotlight],
  ['filters', 'Filtres', filters],
  ['tags', 'Tags', tags],
  ['channels', 'Canaux', channels],
  ['workspace', 'Espace de travail', workspace],
  ['settings-gear', 'Paramètres', settingsGear],
  ['security-shield', 'Sécurité', securityShield],
  ['analytics', 'Analytique', analytics],
  ['automation', 'Automation', automation],
  ['library', 'Bibliothèque', library],
  ['drafts', 'Brouillons', drafts],
  ['archive', 'Archives', archive],
  ['roles', 'Rôles', roles],
  ['tenants', 'Workspaces', tenants],
  ['upload', 'Import média', upload],
  ['preview', 'Aperçu', preview],
  ['waiting', 'En attente', waiting],
  ['welcome', 'Bienvenue', welcome],
];

function emptyBox() {
  return `
  <rect x="140" y="110" width="200" height="150" rx="16" fill="${C.ink}"/>
  <path d="M140 150h200" stroke="${C.lime}" stroke-width="3"/>
  <path d="M200 190h80M220 210h40" stroke="${C.mist}" stroke-width="6" stroke-linecap="round" opacity="0.35"/>
  <circle cx="240" cy="100" r="18" fill="${C.lime}"/>
  <path d="M234 100h12M240 94v12" stroke="${C.ink}" stroke-width="2.5" stroke-linecap="round"/>`;
}

function emptyInbox() {
  return `
  <path d="M110 130h260l-40 120H150L110 130Z" fill="${C.ink}"/>
  <path d="M110 130l130 70 130-70" stroke="${C.lime}" stroke-width="4" stroke-linejoin="round"/>
  <rect x="190" y="220" width="100" height="10" rx="5" fill="${C.mist}" opacity="0.35"/>`;
}

function emptyFolder() {
  return `
  <path d="M120 120h90l20 24h130v140H120V120Z" fill="${C.ink}"/>
  <rect x="120" y="144" width="240" height="140" rx="12" fill="${C.ink}"/>
  <rect x="160" y="190" width="100" height="8" rx="4" fill="${C.mist}" opacity="0.3"/>
  <rect x="160" y="210" width="70" height="8" rx="4" fill="${C.lime}"/>`;
}

function emptySearch() {
  return `
  <circle cx="220" cy="160" r="70" stroke="${C.ink}" stroke-width="16" fill="${C.paper}"/>
  <path d="M272 212l60 60" stroke="${C.ink}" stroke-width="18" stroke-linecap="round"/>
  <circle cx="220" cy="160" r="28" fill="${C.lime}" opacity="0.85"/>
  <path d="M208 160h24" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>`;
}

function emptyCalendar() {
  return `
  <rect x="130" y="90" width="220" height="200" rx="18" fill="${C.ink}"/>
  <rect x="130" y="90" width="220" height="48" rx="18" fill="${C.lime}"/>
  <rect x="130" y="120" width="220" height="18" fill="${C.lime}"/>
  <circle cx="170" cy="114" r="7" fill="${C.ink}"/>
  <circle cx="310" cy="114" r="7" fill="${C.ink}"/>
  ${[0, 1, 2].flatMap((r) =>
    [0, 1, 2, 3].map(
      (c) =>
        `<rect x="${160 + c * 42}" y="${168 + r * 34}" width="28" height="22" rx="5" fill="${
          r === 1 && c === 1 ? C.lime : C.mist
        }" opacity="${r === 1 && c === 1 ? 1 : 0.25}"/>`
    )
  ).join('\n  ')}`;
}

function emptyMedia() {
  return `
  <rect x="120" y="90" width="240" height="180" rx="18" fill="${C.ink}"/>
  <path d="M150 220l50-55 40 35 35-45 55 65H150Z" fill="${C.mist}" opacity="0.25"/>
  <circle cx="190" cy="140" r="18" fill="${C.lime}"/>
  <rect x="280" y="240" width="48" height="10" rx="5" fill="${C.lime}"/>`;
}

function emptyUsers() {
  return `
  <circle cx="240" cy="130" r="42" fill="${C.ink}"/>
  <path d="M160 250c20-50 50-70 80-70s60 20 80 70" fill="${C.ink}"/>
  <circle cx="150" cy="150" r="26" fill="${C.mist}"/>
  <circle cx="330" cy="150" r="26" fill="${C.mist}"/>
  <circle cx="240" cy="128" r="14" fill="${C.lime}"/>`;
}

function emptyChart() {
  return `
  <rect x="100" y="80" width="280" height="200" rx="16" fill="${C.ink}"/>
  <path d="M140 230V160M190 230V120M240 230V180M290 230V140M340 230V100" stroke="${C.mist}" stroke-width="18" stroke-linecap="round" opacity="0.25"/>
  <path d="M140 160V230M190 120V230M240 180V230M290 140V230M340 100V230" stroke="${C.lime}" stroke-width="10" stroke-linecap="round" opacity="0.15"/>
  <circle cx="340" cy="100" r="12" fill="${C.lime}"/>`;
}

function emptyNewsletter() {
  return `
  <rect x="130" y="80" width="220" height="200" rx="14" fill="${C.paper}" stroke="${C.mist}" stroke-width="3"/>
  <rect x="150" y="104" width="100" height="10" rx="5" fill="${C.lime}"/>
  <rect x="150" y="128" width="160" height="8" rx="4" fill="${C.mist}"/>
  <rect x="150" y="148" width="140" height="8" rx="4" fill="${C.mist}"/>
  <rect x="150" y="190" width="90" height="36" rx="18" fill="${C.ink}"/>
  <rect x="168" y="202" width="54" height="8" rx="4" fill="${C.lime}"/>`;
}

function emptyMessages() {
  return `
  <rect x="110" y="100" width="200" height="120" rx="20" fill="${C.ink}"/>
  <path d="M150 220l20-20h140c11 0 20-9 20-20V120" stroke="${C.ink}" stroke-width="0"/>
  <path d="M140 220l30-28H290c12 0 22-10 22-22V100" fill="none"/>
  <path d="M150 218l24-24" stroke="${C.ink}" stroke-width="16" stroke-linecap="round"/>
  <rect x="220" y="150" width="160" height="100" rx="18" fill="${C.lime}"/>
  <rect x="250" y="178" width="80" height="8" rx="4" fill="${C.ink}" opacity="0.35"/>
  <rect x="250" y="198" width="56" height="8" rx="4" fill="${C.ink}" opacity="0.25"/>`;
}

function error404() {
  return `
  <text x="240" y="175" text-anchor="middle" font-family="system-ui,sans-serif" font-size="120" font-weight="800" fill="${C.ink}">404</text>
  <rect x="150" y="210" width="180" height="14" rx="7" fill="${C.lime}"/>
  <text x="240" y="260" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" font-weight="600" fill="${C.muted}">Page introuvable</text>`;
}

function errorLost() {
  return `
  <path d="M120 240c40-80 80-100 120-40s80 40 120-20" stroke="${C.mist}" stroke-width="10" stroke-linecap="round" fill="none"/>
  <circle cx="240" cy="150" r="36" fill="${C.ink}"/>
  <path d="M228 150h24M240 138v24" stroke="${C.lime}" stroke-width="4" stroke-linecap="round"/>
  <circle cx="360" cy="180" r="22" fill="${C.lime}"/>
  <text x="360" y="186" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" font-weight="800" fill="${C.ink}">?</text>`;
}

function errorBrokenLink() {
  return `
  <path d="M160 200c0-40 30-70 70-70h30" stroke="${C.ink}" stroke-width="18" stroke-linecap="round" fill="none"/>
  <path d="M220 230c0 40 30 70 70 70h30" stroke="${C.ink}" stroke-width="18" stroke-linecap="round" fill="none"/>
  <path d="M250 160l40 40" stroke="${C.lime}" stroke-width="10" stroke-linecap="round"/>
  <circle cx="270" cy="180" r="8" fill="${C.academy}"/>`;
}

function errorOffline() {
  return `
  <path d="M140 200c55-70 145-70 200 0" stroke="${C.mist}" stroke-width="12" stroke-linecap="round" fill="none" opacity="0.5"/>
  <path d="M170 220c35-45 105-45 140 0" stroke="${C.mist}" stroke-width="12" stroke-linecap="round" fill="none" opacity="0.5"/>
  <circle cx="240" cy="250" r="16" fill="${C.ink}"/>
  <path d="M200 130l80 80M280 130l-80 80" stroke="${C.academy}" stroke-width="10" stroke-linecap="round"/>`;
}

function errorServer() {
  return `
  <rect x="150" y="90" width="180" height="200" rx="16" fill="${C.ink}"/>
  <rect x="170" y="115" width="140" height="36" rx="8" fill="${C.mist}" opacity="0.15"/>
  <rect x="170" y="165" width="140" height="36" rx="8" fill="${C.mist}" opacity="0.15"/>
  <rect x="170" y="215" width="140" height="36" rx="8" fill="${C.mist}" opacity="0.15"/>
  <circle cx="190" cy="133" r="6" fill="${C.academy}"/>
  <circle cx="190" cy="183" r="6" fill="${C.lime}"/>
  <circle cx="190" cy="233" r="6" fill="${C.muted}"/>`;
}

function errorForbidden() {
  return `
  <circle cx="240" cy="170" r="90" stroke="${C.ink}" stroke-width="18" fill="${C.paper}"/>
  <rect x="170" y="155" width="140" height="30" rx="8" fill="${C.academy}" transform="rotate(-35 240 170)"/>
  <circle cx="240" cy="120" r="14" fill="${C.lime}"/>`;
}

function errorTimeout() {
  return `
  <circle cx="240" cy="170" r="90" stroke="${C.ink}" stroke-width="16" fill="${C.paper}"/>
  <circle cx="240" cy="170" r="8" fill="${C.ink}"/>
  <path d="M240 110v60l40 24" stroke="${C.lime}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M330 100l30-20M350 130h28" stroke="${C.academy}" stroke-width="6" stroke-linecap="round"/>`;
}

function errorMaintenance() {
  return `
  <rect x="160" y="200" width="160" height="70" rx="10" fill="${C.ink}"/>
  <path d="M200 200V150h80v50" stroke="${C.ink}" stroke-width="14" fill="none"/>
  <rect x="190" y="120" width="100" height="36" rx="8" fill="${C.lime}"/>
  <path d="M140 260h200" stroke="${C.mist}" stroke-width="8" stroke-linecap="round"/>
  <circle cx="300" cy="160" r="20" fill="${C.academy}"/>
  <path d="M293 160h14M300 153v14" stroke="${C.paper}" stroke-width="3" stroke-linecap="round"/>`;
}

function composeNewsletter() {
  return `
  <rect x="90" y="70" width="200" height="160" rx="14" fill="${C.paper}" stroke="${C.mist}" stroke-width="3"/>
  <rect x="110" y="95" width="90" height="8" rx="4" fill="${C.lime}"/>
  <rect x="110" y="115" width="140" height="6" rx="3" fill="${C.mist}"/>
  <rect x="110" y="132" width="120" height="6" rx="3" fill="${C.mist}"/>
  <path d="M250 150h140c12 0 22 10 22 22v90c0 12-10 22-22 22H250c-12 0-22-10-22-22v-90c0-12 10-22 22-22Z" fill="${C.ink}"/>
  <path d="M228 182l78 40c5 2.5 11 2.5 16 0l78-40" stroke="${C.lime}" stroke-width="3" stroke-linecap="round"/>`;
}

function composeArticle() {
  return `
  <rect x="130" y="60" width="220" height="260" rx="14" fill="${C.ink}"/>
  <rect x="155" y="95" width="120" height="12" rx="6" fill="${C.lime}"/>
  <rect x="155" y="130" width="170" height="8" rx="4" fill="${C.mist}" opacity="0.3"/>
  <rect x="155" y="150" width="160" height="8" rx="4" fill="${C.mist}" opacity="0.3"/>
  <rect x="155" y="170" width="140" height="8" rx="4" fill="${C.mist}" opacity="0.3"/>
  <rect x="155" y="210" width="170" height="70" rx="10" fill="${C.mist}" opacity="0.15"/>`;
}

function composeSocial() {
  return `
  <rect x="140" y="70" width="200" height="230" rx="28" fill="${C.ink}"/>
  <circle cx="175" cy="115" r="18" fill="${C.lime}"/>
  <rect x="205" y="108" width="90" height="8" rx="4" fill="${C.mist}" opacity="0.35"/>
  <rect x="160" y="155" width="160" height="90" rx="12" fill="${C.mist}" opacity="0.15"/>
  <rect x="160" y="265" width="50" height="10" rx="5" fill="${C.lime}"/>
  <rect x="220" y="265" width="50" height="10" rx="5" fill="${C.mist}" opacity="0.3"/>`;
}

function schedulePost() {
  return `
  <rect x="100" y="100" width="180" height="180" rx="16" fill="${C.ink}"/>
  <rect x="100" y="100" width="180" height="40" fill="${C.lime}" rx="16"/>
  <rect x="100" y="122" width="180" height="18" fill="${C.lime}"/>
  <circle cx="320" cy="200" r="70" fill="${C.paper}" stroke="${C.ink}" stroke-width="12"/>
  <path d="M320 160v40l28 16" stroke="${C.academy}" stroke-width="8" stroke-linecap="round"/>`;
}

function sendEmail() {
  return `
  <path d="M100 130h220l-40 110H140L100 130Z" fill="${C.ink}"/>
  <path d="M100 130l110 58 110-58" stroke="${C.lime}" stroke-width="5"/>
  <path d="M300 170l60-40 20 90-55 20-25-70Z" fill="${C.lime}"/>
  <path d="M320 150l55 55" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>`;
}

function openMail() {
  return `
  <rect x="110" y="150" width="260" height="140" rx="14" fill="${C.ink}"/>
  <path d="M110 160l130 80 130-80" fill="${C.paper}" stroke="${C.lime}" stroke-width="4"/>
  <rect x="160" y="90" width="160" height="90" rx="8" fill="${C.mist}"/>
  <rect x="180" y="110" width="90" height="8" rx="4" fill="${C.ink}" opacity="0.3"/>
  <rect x="180" y="128" width="70" height="8" rx="4" fill="${C.ink}" opacity="0.2"/>`;
}

function flashNews() {
  return `
  <rect x="120" y="80" width="240" height="200" rx="18" fill="${C.ink}"/>
  <path d="M230 110l-40 70h36l-12 50 58-90h-34l32-30H230Z" fill="${C.lime}"/>
  <rect x="160" y="250" width="160" height="10" rx="5" fill="${C.mist}" opacity="0.25"/>`;
}

function eventAgenda() {
  return emptyCalendar();
}

function learningPath() {
  return `
  <circle cx="130" cy="180" r="28" fill="${C.lime}"/>
  <circle cx="240" cy="120" r="28" fill="${C.ink}"/>
  <circle cx="240" cy="240" r="28" fill="${C.ink}"/>
  <circle cx="350" cy="180" r="28" fill="${C.academy}"/>
  <path d="M155 170l60-35M155 190l60 35M265 135l60 30M265 225l60-30" stroke="${C.mist}" stroke-width="6" stroke-linecap="round"/>
  <text x="130" y="186" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="800" fill="${C.ink}">1</text>
  <text x="350" y="186" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="800" fill="${C.paper}">4</text>`;
}

function academyBadge() {
  return `
  <circle cx="240" cy="170" r="100" fill="${C.academy}"/>
  <circle cx="240" cy="170" r="72" fill="${C.paper}"/>
  <path d="M240 120l18 36h40l-32 24 12 40-38-26-38 26 12-40-32-24h40l18-36Z" fill="${C.ink}"/>
  <circle cx="240" cy="170" r="100" fill="none" stroke="${C.lime}" stroke-width="6" stroke-dasharray="12 10"/>`;
}

function successCheck() {
  return `
  <circle cx="240" cy="170" r="90" fill="${C.ink}"/>
  <path d="M195 170l30 30 60-70" stroke="${C.lime}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
}

function successSend() {
  return `
  <path d="M120 200l240-80-100 100-20-40-40 20 20-40z" fill="${C.ink}"/>
  <path d="M260 170l60 20-100 50" fill="${C.lime}"/>
  <circle cx="360" cy="120" r="16" fill="${C.lime}"/>`;
}

function successGrow() {
  return `
  <path d="M120 260c40-20 60-80 90-100s70-20 100 10 50 40 80 20" stroke="${C.ink}" stroke-width="14" stroke-linecap="round" fill="none"/>
  <circle cx="360" cy="160" r="18" fill="${C.lime}"/>
  <rect x="140" y="250" width="200" height="12" rx="6" fill="${C.mist}"/>`;
}

function successTarget() {
  return `
  <circle cx="240" cy="170" r="100" stroke="${C.mist}" stroke-width="10" fill="${C.paper}"/>
  <circle cx="240" cy="170" r="68" stroke="${C.ink}" stroke-width="10" fill="${C.paper}"/>
  <circle cx="240" cy="170" r="36" fill="${C.lime}"/>
  <circle cx="240" cy="170" r="14" fill="${C.ink}"/>`;
}

function spotlight() {
  return `
  <path d="M240 40l120 280H120L240 40Z" fill="${C.lime}" opacity="0.25"/>
  <rect x="170" y="180" width="140" height="90" rx="12" fill="${C.ink}"/>
  <circle cx="240" cy="120" r="28" fill="${C.ink}"/>
  <rect x="200" y="210" width="80" height="10" rx="5" fill="${C.lime}"/>`;
}

function filters() {
  return `
  <path d="M120 100h240l-80 90v80l-80-30v-50L120 100Z" fill="${C.ink}"/>
  <rect x="200" y="250" width="80" height="14" rx="7" fill="${C.lime}"/>
  <circle cx="340" cy="120" r="22" fill="${C.lime}"/>`;
}

function tags() {
  return `
  <rect x="100" y="140" width="120" height="48" rx="24" fill="${C.ink}"/>
  <rect x="180" y="170" width="140" height="48" rx="24" fill="${C.lime}"/>
  <rect x="240" y="120" width="120" height="48" rx="24" fill="${C.mist}"/>
  <circle cx="130" cy="164" r="8" fill="${C.lime}"/>
  <circle cx="210" cy="194" r="8" fill="${C.ink}"/>`;
}

function channels() {
  return `
  <circle cx="160" cy="170" r="50" fill="${C.ink}"/>
  <circle cx="260" cy="130" r="42" fill="${C.lime}"/>
  <circle cx="300" cy="210" r="46" fill="${C.academy}"/>
  <path d="M200 170h40M250 155l30 40" stroke="${C.mist}" stroke-width="6" stroke-linecap="round"/>`;
}

function workspace() {
  return `
  <rect x="90" y="110" width="140" height="160" rx="14" fill="${C.ink}"/>
  <rect x="250" y="90" width="140" height="100" rx="14" fill="${C.lime}"/>
  <rect x="250" y="210" width="140" height="80" rx="14" fill="${C.mist}"/>
  <rect x="110" y="140" width="80" height="8" rx="4" fill="${C.lime}"/>
  <rect x="270" y="120" width="70" height="8" rx="4" fill="${C.ink}" opacity="0.4"/>`;
}

function settingsGear() {
  return `
  <circle cx="240" cy="170" r="36" fill="${C.paper}" stroke="${C.ink}" stroke-width="20"/>
  ${Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    const x = 240 + Math.cos(a) * 78;
    const y = 170 + Math.sin(a) * 78;
    return `<rect x="${x - 12}" y="${y - 18}" width="24" height="36" rx="6" fill="${C.ink}" transform="rotate(${(i * 45)} ${x} ${y})"/>`;
  }).join('\n  ')}
  <circle cx="240" cy="170" r="18" fill="${C.lime}"/>`;
}

function securityShield() {
  return `
  <path d="M240 70l120 40v70c0 70-50 110-120 140-70-30-120-70-120-140v-70l120-40Z" fill="${C.ink}"/>
  <path d="M200 170l28 28 52-56" stroke="${C.lime}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
}

function analytics() {
  return `
  <rect x="100" y="80" width="280" height="200" rx="16" fill="${C.ink}"/>
  <path d="M140 220l40-50 40 20 50-70 40 30" stroke="${C.lime}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="310" cy="150" r="10" fill="${C.lime}"/>
  <rect x="140" y="250" width="200" height="8" rx="4" fill="${C.mist}" opacity="0.2"/>`;
}

function automation() {
  return `
  <rect x="100" y="140" width="90" height="70" rx="12" fill="${C.ink}"/>
  <rect x="290" y="140" width="90" height="70" rx="12" fill="${C.ink}"/>
  <path d="M190 175h100" stroke="${C.lime}" stroke-width="10" stroke-linecap="round"/>
  <polygon points="280,160 310,175 280,190" fill="${C.lime}"/>
  <circle cx="145" cy="175" r="12" fill="${C.lime}"/>
  <circle cx="335" cy="175" r="12" fill="${C.academy}"/>`;
}

function library() {
  return `
  <rect x="130" y="90" width="50" height="200" rx="6" fill="${C.ink}"/>
  <rect x="190" y="110" width="50" height="180" rx="6" fill="${C.lime}"/>
  <rect x="250" y="80" width="50" height="210" rx="6" fill="${C.academy}"/>
  <rect x="310" y="120" width="50" height="170" rx="6" fill="${C.mist}"/>`;
}

function drafts() {
  return `
  <rect x="150" y="70" width="180" height="230" rx="12" fill="${C.paper}" stroke="${C.mist}" stroke-width="3"/>
  <path d="M280 70v50h50" fill="${C.mist}"/>
  <rect x="175" y="150" width="120" height="10" rx="5" fill="${C.ink}" opacity="0.2"/>
  <rect x="175" y="175" width="100" height="10" rx="5" fill="${C.ink}" opacity="0.15"/>
  <rect x="175" y="210" width="70" height="28" rx="8" fill="${C.lime}"/>`;
}

function archive() {
  return `
  <rect x="130" y="140" width="220" height="130" rx="12" fill="${C.ink}"/>
  <path d="M120 140h240l-20-40H140l-20 40Z" fill="${C.lime}"/>
  <rect x="210" y="190" width="60" height="16" rx="4" fill="${C.mist}" opacity="0.3"/>`;
}

function roles() {
  return `
  <rect x="100" y="100" width="120" height="160" rx="14" fill="${C.ink}"/>
  <rect x="240" y="100" width="140" height="70" rx="14" fill="${C.lime}"/>
  <rect x="240" y="190" width="140" height="70" rx="14" fill="${C.mist}"/>
  <circle cx="160" cy="145" r="20" fill="${C.lime}"/>
  <rect x="130" y="190" width="60" height="10" rx="5" fill="${C.mist}" opacity="0.35"/>`;
}

function tenants() {
  return `
  <rect x="90" y="160" width="90" height="110" rx="10" fill="${C.ink}"/>
  <rect x="195" y="120" width="90" height="150" rx="10" fill="${C.lime}"/>
  <rect x="300" y="90" width="90" height="180" rx="10" fill="${C.academy}"/>
  <rect x="110" y="190" width="50" height="8" rx="4" fill="${C.mist}" opacity="0.35"/>
  <rect x="215" y="150" width="50" height="8" rx="4" fill="${C.ink}" opacity="0.35"/>`;
}

function upload() {
  return `
  <rect x="130" y="120" width="220" height="160" rx="18" stroke="${C.ink}" stroke-width="6" stroke-dasharray="14 10" fill="${C.paper}"/>
  <path d="M240 240V160M240 160l-28 28M240 160l28 28" stroke="${C.lime}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="200" y="250" width="80" height="12" rx="6" fill="${C.mist}"/>`;
}

function preview() {
  return `
  <rect x="90" y="80" width="180" height="220" rx="16" fill="${C.ink}"/>
  <rect x="290" y="110" width="100" height="170" rx="18" fill="${C.mist}"/>
  <rect x="110" y="110" width="120" height="10" rx="5" fill="${C.lime}"/>
  <rect x="110" y="140" width="140" height="80" rx="10" fill="${C.mist}" opacity="0.2"/>
  <rect x="310" y="140" width="60" height="80" rx="8" fill="${C.ink}" opacity="0.15"/>`;
}

function waiting() {
  return `
  <circle cx="170" cy="180" r="22" fill="${C.mist}"/>
  <circle cx="240" cy="180" r="22" fill="${C.lime}"/>
  <circle cx="310" cy="180" r="22" fill="${C.ink}"/>
  <rect x="140" y="240" width="200" height="12" rx="6" fill="${C.mist}"/>
  <rect x="140" y="240" width="110" height="12" rx="6" fill="${C.lime}"/>`;
}

function welcome() {
  return `
  <rect x="140" y="90" width="200" height="180" rx="20" fill="${C.ink}"/>
  <path d="M140 150h200" stroke="${C.lime}" stroke-width="4"/>
  <circle cx="240" cy="200" r="36" fill="${C.lime}"/>
  <path d="M225 200l12 12 24-28" stroke="${C.ink}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <text x="240" y="310" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" font-weight="700" fill="${C.ink}">ITM</text>`;
}

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PUBLIC, { recursive: true });

const manifest = [];

for (const [slug, title, draw] of SPECS) {
  const content = svg(draw(), title);
  const filename = `${slug}.svg`;
  fs.writeFileSync(path.join(OUT, filename), content, 'utf8');
  fs.writeFileSync(path.join(PUBLIC, filename), content, 'utf8');
  manifest.push({
    id: slug,
    title,
    path: `/assets/illustrations/${filename}`,
    source: `assets/illustrations/${filename}`,
  });
}

const indexJs = `/** ITM illustration library — ${manifest.length} house-style SVGs */
export const ITM_ILLUSTRATIONS = ${JSON.stringify(manifest, null, 2)} as const;

export type ItmIllustrationId = (typeof ITM_ILLUSTRATIONS)[number]['id'];

export function getIllustration(id: ItmIllustrationId) {
  const item = ITM_ILLUSTRATIONS.find((i) => i.id === id);
  if (!item) throw new Error(\`Unknown illustration: \${id}\`);
  return item;
}

/** Suggested defaults for empty / error surfaces */
export const ILLUSTRATION_PRESETS = {
  empty: 'empty-box',
  emptySearch: 'empty-search',
  emptyCalendar: 'empty-calendar',
  emptyMedia: 'empty-media',
  emptyNewsletter: 'empty-newsletter',
  notFound: 'error-404',
  offline: 'error-offline',
  forbidden: 'error-forbidden',
  serverError: 'error-server',
  welcome: 'welcome',
} as const satisfies Record<string, ItmIllustrationId>;
`;

fs.writeFileSync(path.join(ROOT, 'src', 'lib', 'itm-illustrations.ts'), indexJs, 'utf8');

console.log(`Wrote ${manifest.length} SVGs → assets/illustrations/ + public/assets/illustrations/`);
console.log('Index → src/lib/itm-illustrations.ts');
