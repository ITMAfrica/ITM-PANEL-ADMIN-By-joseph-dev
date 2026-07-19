import type { Campaign, ContentItem, ContentType, DistributionChannel } from './types';

export type DashboardServiceId =
  | 'newsletters'
  | 'articles'
  | 'announcements'
  | 'campaigns'
  | 'editorial-calendar'
  | 'scheduling'
  | 'channels';

export interface ContentTypeMetrics {
  published: number;
  drafts: number;
  scheduled: number;
  inReview: number;
}

export interface CampaignMetrics {
  active: number;
  draft: number;
  avgPublishRate: number;
}

export interface EditorialCalendarMetrics {
  thisWeek: number;
  scheduled: number;
  published: number;
}

export interface SchedulingMetrics {
  queueSize: number;
  nextSendLabel: string;
  thisWeek: number;
}

export interface ChannelMetrics {
  total: number;
  active: number;
  subscribers: number;
}

export function countByContentType(
  items: ContentItem[],
  type: ContentType
): ContentTypeMetrics {
  const filtered = items.filter((item) => item.type === type);
  return {
    published: filtered.filter((item) => item.status === 'published').length,
    drafts: filtered.filter((item) => item.status === 'draft').length,
    scheduled: filtered.filter((item) => item.status === 'scheduled').length,
    inReview: filtered.filter((item) => item.status === 'review').length,
  };
}

export function computeCampaignMetrics(campaigns: Campaign[]): CampaignMetrics {
  const active = campaigns.filter((c) => c.status === 'active').length;
  const draft = campaigns.filter((c) => c.status === 'draft').length;
  const withContent = campaigns.filter((c) => c.contentCount > 0);
  const avgPublishRate =
    withContent.length > 0
      ? Math.round(
          withContent.reduce(
            (sum, c) => sum + (c.publishedCount / c.contentCount) * 100,
            0
          ) / withContent.length
        )
      : 0;

  return { active, draft, avgPublishRate };
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function isInCurrentWeek(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  return date >= startOfWeek(now) && date <= endOfWeek(now);
}

export function computeEditorialCalendarMetrics(
  scheduled: ContentItem[],
  published: ContentItem[]
): EditorialCalendarMetrics {
  const weekScheduled = scheduled.filter(
    (item) => item.scheduledAt && isInCurrentWeek(item.scheduledAt)
  ).length;
  const weekPublished = published.filter(
    (item) => item.publishedAt && isInCurrentWeek(item.publishedAt)
  ).length;

  return {
    thisWeek: weekScheduled + weekPublished,
    scheduled: scheduled.length,
    published: published.length,
  };
}

export function formatNextSendLabel(
  scheduledItems: ContentItem[],
  locale: string
): string {
  const withDate = scheduledItems
    .filter((item) => item.scheduledAt)
    .sort(
      (a, b) =>
        new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime()
    );

  if (withDate.length === 0) {
    return formatNextSendAt(null, locale);
  }

  return formatNextSendAt(withDate[0].scheduledAt!, locale);
}

export function formatNextSendAt(
  nextSendAt: string | null,
  locale: string
): string {
  if (!nextSendAt) {
    return locale === 'fr' ? 'Aucun' : 'None';
  }

  return new Date(nextSendAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function computeSchedulingMetrics(
  scheduledItems: ContentItem[],
  locale: string
): SchedulingMetrics {
  const thisWeek = scheduledItems.filter(
    (item) => item.scheduledAt && isInCurrentWeek(item.scheduledAt)
  ).length;

  return {
    queueSize: scheduledItems.length,
    nextSendLabel: formatNextSendLabel(scheduledItems, locale),
    thisWeek,
  };
}

export function computeChannelMetrics(
  channels: DistributionChannel[]
): ChannelMetrics {
  return {
    total: channels.length,
    active: channels.filter((c) => c.isActive).length,
    subscribers: channels.reduce((sum, c) => sum + c.subscriberCount, 0),
  };
}
