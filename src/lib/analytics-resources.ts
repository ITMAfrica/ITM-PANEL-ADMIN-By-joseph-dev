import type { Announcement, Article, Campaign, Newsletter } from '@/lib/types';

// ─── Per-type KPI types ──────────────────────────────────────────────────

export type NewsletterKpis = {
  type: 'newsletter';
  openRate: number | null;
  clickRate: number | null;
  bounceRate: number | null;
  recipientCount: number;
};

export type ArticleKpis = {
  type: 'article';
  totalViews: number;
  avgReadingTime: number | null;
  interactionRate: number | null;
  clickRate: number | null;
};

export type AnnouncementKpis = {
  type: 'announcement';
  acknowledgmentRate: number | null;
  totalRecipients: number;
  acknowledgedCount: number;
  clickRate: number | null;
};

export type CampaignKpis = {
  type: 'campaign';
  activeCount: number;
  completedCount: number;
  totalReach: number;
  avgOpenRate: number | null;
  avgClickRate: number | null;
};

export type AnyResourceKpis =
  | NewsletterKpis
  | ArticleKpis
  | AnnouncementKpis
  | CampaignKpis;

// ─── Helpers ─────────────────────────────────────────────────────────────

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

export function formatKpiPercent(value: number | null): string {
  if (value === null) return '—';
  return `${value}%`;
}

// ─── Compute functions ───────────────────────────────────────────────────

export function computeNewsletterKpis(newsletters: Newsletter[]): NewsletterKpis {
  const published = newsletters.filter((item) => item.status === 'published');
  const openRates = published.filter((item) => item.openRate > 0).map((item) => item.openRate);
  const clickRates = published.filter((item) => item.clickRate > 0).map((item) => item.clickRate);
  const bounceRates = published.filter((item) => item.bounceRate > 0).map((item) => item.bounceRate);
  const totalRecipients = published.reduce((sum, item) => sum + item.recipientCount, 0);

  return {
    type: 'newsletter',
    openRate: average(openRates),
    clickRate: average(clickRates),
    bounceRate: average(bounceRates),
    recipientCount: totalRecipients,
  };
}

export function computeArticleKpis(articles: Article[]): ArticleKpis {
  const published = articles.filter((item) => item.status === 'published');
  const totalViews = published.reduce((sum, item) => sum + item.viewCount, 0);
  const clickRates = published
    .filter((item) => (item.clickRate ?? 0) > 0)
    .map((item) => item.clickRate!);
  const interactionRates = published
    .filter((item) => item.viewCount > 0)
    .map((item) => {
      const interactions = item.likeCount + item.commentCount + item.shareCount;
      return Math.min(100, Math.round((interactions / item.viewCount) * 100 * 10) / 10);
    })
    .filter((rate) => rate > 0);
  const readingTimes = published.filter((item) => item.readingTime > 0).map((item) => item.readingTime);

  return {
    type: 'article',
    totalViews,
    avgReadingTime: average(readingTimes),
    interactionRate: average(interactionRates),
    clickRate: average(clickRates),
  };
}

export function computeAnnouncementKpis(announcements: Announcement[]): AnnouncementKpis {
  const published = announcements.filter((item) => item.status === 'published');
  const acknowledgmentRates = published
    .filter((item) => item.totalRecipients > 0)
    .map((item) => Math.round((item.acknowledgedCount / item.totalRecipients) * 1000) / 10);
  const clickRates = published
    .filter((item) => (item.clickRate ?? 0) > 0)
    .map((item) => item.clickRate!);
  const totalRecipients = published.reduce((sum, item) => sum + item.totalRecipients, 0);
  const acknowledgedCount = published.reduce((sum, item) => sum + item.acknowledgedCount, 0);

  return {
    type: 'announcement',
    acknowledgmentRate: average(acknowledgmentRates),
    totalRecipients,
    acknowledgedCount,
    clickRate: average(clickRates),
  };
}

export function computeCampaignKpis(campaigns: Campaign[]): CampaignKpis {
  const active = campaigns.filter((item) => item.status === 'active');
  const completed = campaigns.filter((item) => item.status === 'completed');
  const tracked = [...active, ...completed];
  const openRates = tracked.filter((item) => item.avgOpenRate > 0).map((item) => item.avgOpenRate);
  const clickRates = tracked.filter((item) => item.avgClickRate > 0).map((item) => item.avgClickRate);
  const totalReach = tracked.reduce((sum, item) => sum + item.totalReach, 0);

  return {
    type: 'campaign',
    activeCount: active.length,
    completedCount: completed.length,
    totalReach,
    avgOpenRate: average(openRates),
    avgClickRate: average(clickRates),
  };
}

// ─── Trend ────────────────────────────────────────────────────────────────

export type TrendItem = {
  publishedAt?: string | null;
  scheduledAt?: string | null;
  status?: string;
};

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function isInWeekRange(iso: string | null | undefined, weekStart: Date, weekEnd: Date): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return t >= weekStart.getTime() && t < weekEnd.getTime();
}

/** Buckets real publishedAt / scheduledAt timestamps into the last N weeks. */
export function generateResourceTrend(weeks: number, items: TrendItem[]) {
  const data: { name: string; published: number; scheduled: number }[] = [];
  const thisWeekStart = startOfWeek(new Date());

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(thisWeekStart);
    weekStart.setDate(thisWeekStart.getDate() - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    const weekIndex = weeks - i;

    const published = items.filter(
      (item) =>
        item.status === 'published' && isInWeekRange(item.publishedAt, weekStart, weekEnd)
    ).length;
    const scheduled = items.filter((item) =>
      isInWeekRange(item.scheduledAt, weekStart, weekEnd)
    ).length;

    data.push({
      name: `S${String(weekIndex).padStart(2, '0')}`,
      published,
      scheduled,
    });
  }

  return data;
}
