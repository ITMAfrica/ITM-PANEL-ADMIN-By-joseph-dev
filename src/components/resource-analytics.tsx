'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useContent } from '@/hooks/use-content';
import { useCampaigns } from '@/hooks/use-campaigns';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Announcement, Article, Campaign, ContentItem, Newsletter } from '@/lib/types';
import {
  computeAnnouncementKpis,
  computeArticleKpis,
  computeCampaignKpis,
  computeNewsletterKpis,
  computePublishedContentKpis,
  formatKpiPercent,
  generateResourceTrend,
} from '@/lib/analytics-resources';
import { tableColumnTints } from '@/components/view-data-table';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const EMPTY_CONTENT: ContentItem[] = [];
const EMPTY_CAMPAIGNS: Campaign[] = [];

function useAnalyticsSourceData() {
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const { data: allContentData } = useContent({ tenantId: activeTenantId });
  const { data: campaignsData } = useCampaigns(activeTenantId);

  return useMemo(() => {
    const allContent = allContentData ?? EMPTY_CONTENT;
    const campaigns = campaignsData ?? EMPTY_CAMPAIGNS;
    const newsletters = allContent.filter((c) => c.type === 'newsletter') as Newsletter[];
    const articles = allContent.filter((c) => c.type === 'article') as Article[];
    const announcements = allContent.filter((c) => c.type === 'announcement') as Announcement[];
    const publishedItems = [...newsletters, ...articles, ...announcements];

    return { allContent, campaigns, newsletters, articles, announcements, publishedItems };
  }, [allContentData, campaignsData]);
}

const METRIC_TONE_TINTS = {
  amber: tableColumnTints.amber,
  pink: tableColumnTints.rose,
  cyan: tableColumnTints.cyan,
  purple: tableColumnTints.violet,
} as const;

export const METRIC_TONES = {
  amber: cn(METRIC_TONE_TINTS.amber, 'text-foreground'),
  pink: cn(METRIC_TONE_TINTS.pink, 'text-foreground'),
  cyan: cn(METRIC_TONE_TINTS.cyan, 'text-foreground'),
  purple: cn(METRIC_TONE_TINTS.purple, 'text-foreground'),
} as const;

type MetricTone = keyof typeof METRIC_TONES;

type SectionMetric = {
  label: string;
  value: React.ReactNode;
  tone: MetricTone;
};

const KPI_TONES: MetricTone[] = ['amber', 'pink', 'cyan', 'purple'];

const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  fontSize: '12px',
  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
  padding: '10px 14px',
};

export type ResourceAnalyticsId =
  | 'published-content'
  | 'newsletters'
  | 'articles'
  | 'announcements'
  | 'campaigns';

function AnalyticsMetricCard({ label, value, tone }: SectionMetric) {
  return (
    <div
      className={cn(
        'flex min-w-[110px] flex-1 flex-col items-center justify-center rounded-2xl px-3 py-4 text-center sm:min-w-[130px] sm:px-4 sm:py-5',
        METRIC_TONES[tone]
      )}
    >
      <div className="text-xl font-bold leading-none sm:text-2xl">{value}</div>
      <p className="mt-2 text-[11px] font-medium leading-tight opacity-85 sm:text-xs">{label}</p>
    </div>
  );
}

