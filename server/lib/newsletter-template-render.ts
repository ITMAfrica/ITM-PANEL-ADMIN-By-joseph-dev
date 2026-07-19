import { signUploadUrl } from './media-access';

/** Palette “Labs” — fond crème, blobs vert/rose, bouton pill beige */
export const ITM_HR_DESIGN = {
  bg: '#F5F1E9',
  card: '#F5F1E9',
  blobGreen: '#41F28B',
  blobPink: '#F98AF3',
  text: '#2D2D2D',
  muted: '#5C5C5C',
  button: '#E9E1D7',
  band: '#2D2D2D',
  footer: '#2D2D2D',
  footerMuted: '#A8A29A',
  white: '#FFFFFF',
  // Aliases conservés pour compatibilité des imports historiques
  primary: '#2D2D2D',
  primaryLight: '#5C5C5C',
  navy: '#2D2D2D',
  navyDark: '#2D2D2D',
};

export type NewsletterSection =
  | { type: 'hero'; title: string; subtitle: string; imageUrl: string; label?: string }
  | { type: 'band'; label: string }
  | { type: 'article'; title: string; imageUrl: string; text: string }
  | { type: 'cta'; label: string; href: string }
  | { type: 'calendar'; items: string[] }
  | { type: 'footer'; text: string };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Blob vert (bas-gauche) — SVG data-URI pour clients mail modernes */
const BLOB_GREEN_SRC =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320"><path fill="${ITM_HR_DESIGN.blobGreen}" d="M-20 140C10 40 110 20 180 70c70 50 90 140 40 200-50 60-150 80-210 40C-50 270 -50 200 -20 140Z"/></svg>`
  );

/** Blob rose (haut-droit) */
const BLOB_PINK_SRC =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320"><path fill="${ITM_HR_DESIGN.blobPink}" d="M140 0c80-10 180 30 200 110 20 80-30 160-110 180C150 310 60 280 20 210-20 140 20 20 140 0Z"/></svg>`
  );

function band(label: string, bg: string): string {
  return `<tr><td style="background:${bg};padding:18px 24px;font-family:'Google Sans','Product Sans','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ffffff;text-align:center;">${escapeHtml(label)}</td></tr>`;
}

function ctaPill(label: string, href: string, padding = '28px 0 8px'): string {
  return `<tr><td align="center" style="padding:${padding};">
    <a href="${escapeHtml(href)}" style="display:inline-block;background:${ITM_HR_DESIGN.button};color:${ITM_HR_DESIGN.text};text-decoration:none;font-family:'Google Sans','Product Sans','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;font-weight:500;padding:14px 28px;border-radius:999px;line-height:1.2;">${escapeHtml(label)}</a>
  </td></tr>`;
}

function imageRow(alt: string, src: string): string {
  if (!src) return '';
  return `<tr><td style="padding:20px 32px 0;"><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" style="display:block;width:100%;max-width:536px;height:auto;border-radius:12px;" /></td></tr>`;
}

function textRow(html: string): string {
  return `<tr><td style="padding:8px 32px 20px;font-family:'Google Sans','Product Sans','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:${ITM_HR_DESIGN.text};">${html}</td></tr>`;
}

