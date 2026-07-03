import { db } from '../lib/prisma';

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
  nextSendAt: string | null;
  thisWeek: number;
}

export interface ChannelMetrics {
  total: number;
  active: number;
  subscribers: number;
}

export interface ApprovalQueueItem {
  id: string;
  type: string;
  title: string;
  authorId: string;
  updatedAt: string;
  status: string;
}

export interface DashboardSummary {
  tenantId: string;
  newsletters: ContentTypeMetrics;
  articles: ContentTypeMetrics;
  announcements: ContentTypeMetrics;
  campaigns: CampaignMetrics;
  editorialCalendar: EditorialCalendarMetrics;
  scheduling: SchedulingMetrics;
  channels: ChannelMetrics;
  approvalQueue: ApprovalQueueItem[];
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

function isInCurrentWeek(date: Date): boolean {
  const now = new Date();
  return date >= startOfWeek(now) && date <= endOfWeek(now);
}

function countByTypeAndStatus(
  rows: { type: string; status: string }[],
  type: string
): ContentTypeMetrics {
  const filtered = rows.filter((row) => row.type === type);
  return {
    published: filtered.filter((row) => row.status === 'published').length,
    drafts: filtered.filter((row) => row.status === 'draft').length,
    scheduled: filtered.filter((row) => row.status === 'scheduled').length,
    inReview: filtered.filter((row) => row.status === 'review').length,
  };
}

function computeCampaignMetrics(
  campaigns: { status: string; contentCount: number; publishedCount: number }[]
): CampaignMetrics {
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

export async function getDashboardSummary(tenantId: string): Promise<DashboardSummary> {
  const [contentRows, campaigns, channels, reviewRows] = await Promise.all([
    db.content.findMany({
      where: { tenantId },
      select: {
        type: true,
        status: true,
        scheduledAt: true,
        publishedAt: true,
      },
    }),
    db.campaign.findMany({
      where: { tenantId },
      select: {
        status: true,
        contentCount: true,
        publishedCount: true,
      },
    }),
    db.distributionChannel.findMany({
      where: { tenantId },
      select: {
        isActive: true,
        subscriberCount: true,
      },
    }),
    db.content.findMany({
      where: { tenantId, status: 'review' },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        type: true,
        title: true,
        authorId: true,
        updatedAt: true,
        status: true,
      },
    }),
  ]);

  const scheduled = contentRows.filter((row) => row.status === 'scheduled');
  const published = contentRows.filter((row) => row.status === 'published');

  const weekScheduled = scheduled.filter(
    (row) => row.scheduledAt && isInCurrentWeek(row.scheduledAt)
  ).length;
  const weekPublished = published.filter(
    (row) => row.publishedAt && isInCurrentWeek(row.publishedAt)
  ).length;

  const scheduledWithDate = scheduled
    .filter((row) => row.scheduledAt)
    .sort((a, b) => a.scheduledAt!.getTime() - b.scheduledAt!.getTime());

  const thisWeekScheduled = scheduled.filter(
    (row) => row.scheduledAt && isInCurrentWeek(row.scheduledAt)
  ).length;

  return {
    tenantId,
    newsletters: countByTypeAndStatus(contentRows, 'newsletter'),
    articles: countByTypeAndStatus(contentRows, 'article'),
    announcements: countByTypeAndStatus(contentRows, 'announcement'),
    campaigns: computeCampaignMetrics(campaigns),
    editorialCalendar: {
      thisWeek: weekScheduled + weekPublished,
      scheduled: scheduled.length,
      published: published.length,
    },
    scheduling: {
      queueSize: scheduled.length,
      nextSendAt: scheduledWithDate[0]?.scheduledAt?.toISOString() ?? null,
      thisWeek: thisWeekScheduled,
    },
    channels: {
      total: channels.length,
      active: channels.filter((c) => c.isActive).length,
      subscribers: channels.reduce((sum, c) => sum + c.subscriberCount, 0),
    },
    approvalQueue: reviewRows.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      authorId: row.authorId ?? '',
      updatedAt: row.updatedAt.toISOString(),
      status: row.status,
    })),
  };
}
