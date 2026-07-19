import type { PageId } from './types';

/** Pages reachable via client-side navigation and URL paths. */
export const ROUTABLE_PAGES: readonly PageId[] = [
  'dashboard',
  'newsletters',
  'articles',
  'announcements',
  'campaigns',
  'editorial-calendar',
  'conversation',
  'library',
  'media',
  'templates',
  'drafts',
  'published',
  'archive',
  'scheduling',
  'channels',
  'automations',
  'reports',
  'users',
  'roles',
  'tenants',
  'workspace-members',
  'audit',
  'settings',
  'documentation',
] as const;

const ROUTABLE_PAGE_SET = new Set<string>(ROUTABLE_PAGES);

/** Legacy communication pages that redirect to the editorial calendar hub. */
export const LEGACY_COMMUNICATION_REDIRECTS: Partial<Record<PageId, string>> = {
  newsletters: '/editorial-calendar?tab=list&type=newsletter',
  articles: '/editorial-calendar?tab=list&type=article',
  announcements: '/editorial-calendar?tab=list&type=announcement',
  campaigns: '/editorial-calendar?tab=list&filter=campaigns',
  scheduling: '/editorial-calendar?tab=queue',
  channels: '/editorial-calendar?tab=channels',
};

export function isValidPageSlug(slug: string): slug is PageId {
  return ROUTABLE_PAGE_SET.has(slug);
}

export function resolveLegacyCommunicationPath(pageId: PageId): string | null {
  return LEGACY_COMMUNICATION_REDIRECTS[pageId] ?? null;
}

export function pageIdToPath(pageId: PageId): string {
  const legacy = resolveLegacyCommunicationPath(pageId);
  if (legacy) return legacy;
  return pageId === 'dashboard' ? '/' : `/${pageId}`;
}

export function pathToPageId(pathname: string): PageId | null {
  const slug = pathname.replace(/\/$/, '').split('/').filter(Boolean)[0];

  if (!slug) {
    return 'dashboard';
  }

  return isValidPageSlug(slug) ? slug : null;
}

export function parseEditorialCalendarSearchParams(
  search: string
): { tab?: string; type?: string; filter?: string } {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  return {
    tab: params.get('tab') ?? undefined,
    type: params.get('type') ?? undefined,
    filter: params.get('filter') ?? undefined,
  };
}
