/**
 * Extrait un texte lisible depuis un body de contenu.
 *
 * Les newsletters, articles et communications composés par blocs stockent un
 * tableau JSON de sections (hero, band, article, cta, calendar, footer) dans
 * `body`. Dans ce cas on agrège les champs textuels des sections plutôt que
 * de renvoyer le JSON brut. Les bodies texte/markdown classiques suivent le
 * nettoyage historique (liens, images, marqueurs markdown).
 */

interface SectionLike {
  title?: unknown;
  subtitle?: unknown;
  text?: unknown;
  label?: unknown;
  items?: unknown;
}

function sectionsToText(sections: SectionLike[]): string {
  const parts: string[] = [];
  for (const section of sections) {
    for (const value of [section.title, section.subtitle, section.text, section.label]) {
      if (typeof value === 'string' && value.trim()) parts.push(value.trim());
    }
    if (Array.isArray(section.items)) {
      for (const item of section.items) {
        if (typeof item === 'string' && item.trim()) parts.push(item.trim());
      }
    }
  }
  return parts.join(' ');
}

/** Renvoie le texte des sections si le body est un tableau JSON de sections, sinon null. */
export function sectionsBodyToText(body: string): string | null {
  const trimmed = body.trim();
  if (!trimmed.startsWith('[')) return null;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) return null;
    return sectionsToText(parsed as SectionLike[]);
  } catch {
    return null;
  }
}

export function deriveExcerpt(body: string): string {
  const sectionsText = sectionsBodyToText(body);
  if (sectionsText !== null) return sectionsText.slice(0, 200);

  return body
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[#*_>]/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim()
    .split('\n')
    .slice(0, 2)
    .join(' ')
    .slice(0, 200);
}
