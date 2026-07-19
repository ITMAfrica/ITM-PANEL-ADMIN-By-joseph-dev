'use client';

import { useMemo, useState } from 'react';
import {
  Check,
  ListFilter,
  type LucideIcon,
  BarChart3,
  Radar,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useContent } from '@/hooks/use-content';
import { useCampaigns } from '@/hooks/use-campaigns';
import {
  TREND_MODES,
  useAnalyticsTrend,
  type TrendMode,
  type TrendResource,
} from '@/hooks/use-analytics-trend';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Announcement, Article, Campaign, ContentItem, Newsletter } from '@/lib/types';
import {
  computeAnnouncementKpis,
  computeArticleKpis,
  computeCampaignKpis,
  computeNewsletterKpis,
  formatKpiPercent,
  generateResourceTrend,
  type AnnouncementKpis,
  type ArticleKpis,
  type CampaignKpis,
  type NewsletterKpis,
} from '@/lib/analytics-resources';
import { tableColumnTints } from '@/components/view-data-table';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
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

    return { campaigns, newsletters, articles, announcements };
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

export type AnalyticsSectionMetric = {
  label: string;
  value: React.ReactNode;
  tone: MetricTone;
};

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; dataKey?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-[10px] bg-[#1D141F] px-3 py-2.5 text-xs text-white shadow-[0_8px_24px_rgba(29,20,31,0.18)]">
      <p className="mb-1.5 text-[11px] font-medium text-[#E2F343]">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={String(entry.dataKey)} className="flex items-center justify-between gap-4">
            <span className="text-[#B8BEC6]">{entry.name}</span>
            <span className="font-semibold tabular-nums text-white">{entry.value ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export type ResourceAnalyticsId =
  | 'newsletters'
  | 'articles'
  | 'announcements'
  | 'campaigns';

// ─── Metric card ─────────────────────────────────────────────────────────

export function AnalyticsMetricCard({
  label,
  value,
  tone,
  square,
}: AnalyticsSectionMetric & { square?: boolean }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl text-center',
        square
          ? 'aspect-square w-full px-2 py-3'
          : 'min-w-[110px] flex-1 px-3 py-4 sm:min-w-[130px] sm:px-4 sm:py-5',
        METRIC_TONES[tone]
      )}
    >
      <div
        className={cn(
          'font-bold leading-none',
          square ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
        )}
      >
        {value}
      </div>
      <p
        className={cn(
          'font-medium leading-tight opacity-85',
          square ? 'mt-1.5 text-[10px] sm:text-[11px]' : 'mt-2 text-[11px] sm:text-xs'
        )}
      >
        {label}
      </p>
    </div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────

export function AnalyticsSection({
  title,
  metrics,
  children,
}: {
  title: string;
  metrics: AnalyticsSectionMetric[];
  children?: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
        <div className="flex shrink-0 items-stretch lg:w-36 xl:w-40">
          <div className="flex w-full items-center gap-2.5 rounded-2xl bg-[#1D141F] px-3.5 py-3.5 dark-card-glow">
            <span
              className="h-9 w-1 shrink-0 rounded-full bg-[#E2F343]"
              aria-hidden
            />
            <h2 className="text-base font-bold leading-snug tracking-tight text-white">
              {title}
            </h2>
          </div>
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

// ─── Chart ───────────────────────────────────────────────────────────────

const TREND_MODE_STYLES: Record<
  TrendMode,
  { icon: LucideIcon; iconClass: string; chipClass: string }
> = {
  volume: {
    icon: BarChart3,
    iconClass: 'text-[#1D141F]',
    chipClass: 'bg-[#EEF1F4]',
  },
  reach: {
    icon: Radar,
    iconClass: 'text-amber-700',
    chipClass: 'bg-amber-100',
  },
  engagement: {
    icon: Zap,
    iconClass: 'text-rose-700',
    chipClass: 'bg-rose-100',
  },
  quality: {
    icon: Sparkles,
    iconClass: 'text-emerald-700',
    chipClass: 'bg-emerald-100',
  },
};

function TrendModeSwitch({
  value,
  onChange,
}: {
  value: TrendMode;
  onChange: (mode: TrendMode) => void;
}) {
  const { t } = useTranslation();
  const activeLabel = t.statistics.trendModes[value];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={activeLabel}
          title={activeLabel}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#8B939E] transition-colors hover:bg-[#F4F6F8] hover:text-[#1D141F] data-[state=open]:bg-[#EEF1F4] data-[state=open]:text-[#1D141F]"
        >
          <ListFilter className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[11.5rem] p-1.5">
        {TREND_MODES.map((mode) => {
          const selected = value === mode;
          const style = TREND_MODE_STYLES[mode];
          const Icon = style.icon;

          return (
            <DropdownMenuItem
              key={mode}
              onClick={() => onChange(mode)}
              className={cn(
                'flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2',
                selected && 'bg-[#F4F6F8] focus:bg-[#F4F6F8]'
              )}
            >
              <span
                className={cn(
                  'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                  style.chipClass
                )}
              >
                <Icon className={cn('h-3.5 w-3.5', style.iconClass)} strokeWidth={2} />
              </span>
              <span
                className={cn(
                  'min-w-0 flex-1 text-sm text-[#1D141F]',
                  selected ? 'font-semibold' : 'font-medium'
                )}
              >
                {t.statistics.trendModes[mode]}
              </span>
              {selected && (
                <Check className="h-3.5 w-3.5 shrink-0 text-[#1D141F]" strokeWidth={2.25} />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function trendKeyLabel(
  key: string,
  labels: Record<string, string>
): string {
  return labels[key] ?? key;
}

export function ChartCard({
  subtitle,
  trailing,
  children,
}: {
  subtitle?: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="gap-0 overflow-hidden py-0 dark-card-glow">
      {(subtitle || trailing) && (
        <div className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-2.5">
          {subtitle ? (
            <p className="min-w-0 truncate text-sm text-muted-foreground">{subtitle}</p>
          ) : (
            <span />
          )}
          {trailing}
        </div>
      )}
      <CardContent className="px-4 py-3">{children}</CardContent>
    </Card>
  );
}

export function ResourceTrendChart({
  resourceId,
  data,
  publishedLabel,
  scheduledLabel,
  showSecondary = true,
}: {
  resourceId: string;
  data: { name: string; published: number; scheduled: number }[];
  publishedLabel: string;
  scheduledLabel: string;
  showSecondary?: boolean;
}) {
  const publishedGradientId = `itm-trend-${resourceId}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4 px-0.5">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#5C6470]">
          <span className="h-1.5 w-3 rounded-full bg-[#1D141F]" />
          {publishedLabel}
        </span>
        {showSecondary && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#5C6470]">
            <span className="h-0.5 w-3 rounded-full bg-[#E2F343]" />
            {scheduledLabel}
          </span>
        )}
      </div>
      <div className="h-[236px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 6, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id={publishedGradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1D141F" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#1D141F" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#8B939E' }}
              dy={6}
            />
            <YAxis
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#8B939E' }}
              width={28}
              dx={-2}
            />
            <ChartTooltip
              content={<TrendTooltip />}
              cursor={{ stroke: '#E8ECEF', strokeWidth: 1 }}
            />
            <Area
              type="linear"
              dataKey="published"
              stroke="#1D141F"
              fill={`url(#${publishedGradientId})`}
              strokeWidth={2}
              name={publishedLabel}
              isAnimationActive={false}
              activeDot={{ r: 4, fill: '#1D141F', stroke: '#E2F343', strokeWidth: 2 }}
            />
            {showSecondary && (
              <Area
                type="linear"
                dataKey="scheduled"
                stroke="#E2F343"
                fill="transparent"
                strokeWidth={1.75}
                name={scheduledLabel}
                isAnimationActive={false}
                activeDot={{ r: 3.5, fill: '#E2F343', stroke: '#1D141F', strokeWidth: 1.5 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Chart card wired to GET /api/dashboard/trends, with local volume fallback. */
export function ConnectedResourceTrend({
  resource,
  weeksCount,
  rangeFrom,
  rangeTo,
  fallbackData,
  subtitle,
  chartId,
}: {
  resource: TrendResource;
  weeksCount?: number;
  rangeFrom?: Date;
  rangeTo?: Date;
  fallbackData: { name: string; published: number; scheduled: number }[];
  subtitle: string;
  chartId: string;
}) {
  const { t, locale } = useTranslation();
  const tenantId = useAppStore((s) => s.activeTenantId);
  const [mode, setMode] = useState<TrendMode>('volume');
  const { data, isError, isFetching } = useAnalyticsTrend({
    tenantId,
    resource,
    mode,
    weeks: weeksCount,
    from: rangeFrom?.toISOString(),
    to: rangeTo?.toISOString(),
    locale: locale === 'en' ? 'en' : 'fr',
  });

  const { chartData, primaryLabel, secondaryLabel, showSecondary, showUnavailable } = useMemo(() => {
    const keyLabels = t.statistics.trendKeys as Record<string, string>;

    if (data?.available) {
      return {
        chartData: data.series.map((point) => ({
          name: point.name,
          published: point.primary,
          scheduled: point.secondary,
        })),
        primaryLabel: trendKeyLabel(data.keys.primary, keyLabels),
        secondaryLabel: trendKeyLabel(data.keys.secondary, keyLabels),
        showSecondary: data.keys.secondary !== 'none',
        showUnavailable: false,
      };
    }

    if (mode === 'volume') {
      return {
        chartData: fallbackData,
        primaryLabel: t.statistics.published,
        secondaryLabel: t.statistics.scheduled,
        showSecondary: true,
        showUnavailable: false,
      };
    }

    return {
      chartData: fallbackData.map((point) => ({
        name: point.name,
        published: 0,
        scheduled: 0,
      })),
      primaryLabel: t.statistics.published,
      secondaryLabel: t.statistics.scheduled,
      showSecondary: false,
      showUnavailable: !isFetching || isError || data?.available === false,
    };
  }, [data, fallbackData, isError, isFetching, mode, t.statistics]);

  return (
    <ChartCard
      subtitle={subtitle}
      trailing={<TrendModeSwitch value={mode} onChange={setMode} />}
    >
      {showUnavailable ? (
        <p className="py-16 text-center text-[11px] text-[#8B939E]">
          {t.statistics.trendUnavailable}
        </p>
      ) : (
        <ResourceTrendChart
          resourceId={`${chartId}-${mode}`}
          data={chartData}
          publishedLabel={primaryLabel}
          scheduledLabel={secondaryLabel}
          showSecondary={showSecondary}
        />
      )}
    </ChartCard>
  );
}

// ─── Per-type metrics builders ────────────────────────────────────────────

function formatKpiNumber(value: number): string {
  return value.toLocaleString('fr-FR');
}

function formatKpiMin(value: number | null): string {
  if (value === null || value === 0) return '—';
  return `${value} min`;
}

function buildNewsletterMetrics(kpis: NewsletterKpis, t: any): AnalyticsSectionMetric[] {
  return [
    { label: t.statistics.openRate, value: formatKpiPercent(kpis.openRate), tone: 'amber' },
    { label: t.statistics.clickRate, value: formatKpiPercent(kpis.clickRate), tone: 'pink' },
    { label: t.statistics.bounceRate, value: formatKpiPercent(kpis.bounceRate), tone: 'cyan' },
    { label: t.statistics.totalRecipients, value: formatKpiNumber(kpis.recipientCount), tone: 'purple' },
  ];
}

function buildArticleMetrics(kpis: ArticleKpis, t: any): AnalyticsSectionMetric[] {
  return [
    { label: t.statistics.totalViews, value: formatKpiNumber(kpis.totalViews), tone: 'amber' },
    { label: t.statistics.readingTime, value: formatKpiMin(kpis.avgReadingTime), tone: 'pink' },
    { label: t.statistics.interactionRate, value: formatKpiPercent(kpis.interactionRate), tone: 'cyan' },
    { label: t.statistics.clickRate, value: formatKpiPercent(kpis.clickRate), tone: 'purple' },
  ];
}

function buildAnnouncementMetrics(kpis: AnnouncementKpis, t: any): AnalyticsSectionMetric[] {
  return [
    { label: t.statistics.acknowledgmentRate, value: formatKpiPercent(kpis.acknowledgmentRate), tone: 'amber' },
    { label: t.statistics.totalRecipients, value: formatKpiNumber(kpis.totalRecipients), tone: 'pink' },
    { label: t.statistics.acknowledgedCount, value: formatKpiNumber(kpis.acknowledgedCount), tone: 'cyan' },
    { label: t.statistics.clickRate, value: formatKpiPercent(kpis.clickRate), tone: 'purple' },
  ];
}

function buildCampaignMetrics(kpis: CampaignKpis, t: any): AnalyticsSectionMetric[] {
  return [
    { label: t.statistics.activeCount, value: kpis.activeCount, tone: 'amber' },
    { label: t.statistics.completedCount, value: kpis.completedCount, tone: 'pink' },
    { label: t.statistics.totalReach, value: formatKpiNumber(kpis.totalReach), tone: 'cyan' },
    { label: t.statistics.openRate, value: formatKpiPercent(kpis.avgOpenRate), tone: 'purple' },
    { label: t.statistics.clickRate, value: formatKpiPercent(kpis.avgClickRate), tone: 'amber' },
  ];
}

// ─── Individual panel (used standalone) ──────────────────────────────────

function useResourceAnalytics(resourceId: ResourceAnalyticsId, weeksCount = 12) {
  const { t } = useTranslation();
  const { campaigns, newsletters, articles, announcements } = useAnalyticsSourceData();

  const resource = useMemo(() => {
    const base = {
      newsletters: {
        id: 'newsletters',
        title: t.nav.newsletters,
        kpis: computeNewsletterKpis(newsletters),
        trendItems: newsletters as TrendItem[],
      },
      articles: {
        id: 'articles',
        title: t.nav.articles,
        kpis: computeArticleKpis(articles),
        trendItems: articles as TrendItem[],
      },
      announcements: {
        id: 'announcements',
        title: t.nav.announcements,
        kpis: computeAnnouncementKpis(announcements),
        trendItems: announcements as TrendItem[],
      },
      campaigns: {
        id: 'campaigns',
        title: t.nav.campaigns,
        kpis: computeCampaignKpis(campaigns),
        trendItems: campaigns.map((c) => ({
          publishedAt: c.createdAt,
          scheduledAt: c.startDate,
          status: c.status === 'active' || c.status === 'completed' ? 'published' : c.status,
        })),
      },
    };
    return base[resourceId];
  }, [campaigns, newsletters, articles, announcements, resourceId, t.nav]);

  const trendData = useMemo(
    () => generateResourceTrend(weeksCount, resource.trendItems),
    [weeksCount, resource.trendItems]
  );

  const metrics: AnalyticsSectionMetric[] = useMemo(() => {
    const kpis = resource.kpis;
    switch (kpis.type) {
      case 'newsletter':
        return buildNewsletterMetrics(kpis, t);
      case 'article':
        return buildArticleMetrics(kpis, t);
      case 'announcement':
        return buildAnnouncementMetrics(kpis, t);
      case 'campaign':
        return buildCampaignMetrics(kpis, t);
    }
  }, [resource.kpis, t]);

  return { resource, trendData, metrics };
}

function weeksFromRange(from?: Date, to?: Date, fallback = 12): number {
  if (!from || !to) return fallback;
  const days =
    Math.floor((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  return Math.max(1, Math.min(52, Math.ceil(days / 7)));
}

export function ResourceAnalyticsPanel({
  resourceId,
  weeksCount,
  rangeFrom,
  rangeTo,
  className,
}: {
  resourceId: ResourceAnalyticsId;
  weeksCount?: number;
  rangeFrom?: Date;
  rangeTo?: Date;
  className?: string;
}) {
  const { t } = useTranslation();
  const resolvedWeeks = weeksCount ?? weeksFromRange(rangeFrom, rangeTo);
  const { resource, trendData, metrics } = useResourceAnalytics(resourceId, resolvedWeeks);

  return (
    <div className={className}>
      <AnalyticsSection title={resource.title} metrics={metrics}>
        <ConnectedResourceTrend
          resource={resource.id}
          weeksCount={resolvedWeeks}
          rangeFrom={rangeFrom}
          rangeTo={rangeTo}
          fallbackData={trendData}
          subtitle={t.statistics.resourceTrend}
          chartId={resource.id}
        />
      </AnalyticsSection>
    </div>
  );
}

// ─── Trend item type ─────────────────────────────────────────────────────

type TrendItem = {
  publishedAt?: string | null;
  scheduledAt?: string | null;
  status?: string;
};

// ─── All panels (dashboard) ──────────────────────────────────────────────

export function useAllResourceAnalytics(weeksCount = 12) {
  const { t } = useTranslation();
  const { campaigns, newsletters, articles, announcements } = useAnalyticsSourceData();

  const resources = useMemo(() => {
    return [
      {
        id: 'newsletters' as const,
        title: t.nav.newsletters,
        kpis: computeNewsletterKpis(newsletters),
        trendItems: newsletters as TrendItem[],
      },
      {
        id: 'articles' as const,
        title: t.nav.articles,
        kpis: computeArticleKpis(articles),
        trendItems: articles as TrendItem[],
      },
      {
        id: 'announcements' as const,
        title: t.nav.announcements,
        kpis: computeAnnouncementKpis(announcements),
        trendItems: announcements as TrendItem[],
      },
      {
        id: 'campaigns' as const,
        title: t.nav.campaigns,
        kpis: computeCampaignKpis(campaigns),
        trendItems: campaigns.map((c) => ({
          publishedAt: c.createdAt,
          scheduledAt: c.startDate,
          status: c.status === 'active' || c.status === 'completed' ? 'published' : c.status,
        })),
      },
    ];
  }, [campaigns, newsletters, articles, announcements, t.nav]);

  const resourceTrends = useMemo(
    () =>
      Object.fromEntries(
        resources.map((resource) => [
          resource.id,
          generateResourceTrend(weeksCount, resource.trendItems),
        ])
      ),
    [resources, weeksCount]
  );

  return { resources, resourceTrends };
}

export function AllResourceAnalyticsPanels({
  weeksCount,
  rangeFrom,
  rangeTo,
  className,
}: {
  weeksCount?: number;
  rangeFrom?: Date;
  rangeTo?: Date;
  className?: string;
}) {
  const { t } = useTranslation();
  const resolvedWeeks = weeksCount ?? weeksFromRange(rangeFrom, rangeTo);
  const { resources, resourceTrends } = useAllResourceAnalytics(resolvedWeeks);

  return (
    <div className={cn('space-y-8', className)}>
      {resources.map((resource) => {
        let metrics: AnalyticsSectionMetric[];

        switch (resource.kpis.type) {
          case 'newsletter':
            metrics = buildNewsletterMetrics(resource.kpis, t);
            break;
          case 'article':
            metrics = buildArticleMetrics(resource.kpis, t);
            break;
          case 'announcement':
            metrics = buildAnnouncementMetrics(resource.kpis, t);
            break;
          case 'campaign':
            metrics = buildCampaignMetrics(resource.kpis, t);
            break;
        }

        return (
          <AnalyticsSection key={resource.id} title={resource.title} metrics={metrics}>
            <ConnectedResourceTrend
              resource={resource.id}
              weeksCount={resolvedWeeks}
              rangeFrom={rangeFrom}
              rangeTo={rangeTo}
              fallbackData={resourceTrends[resource.id]}
              subtitle={t.statistics.resourceTrend}
              chartId={resource.id}
            />
          </AnalyticsSection>
        );
      })}
    </div>
  );
}