function renderHeroInner(
  section: Extract<NewsletterSection, { type: 'hero' }>,
  cta?: Extract<NewsletterSection, { type: 'cta' }>
): string {
  const label = section.label?.trim();
  const title = section.title?.trim();
  const subtitle = section.subtitle?.trim();

  const labelHtml = label
    ? `<p style="margin:0 0 20px;font-family:'Google Sans','Product Sans','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:${ITM_HR_DESIGN.text};">${escapeHtml(label)}</p>`
    : '';

  const titleHtml = title
    ? `<h1 style="margin:0 0 16px;font-family:'Google Sans','Product Sans','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:36px;font-weight:700;line-height:1.15;letter-spacing:-0.5px;color:${ITM_HR_DESIGN.text};">${escapeHtml(title)}</h1>`
    : '';

  const subtitleHtml = subtitle
    ? `<p style="margin:0 auto 8px;max-width:420px;font-family:'Google Sans','Product Sans','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.5;color:${ITM_HR_DESIGN.text};">${escapeHtml(subtitle)}</p>`
    : '';

  const ctaHtml = cta
    ? `<div style="padding-top:28px;">
        <a href="${escapeHtml(cta.href)}" style="display:inline-block;background:${ITM_HR_DESIGN.button};color:${ITM_HR_DESIGN.text};text-decoration:none;font-family:'Google Sans','Product Sans','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;font-weight:500;padding:14px 28px;border-radius:999px;line-height:1.2;">${escapeHtml(cta.label)}</a>
      </div>`
    : '';

  const imageHtml = section.imageUrl
    ? `<div style="padding-top:28px;"><img src="${escapeHtml(section.imageUrl)}" alt="${escapeHtml(title || 'Hero')}" style="display:block;width:100%;max-width:480px;margin:0 auto;height:auto;border-radius:12px;" /></div>`
    : '';

  return `<tr>
  <td style="background:${ITM_HR_DESIGN.bg};padding:0;overflow:hidden;">
    <div style="position:relative;overflow:hidden;background:${ITM_HR_DESIGN.bg};">
      <img src="${BLOB_GREEN_SRC}" width="240" height="240" alt="" aria-hidden="true" style="position:absolute;left:-72px;bottom:-88px;width:240px;height:240px;border:0;display:block;pointer-events:none;" />
      <img src="${BLOB_PINK_SRC}" width="220" height="220" alt="" aria-hidden="true" style="position:absolute;right:-64px;top:-72px;width:220px;height:220px;border:0;display:block;pointer-events:none;" />
      <div style="position:relative;z-index:1;padding:72px 40px 64px;text-align:center;">
        ${labelHtml}
        ${titleHtml}
        ${subtitleHtml}
        ${ctaHtml}
        ${imageHtml}
      </div>
    </div>
  </td>
</tr>`;
}

export function renderSectionToHtml(section: NewsletterSection): string {
  switch (section.type) {
    case 'hero':
      return renderHeroInner(section);
    case 'band':
      return band(section.label, ITM_HR_DESIGN.band);
    case 'article':
      return (
        imageRow(section.title, section.imageUrl) +
        textRow(
          (section.title
            ? `<p style="font-family:'Google Sans','Product Sans',Helvetica,Arial,sans-serif;font-size:18px;font-weight:700;color:${ITM_HR_DESIGN.text};margin:0 0 6px;">${escapeHtml(section.title)}</p>`
            : '') +
            `<p style="margin:0;color:${ITM_HR_DESIGN.text};">${escapeHtml(section.text)}</p>`
        )
      );
    case 'cta':
      return ctaPill(section.label, section.href);
    case 'calendar':
      return (
        band('Calendrier des formations', ITM_HR_DESIGN.band) +
        textRow(`<p style="margin:0;">${section.items.map((i) => escapeHtml(i)).join('<br/>')}</p>`)
      );
    case 'footer':
      return `<tr><td style="background:${ITM_HR_DESIGN.footer};padding:22px 24px;font-family:'Google Sans','Product Sans',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:${ITM_HR_DESIGN.footerMuted};text-align:center;">${escapeHtml(section.text)}</td></tr>`;
    default:
      return '';
  }
}

/** Hero + CTA suivant fusionnés dans le même bloc crème (comme l’exemple Labs). */
export function renderSectionsInnerHtml(sections: NewsletterSection[]): string {
  const parts: string[] = [];
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (section.type === 'hero') {
      const next = sections[i + 1];
      if (next?.type === 'cta') {
        parts.push(renderHeroInner(section, next));
        i += 1;
        continue;
      }
      parts.push(renderHeroInner(section));
      continue;
    }
    parts.push(renderSectionToHtml(section));
  }
  return parts.join('');
}

export function renderSectionsToHtml(sections: NewsletterSection[]): string {
  const inner = renderSectionsInnerHtml(sections);
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:${ITM_HR_DESIGN.bg};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${ITM_HR_DESIGN.bg};">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${ITM_HR_DESIGN.white};overflow:hidden;border-radius:0;">
      ${inner}
    </table>
  </td></tr>
</table>
</body></html>`;
}

export function parseSections(body: string): NewsletterSection[] | null {
  if (!body || !body.trim().startsWith('[')) return null;
  try {
    const parsed = JSON.parse(body);
    if (!Array.isArray(parsed)) return null;
    return parsed as NewsletterSection[];
  } catch {
    return null;
  }
}

const UPLOAD_SRC_RE = /(<img[^>]*\ssrc=")(\/api\/uploads\/[^"]+)(")/gi;

export async function signUploadImagesInHtml(html: string, appUrl: string): Promise<string> {
  const matches = [...html.matchAll(UPLOAD_SRC_RE)];
  if (matches.length === 0) return html;

  let result = html;
  for (const match of matches) {
    const path = match[2];
    const signed = await signUploadUrl(`${appUrl}${path}`);
    result = result.split(`"${path}"`).join(`"${signed}"`);
  }
  return result;
}
