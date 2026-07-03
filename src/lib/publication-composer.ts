import {
  Mail,
  FileText,
  Megaphone,
  ScrollText,
  Share2,
  type LucideIcon,
} from 'lucide-react';
import type { ContentType, PageId } from './types';

export type PublicationComposerType = Exclude<ContentType, 'campaign'> | 'social';

export interface PublicationComposerState {
  open: boolean;
  type: PublicationComposerType;
  scheduledAt?: string;
}

export const DEFAULT_PUBLICATION_COMPOSER_TYPE: PublicationComposerType = 'social';

export const FACEBOOK_CHAR_LIMIT = 16192;

type CreateContentKey = keyof typeof import('@/lib/i18n/translations').translations.fr.createContent;

export interface PublicationTypeConfig {
  type: PublicationComposerType;
  icon: LucideIcon;
  labelKey: CreateContentKey | 'social';
  descKey: CreateContentKey | 'typeSocial';
  color: string;
  bgColor: string;
  borderColor: string;
  indicatorBg: string;
  gradientFrom: string;
  gradientTo: string;
}

export const publicationTypes: PublicationTypeConfig[] = [
  {
    type: 'newsletter',
    icon: Mail,
    labelKey: 'newsletter',
    descKey: 'typeNewsletter',
    color: 'text-[oklch(0.55_0.18_250)]',
    bgColor: 'bg-[oklch(0.55_0.18_250/0.08)]',
    borderColor: 'border-[oklch(0.55_0.18_250/0.3)]',
    indicatorBg: 'bg-[oklch(0.55_0.18_250)]',
    gradientFrom: 'from-[oklch(0.55_0.18_250/0.15)]',
    gradientTo: 'to-[oklch(0.55_0.18_250/0.02)]',
  },
  {
    type: 'article',
    icon: FileText,
    labelKey: 'article',
    descKey: 'typeArticle',
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/8',
    borderColor: 'border-amber-500/30',
    indicatorBg: 'bg-amber-500',
    gradientFrom: 'from-amber-500/15',
    gradientTo: 'to-amber-500/2',
  },
  {
    type: 'announcement',
    icon: Megaphone,
    labelKey: 'announcement',
    descKey: 'typeAnnouncement',
    color: 'text-rose-600',
    bgColor: 'bg-rose-500/8',
    borderColor: 'border-rose-500/30',
    indicatorBg: 'bg-rose-500',
    gradientFrom: 'from-rose-500/15',
    gradientTo: 'to-rose-500/2',
  },
  {
    type: 'communique',
    icon: ScrollText,
    labelKey: 'communique',
    descKey: 'typeCommunique',
    color: 'text-violet-600',
    bgColor: 'bg-violet-500/8',
    borderColor: 'border-violet-500/30',
    indicatorBg: 'bg-violet-500',
    gradientFrom: 'from-violet-500/15',
    gradientTo: 'to-violet-500/2',
  },
  {
    type: 'social',
    icon: Share2,
    labelKey: 'social',
    descKey: 'typeSocial',
    color: 'text-[#1877F2]',
    bgColor: 'bg-[#1877F2]/8',
    borderColor: 'border-[#1877F2]/30',
    indicatorBg: 'bg-[#1877F2]',
    gradientFrom: 'from-[#1877F2]/15',
    gradientTo: 'to-[#1877F2]/2',
  },
];

export function isCmsType(type: PublicationComposerType): boolean {
  return type !== 'social';
}

export function getPageForType(_type: PublicationComposerType): PageId {
  return 'editorial-calendar';
}

export interface PublicationComposerPayload {
  type: PublicationComposerType;
  title: string;
  summary: string;
  body: string;
  authorId: string;
  tags: string[];
  channels: string[];
  scheduledAt: Date;
  metadata: Record<string, unknown>;
}

export interface OpenPublicationComposerOptions {
  type?: PublicationComposerType;
  scheduledAt?: Date;
}

export function parseComposerScheduledAt(iso?: string): Date {
  if (!iso) return new Date();
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function isComposerScheduledAtValid(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}