export function AnalyticsSection({
  title,
  metrics,
  children,
}: {
  title: string;
  metrics: SectionMetric[];
  children?: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
        <div className="flex shrink-0 items-center lg:w-36 xl:w-40">
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        </div>
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {metrics.map((metric) => (
            <AnalyticsMetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </div>
      {children}
    </section>
  );
}

export function ChartCard({ subtitle, children }: { subtitle?: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden border dark-card-glow">
      {subtitle && (
        <div className="border-b border-border/50 px-4 py-2.5">
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      )}
      <CardContent className="px-4 pb-4 pt-3">{children}</CardContent>
    </Card>
  );
}

export function ResourceTrendChart({
  resourceId,
  data,
  publishedLabel,
  scheduledLabel,
}: {
  resourceId: string;
  data: { name: string; published: number; scheduled: number }[];
  publishedLabel: string;
  scheduledLabel: string;
}) {
  const publishedGradientId = `stats-published-${resourceId}`;
  const scheduledGradientId = `stats-scheduled-${resourceId}`;

  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={publishedGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.55 0.18 250)" stopOpacity={0.15} />
              <stop offset="100%" stopColor="oklch(0.55 0.18 250)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id={scheduledGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.65 0.15 250)" stopOpacity={0.1} />
              <stop offset="100%" stopColor="oklch(0.65 0.15 250)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="name"
            fontSize={13}
            tickLine={false}
            axisLine={false}
            stroke="var(--muted-foreground)"
            dy={8}
          />
          <YAxis
            fontSize={13}
            tickLine={false}
            axisLine={false}
            stroke="var(--muted-foreground)"
            dx={-4}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'var(--muted)', radius: 4 }} />
          <Area
            type="monotone"
            dataKey="published"
            stroke="oklch(0.55 0.18 250)"
            fill={`url(#${publishedGradientId})`}
            strokeWidth={2.5}
            name={publishedLabel}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="scheduled"
            stroke="oklch(0.65 0.18 250 / 0.7)"
            fill={`url(#${scheduledGradientId})`}
            strokeWidth={2}
            strokeDasharray="5 5"
            name={scheduledLabel}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function useResourceAnalytics(resourceId: ResourceAnalyticsId, weeksCount = 12) {
  const { t } = useTranslation();
  const { campaigns, newsletters, articles, announcements, publishedItems } = useAnalyticsSourceData();

  const resource = useMemo(() => {
    const definitions: Record<
      ResourceAnalyticsId,
      { id: string; title: string; kpis: ReturnType<typeof computeNewsletterKpis>; publishedCount: number }
    > = {
      'published-content': {
        id: 'published-content',
        title: t.statistics.contentPublished,
        kpis: computePublishedContentKpis(publishedItems),
        publishedCount: publishedItems.filter((item) => item.status === 'published').length,
      },
      newsletters: {
        id: 'newsletters',
        title: t.nav.newsletters,
        kpis: computeNewsletterKpis(newsletters),
        publishedCount: newsletters.filter((item) => item.status === 'published').length,
      },
      articles: {
        id: 'articles',
        title: t.nav.articles,
        kpis: computeArticleKpis(articles),
        publishedCount: articles.filter((item) => item.status === 'published').length,
      },
      announcements: {
        id: 'announcements',
        title: t.nav.announcements,
        kpis: computeAnnouncementKpis(announcements),
        publishedCount: announcements.filter((item) => item.status === 'published').length,
      },
      campaigns: {
        id: 'campaigns',
        title: t.nav.campaigns,
        kpis: computeCampaignKpis(campaigns),
        publishedCount: campaigns.filter(
          (item) => item.status === 'active' || item.status === 'completed'
        ).length,
      },
    };

    return definitions[resourceId];
  }, [campaigns, newsletters, articles, announcements, publishedItems, resourceId, t.nav, t.statistics]);

  const trendData = useMemo(
    () => generateResourceTrend(weeksCount, resource.publishedCount),
    [weeksCount, resource.publishedCount]
  );

  const metrics: SectionMetric[] = useMemo(() => {
    const kpiLabels = [
      t.statistics.openRate,
      t.statistics.clickRate,
      t.statistics.conversionRate,
      t.statistics.engagement,
    ];
    const kpiValues = [
      formatKpiPercent(resource.kpis.openRate),
      formatKpiPercent(resource.kpis.clickRate),
      formatKpiPercent(resource.kpis.conversionRate),
      formatKpiPercent(resource.kpis.engagement),
    ];
    return kpiLabels.map((label, index) => ({
      label,
      value: kpiValues[index],
      tone: KPI_TONES[index],
    }));
  }, [resource.kpis, t.statistics]);

  return { resource, trendData, metrics };
}

export function ResourceAnalyticsPanel({
  resourceId,
  weeksCount = 12,
  className,
}: {
  resourceId: ResourceAnalyticsId;
  weeksCount?: number;
  className?: string;
}) {
  const { t } = useTranslation();
  const { resource, trendData, metrics } = useResourceAnalytics(resourceId, weeksCount);

  return (
    <div className={className}>
      <AnalyticsSection title={resource.title} metrics={metrics}>
        <ChartCard subtitle={t.statistics.resourceTrend}>
          <ResourceTrendChart
            resourceId={resource.id}
            data={trendData}
            publishedLabel={t.statistics.published}
            scheduledLabel={t.statistics.scheduled}
          />
        </ChartCard>
      </AnalyticsSection>
    </div>
  );
}

export function useAllResourceAnalytics(weeksCount = 12) {
  const { t } = useTranslation();
  const { campaigns, newsletters, articles, announcements, publishedItems } = useAnalyticsSourceData();

  const resources = useMemo(() => {
    return [
      {
        id: 'published-content' as const,
        title: t.statistics.contentPublished,
        kpis: computePublishedContentKpis(publishedItems),
        publishedCount: publishedItems.filter((item) => item.status === 'published').length,
      },
      {
        id: 'newsletters' as const,
        title: t.nav.newsletters,
        kpis: computeNewsletterKpis(newsletters),
        publishedCount: newsletters.filter((item) => item.status === 'published').length,
      },
      {
        id: 'articles' as const,
        title: t.nav.articles,
        kpis: computeArticleKpis(articles),
        publishedCount: articles.filter((item) => item.status === 'published').length,
      },
      {
        id: 'announcements' as const,
        title: t.nav.announcements,
        kpis: computeAnnouncementKpis(announcements),
        publishedCount: announcements.filter((item) => item.status === 'published').length,
      },
      {
        id: 'campaigns' as const,
        title: t.nav.campaigns,
        kpis: computeCampaignKpis(campaigns),
        publishedCount: campaigns.filter(
          (item) => item.status === 'active' || item.status === 'completed'
        ).length,
      },
    ];
  }, [campaigns, newsletters, articles, announcements, publishedItems, t.nav, t.statistics]);

  const resourceTrends = useMemo(
    () =>
      Object.fromEntries(
        resources.map((resource) => [
          resource.id,
          generateResourceTrend(weeksCount, resource.publishedCount),
        ])
      ),
    [resources, weeksCount]
  );

  const kpiLabels = useMemo(
    () => [
      t.statistics.openRate,
      t.statistics.clickRate,
      t.statistics.conversionRate,
      t.statistics.engagement,
    ],
    [t.statistics]
  );

  return { resources, resourceTrends, kpiLabels };
}

const ALL_KPI_TONES: MetricTone[] = ['amber', 'pink', 'cyan', 'purple'];

export function AllResourceAnalyticsPanels({
  weeksCount = 12,
  className,
}: {
  weeksCount?: number;
  className?: string;
}) {
  const { t } = useTranslation();
  const { resources, resourceTrends, kpiLabels } = useAllResourceAnalytics(weeksCount);

  return (
    <div className={cn('space-y-8', className)}>
      {resources.map((resource) => {
        const kpiValues = [
          formatKpiPercent(resource.kpis.openRate),
          formatKpiPercent(resource.kpis.clickRate),
          formatKpiPercent(resource.kpis.conversionRate),
          formatKpiPercent(resource.kpis.engagement),
        ];

        const metrics: SectionMetric[] = kpiLabels.map((label, index) => ({
          label,
          value: kpiValues[index],
          tone: ALL_KPI_TONES[index],
        }));

        return (
          <AnalyticsSection key={resource.id} title={resource.title} metrics={metrics}>
            <ChartCard subtitle={t.statistics.resourceTrend}>
              <ResourceTrendChart
                resourceId={resource.id}
                data={resourceTrends[resource.id]}
                publishedLabel={t.statistics.published}
                scheduledLabel={t.statistics.scheduled}
              />
            </ChartCard>
          </AnalyticsSection>
        );
      })}
    </div>
  );
}
