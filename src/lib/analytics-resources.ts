import type { Announcement, Article, Campaign, ContentItem, Newsletter } from '@/lib/types';

export type ResourceKpis = {
  openRate: number | null;
  clickRate: number | null;
  conversionRate: number | null;
  engagement: number | null;
};

export type AnalyticsResource = {
  id: string;
  title: string;
  kpis: ResourceKpis;
  publishedCount: number;
  source: 'internal' | 'external';
};

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function computeEngagement(openRate: number | null, clickRate: number | null): number | null {
  if (openRate === null && clickRate === null) return null;
  const open = openRate ?? 0;
  const click = clickRate ?? 0;
  return Math.round((open * 0.4 + click * 0.6) * 10) / 10;
}

function computeConversion(openRate: number | null, clickRate: number | null): number | null {
  if (!openRate || openRate <= 0 || clickRate === null) return null;
  return Math.round((clickRate / openRate) * 100 * 10) / 10;
}

function finalizeKpis(openRates: number[], clickRates: number[]): ResourceKpis {
  const openRate = average(openRates);
  const clickRate = average(clickRates);
  return {
    openRate,
    clickRate,
    conversionRate: computeConversion(openRate, clickRate),
    engagement: computeEngagement(openRate, clickRate),
  };
}

export function formatKpiPercent(value: number | null): string {
  if (value === null) return '—';
  return `${value}%`;
}

export function computeNewsletterKpis(newsletters: Newsletter[]): ResourceKpis {
  const published = newsletters.filter((item) => item.status === 'published');
  const openRates = published.filter((item) => item.openRate > 0).map((item) => item.openRate);
  const clickRates = published.filter((item) => item.clickRate > 0).map((item) => item.clickRate);
  return finalizeKpis(openRates, clickRates);
}

export function computeArticleKpis(articles: Article[]): ResourceKpis {
  const published = articles.filter((item) => item.status === 'published');
  const clickRates = published
    .filter((item) => (item.clickRate ?? 0) > 0)
    .map((item) => item.clickRate!);
  const openRates = published
    .filter((item) => item.viewCount > 0)
    .map((item) => {
      const interactions = item.likeCount + item.commentCount + item.shareCount;
      return Math.min(100, Math.round((interactions / item.viewCount) * 100 * 10) / 10);
    })
    .filter((rate) => rate > 0);

  return finalizeKpis(openRates, clickRates);
}

export function computeAnnouncementKpis(announcements: Announcement[]): ResourceKpis {
  const published = announcements.filter((item) => item.status === 'published');
  const openRates = published
    .filter((item) => item.totalRecipients > 0)
    .map((item) => Math.round((item.acknowledgedCount / item.totalRecipients) * 1000) / 10);
  const clickRates = published
    .filter((item) => (item.clickRate ?? 0) > 0)
    .map((item) => item.clickRate!);

  return finalizeKpis(openRates, clickRates);
}

export function computeCampaignKpis(campaigns: Campaign[]): ResourceKpis {
  const tracked = campaigns.filter(
    (item) => item.status === 'active' || item.status === 'completed'
  );
  const openRates = tracked.filter((item) => item.avgOpenRate > 0).map((item) => item.avgOpenRate);
  const clickRates = tracked.filter((item) => item.avgClickRate > 0).map((item) => item.avgClickRate);
  return finalizeKpis(openRates, clickRates);
}

export function computePublishedContentKpis(items: ContentItem[]): ResourceKpis {
  const published = items.filter((item) => item.status === 'published');
  const openRates: number[] = [];
  const clickRates: number[] = [];

  for (const item of published) {
    if (item.type === 'newsletter') {
      const newsletter = item as Newsletter;
      if (newsletter.openRate > 0) openRates.push(newsletter.openRate);
      if (newsletter.clickRate > 0) clickRates.push(newsletter.clickRate);
      continue;
    }

    if (item.type === 'article') {
      const article = item as Article;
      if ((article.clickRate ?? 0) > 0) clickRates.push(article.clickRate!);
      if (article.viewCount > 0) {
        const interactions = article.likeCount + article.commentCount + article.shareCount;
        const rate = Math.min(100, Math.round((interactions / article.viewCount) * 100 * 10) / 10);
        if (rate > 0) openRates.push(rate);
      }
      continue;
    }

    if (item.type === 'announcement') {
      const announcement = item as Announcement;
      if (announcement.totalRecipients > 0) {
        openRates.push(
          Math.round((announcement.acknowledgedCount / announcement.totalRecipients) * 1000) / 10
        );
      }
      if ((announcement.clickRate ?? 0) > 0) clickRates.push(announcement.clickRate!);
    }
  }

  return finalizeKpis(openRates, clickRates);
}

export function generateResourceTrend(weeks: number, publishedCount: number) {
  const scale = Math.max(1, publishedCount);
  const data: { name: string; published: number; scheduled: number }[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const weekIndex = weeks - i;
    const published = Math.max(1, Math.round((scale * weekIndex) / weeks));
    const scheduled = Math.max(0, Math.round((scale * weekIndex) / (weeks + 2)));
    data.push({
      name: `S${String(weekIndex).padStart(2, '0')}`,
      published,
      scheduled,
    });
  }

  return data;
}
