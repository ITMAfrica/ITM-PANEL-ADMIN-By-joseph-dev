/** ITM illustration series 2 — denser compositions (12) */
export const ITM_ILLUSTRATIONS_2 = [
  {
    "id": "city-editorial-desk",
    "title": "Bureau éditorial panoramique",
    "path": "/assets/illustrations-2/city-editorial-desk.svg",
    "source": "assets/illustrations-2/city-editorial-desk.svg",
    "series": 2
  },
  {
    "id": "newsletter-assembly-line",
    "title": "Chaîne d'assemblage newsletter",
    "path": "/assets/illustrations-2/newsletter-assembly-line.svg",
    "source": "assets/illustrations-2/newsletter-assembly-line.svg",
    "series": 2
  },
  {
    "id": "orbit-workspace",
    "title": "Espace de travail orbital",
    "path": "/assets/illustrations-2/orbit-workspace.svg",
    "source": "assets/illustrations-2/orbit-workspace.svg",
    "series": 2
  },
  {
    "id": "data-constellation",
    "title": "Constellation de données",
    "path": "/assets/illustrations-2/data-constellation.svg",
    "source": "assets/illustrations-2/data-constellation.svg",
    "series": 2
  },
  {
    "id": "calendar-theater",
    "title": "Théâtre calendrier",
    "path": "/assets/illustrations-2/calendar-theater.svg",
    "source": "assets/illustrations-2/calendar-theater.svg",
    "series": 2
  },
  {
    "id": "media-galaxy",
    "title": "Galerie média profonde",
    "path": "/assets/illustrations-2/media-galaxy.svg",
    "source": "assets/illustrations-2/media-galaxy.svg",
    "series": 2
  },
  {
    "id": "secure-citadel",
    "title": "Citadelle sécurisée",
    "path": "/assets/illustrations-2/secure-citadel.svg",
    "source": "assets/illustrations-2/secure-citadel.svg",
    "series": 2
  },
  {
    "id": "automation-gears",
    "title": "Mécanisme d'automation",
    "path": "/assets/illustrations-2/automation-gears.svg",
    "source": "assets/illustrations-2/automation-gears.svg",
    "series": 2
  },
  {
    "id": "audience-wave",
    "title": "Vague d'audience",
    "path": "/assets/illustrations-2/audience-wave.svg",
    "source": "assets/illustrations-2/audience-wave.svg",
    "series": 2
  },
  {
    "id": "journey-map",
    "title": "Carte de parcours",
    "path": "/assets/illustrations-2/journey-map.svg",
    "source": "assets/illustrations-2/journey-map.svg",
    "series": 2
  },
  {
    "id": "empty-cathedral",
    "title": "Cathédrale vide (empty state)",
    "path": "/assets/illustrations-2/empty-cathedral.svg",
    "source": "assets/illustrations-2/empty-cathedral.svg",
    "series": 2
  },
  {
    "id": "error-maze-404",
    "title": "Labyrinthe 404",
    "path": "/assets/illustrations-2/error-maze-404.svg",
    "source": "assets/illustrations-2/error-maze-404.svg",
    "series": 2
  }
] as const;

export type ItmIllustration2Id = (typeof ITM_ILLUSTRATIONS_2)[number]['id'];

export function getIllustration2(id: ItmIllustration2Id) {
  const item = ITM_ILLUSTRATIONS_2.find((i) => i.id === id);
  if (!item) throw new Error(`Unknown illustration series-2: ${id}`);
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
