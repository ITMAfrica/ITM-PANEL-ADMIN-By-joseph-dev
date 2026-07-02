import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Mail,
  FileText,
  Megaphone,
  Target,
  Calendar,
  BookOpen,
  ImageIcon,
  LayoutTemplate,
  FilePen,
  CheckCircle,
  Archive,
  Clock,
  Radio,
  Zap,
  BarChart3,
  PieChart,
  Users,
  Shield,
  Building2,
  ScrollText,
} from 'lucide-react';
import type { PageId } from './types';

export type SectionKey =
  | 'communication'
  | 'contentManagement'
  | 'analysis'
  | 'administration';

export interface NavItemDef {
  icon: LucideIcon;
  pageId: PageId;
}

export const SECTION_NAV: { key: SectionKey; icon: LucideIcon; defaultPage: PageId }[] = [
  { key: 'communication', icon: LayoutDashboard, defaultPage: 'dashboard' },
  { key: 'contentManagement', icon: BookOpen, defaultPage: 'library' },
  { key: 'analysis', icon: BarChart3, defaultPage: 'statistics' },
  { key: 'administration', icon: Shield, defaultPage: 'users' },
];

export const SECTION_ITEMS: Record<SectionKey, NavItemDef[]> = {
  communication: [
    { icon: LayoutDashboard, pageId: 'dashboard' },
    { icon: Mail, pageId: 'newsletters' },
    { icon: FileText, pageId: 'articles' },
    { icon: Megaphone, pageId: 'announcements' },
    { icon: Target, pageId: 'campaigns' },
    { icon: Calendar, pageId: 'editorial-calendar' },
    { icon: Clock, pageId: 'scheduling' },
    { icon: Radio, pageId: 'channels' },
  ],
  contentManagement: [
    { icon: BookOpen, pageId: 'library' },
    { icon: ImageIcon, pageId: 'media' },
    { icon: LayoutTemplate, pageId: 'templates' },
    { icon: FilePen, pageId: 'drafts' },
    { icon: CheckCircle, pageId: 'published' },
    { icon: Archive, pageId: 'archive' },
  ],
  analysis: [
    { icon: BarChart3, pageId: 'statistics' },
    { icon: PieChart, pageId: 'reports' },
  ],
  administration: [
    { icon: Users, pageId: 'users' },
    { icon: Shield, pageId: 'roles' },
    { icon: Building2, pageId: 'tenants' },
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
  'editorial-calendar': 'communication',
  scheduling: 'communication',
  channels: 'communication',
  library: 'contentManagement',
  media: 'contentManagement',
  templates: 'contentManagement',
  drafts: 'contentManagement',
  published: 'contentManagement',
  archive: 'contentManagement',
  statistics: 'analysis',
  reports: 'analysis',
  users: 'administration',
  roles: 'administration',
  tenants: 'administration',
  audit: 'administration',
  automations: 'administration',
};

/** Quick-access pages always shown in the top bar (in addition to section icons). */
export const HEADER_PAGE_NAV: NavItemDef[] = [
  { icon: Calendar, pageId: 'editorial-calendar' },
];

export const ALL_NAV_ITEMS: NavItemDef[] = Object.values(SECTION_ITEMS).flat();

export function getSectionForPage(page: PageId): SectionKey | null {
  return PAGE_SECTION_MAP[page] ?? null;
}

export function getSectionItems(section: SectionKey): NavItemDef[] {
  return SECTION_ITEMS[section];
}
