import {
  Mail,
  FileText,
  Megaphone,
  Share2,
  type LucideIcon,
} from 'lucide-react';
import type { ContentType, PageId } from './types';

export type PublicationComposerType = Exclude<ContentType, 'campaign'> | 'social';

export interface PublicationComposerState {
  open: boolean;
  type: PublicationComposerType;
  scheduledAt?: string;
  editContentId?: string;
  /** Pre-select distribution channels when opening (e.g. calendar channel filter). */
  initialChannelIds?: string[];
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

type AnnouncementTypeKey =
  keyof typeof import('@/lib/i18n/translations').translations.fr.publicationComposer.announcementTypes;

export interface AnnouncementTypeConfig {
  /** Stable id persisted in metadata.category. */
  id: string;
  labelKey: AnnouncementTypeKey;
}

/**
 * Types de communication proposés dans le compositeur de publication.
 * L'id est persisté (metadata.category) ; le libellé affiché vient de
 * l'i18n (publicationComposer.announcementTypes[labelKey]).
 */
export const ANNOUNCEMENT_TYPES: AnnouncementTypeConfig[] = [
  { id: 'general', labelKey: 'general' },
  { id: 'security', labelKey: 'security' },
  { id: 'it-maintenance', labelKey: 'itMaintenance' },
  { id: 'system-outage', labelKey: 'systemOutage' },
  { id: 'equipment-failure', labelKey: 'equipmentFailure' },
  { id: 'software-update', labelKey: 'softwareUpdate' },
  { id: 'leadership', labelKey: 'leadership' },
  { id: 'results', labelKey: 'results' },
  { id: 'hr', labelKey: 'hr' },
  { id: 'policy', labelKey: 'policy' },
  { id: 'event', labelKey: 'event' },
  { id: 'people', labelKey: 'people' },
  { id: 'training', labelKey: 'training' },
  { id: 'facilities', labelKey: 'facilities' },
  { id: 'health-safety', labelKey: 'healthSafety' },
];

export function getAnnouncementTypeLabelKey(id: string): AnnouncementTypeKey | null {
  return ANNOUNCEMENT_TYPES.find((item) => item.id === id)?.labelKey ?? null;
}

export function getPageForType(_type: PublicationComposerType): PageId {
  return 'editorial-calendar';
}

export interface PublicationComposerPayload {
  type: PublicationComposerType;
  title: string;
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
  editContentId?: string;
  /** When set (e.g. from calendar filter), pre-check these channels in the form. */
  initialChannelIds?: string[];
}

export function parseComposerScheduledAt(iso?: string): Date {
  if (!iso) return new Date();
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function isComposerScheduledAtValid(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

type CmsComposerType = Exclude<PublicationComposerType, 'social'>;

export interface CmsFormSeed {
  title: string;
  body: string;
  authorId: string;
  tags: string[];
  selectedChannels: string[];
  emailSubject: string;
  urgency: 'info' | 'warning' | 'critical';
  category: string;
}

export function cmsFormSeedFromContent(
  content: {
    type: string;
    title: string;
    body?: string;
    authorId?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
    channelIds?: string[];
    urgency?: string;
    category?: string;
  }
): { type: CmsComposerType; form: CmsFormSeed } | null {
  const type = content.type;
  if (
    type !== 'newsletter' &&
    type !== 'article' &&
    type !== 'announcement' &&
    type !== 'communique'
  ) {
    return null;
  }

  const meta = content.metadata ?? {};
  const urgencyRaw = content.urgency ?? meta.urgency;
  const urgency =
    urgencyRaw === 'warning' || urgencyRaw === 'critical' ? urgencyRaw : 'info';

  return {
    type,
    form: {
      title: content.title,
      body: content.body ?? '',
      authorId: content.authorId ?? '',
      tags: content.tags ?? [],
      selectedChannels:
        content.channelIds ??
        (Array.isArray(meta.channelIds) ? (meta.channelIds as string[]) : []),
      emailSubject:
        (typeof meta.emailSubject === 'string' ? meta.emailSubject : '') ||
        (typeof meta.subject === 'string' ? meta.subject : ''),
      urgency,
      category:
        content.category ??
        (typeof meta.category === 'string' ? meta.category : ''),
    },
  };
}
