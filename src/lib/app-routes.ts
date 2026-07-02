import type { PageId } from './types';

/** Pages reachable via client-side navigation and URL paths. */
export const ROUTABLE_PAGES: readonly PageId[] = [
  'dashboard',
  'newsletters',
  'articles',
  'announcements',
  'campaigns',
  'editorial-calendar',
  'library',
  'media',
  'templates',
  'drafts',
  'published',
  'archive',
  'scheduling',
  'channels',
  'automations',
  'statistics',
  'reports',
  'users',
  'roles',
  'tenants',
  'audit',
  'settings',
] as const;

const ROUTABLE_PAGE_SET = new Set<string>(ROUTABLE_PAGES);

export function isValidPageSlug(slug: string): slug is PageId {
  return ROUTABLE_PAGE_SET.has(slug);
}

export function pageIdToPath(pageId: PageId): string {
  return pageId === 'dashboard' ? '/' : `/${pageId}`;
}

export function pathToPageId(pathname: string): PageId | null {
  const slug = pathname.replace(/\/$/, '').split('/').filter(Boolean)[0];

  if (!slug) {
    return 'dashboard';
  }

  return isValidPageSlug(slug) ? slug : null;
}
