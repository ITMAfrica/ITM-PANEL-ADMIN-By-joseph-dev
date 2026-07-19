import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Calendar,
  Send,
  BookOpen,
  ImageIcon,
  LayoutTemplate,
  FilePen,
  CheckCircle,
  Archive,
  Zap,
  Users,
  Shield,
  Building2,
  ScrollText,
  BookMarked,
} from 'lucide-react';
import type { PageId } from './types';

export type SectionKey =
  | 'communication'
  | 'contentManagement'
  | 'administration';

export interface NavItemDef {
  icon: LucideIcon;
  pageId: PageId;
}

export const SECTION_NAV: { key: SectionKey; icon: LucideIcon; defaultPage: PageId }[] = [
  { key: 'communication', icon: LayoutDashboard, defaultPage: 'dashboard' },
  { key: 'contentManagement', icon: BookOpen, defaultPage: 'library' },
  { key: 'administration', icon: Shield, defaultPage: 'users' },
];

/** Top bar + mobile section switcher — administration lives in Settings only. */
export const HEADER_SECTION_NAV = SECTION_NAV.filter((s) => s.key !== 'administration');

export const SECTION_ITEMS: Record<SectionKey, NavItemDef[]> = {
  communication: [{ icon: LayoutDashboard, pageId: 'dashboard' }, { icon: BookMarked, pageId: 'documentation' }],
  contentManagement: [
    { icon: BookOpen, pageId: 'library' },
    { icon: ImageIcon, pageId: 'media' },
    { icon: LayoutTemplate, pageId: 'templates' },
    { icon: FilePen, pageId: 'drafts' },
    { icon: CheckCircle, pageId: 'published' },
    { icon: Archive, pageId: 'archive' },
  ],
  administration: [
    { icon: Users, pageId: 'users' },
    { icon: Shield, pageId: 'roles' },
    { icon: Building2, pageId: 'tenants' },
    { icon: Users, pageId: 'workspace-members' },
    { icon: ScrollText, pageId: 'audit' },
    { icon: Zap, pageId: 'automations' },
  ],
};

/** Maps each routable page to its header section. Settings is profile-only (not listed). */
export const PAGE_SECTION_MAP: Partial<Record<PageId, SectionKey>> = {
  dashboard: 'communication',
  newsletters: 'communication',
  articles: 'communication',
  announcements: 'communication',
  campaigns: 'communication',
  scheduling: 'communication',
  channels: 'communication',
  library: 'contentManagement',
  media: 'contentManagement',
  templates: 'contentManagement',
  drafts: 'contentManagement',
  published: 'contentManagement',
  archive: 'contentManagement',
  reports: 'communication',
  documentation: 'communication',
  users: 'administration',
  roles: 'administration',
  tenants: 'administration',
  audit: 'administration',
  automations: 'administration',
};

/** Pages that show the Metricool-style dashboard sidebar (platforms, tools). */
export const DASHBOARD_SIDEBAR_PAGES: readonly PageId[] = ['dashboard'] as const;

const DASHBOARD_SIDEBAR_PAGE_SET = new Set<string>(DASHBOARD_SIDEBAR_PAGES);

export function isDashboardSidebarPage(page: PageId): boolean {
  return DASHBOARD_SIDEBAR_PAGE_SET.has(page);
}

/** Whether the left section sidebar should be visible for this page. */
export function shouldShowAppSidebar(page: PageId): boolean {
  return getSectionForPage(page) !== null;
}

/** Quick-access pages in the top bar center nav (beside section icons). */
export const HEADER_PAGE_NAV: NavItemDef[] = [
  { icon: Calendar, pageId: 'editorial-calendar' },
  { icon: Send, pageId: 'conversation' },
];

export const ALL_NAV_ITEMS: NavItemDef[] = Object.values(SECTION_ITEMS).flat();

export function getSectionForPage(page: PageId): SectionKey | null {
  return PAGE_SECTION_MAP[page] ?? null;
}

export function getSectionItems(section: SectionKey): NavItemDef[] {
  return SECTION_ITEMS[section];
}
