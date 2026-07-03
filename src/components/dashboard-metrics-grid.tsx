'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ViewStatGrid, ViewStatCard } from '@/components/view-layout';
import { useDashboardSummary } from '@/hooks/use-dashboard-summary';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { formatNextSendAt } from '@/lib/dashboard-metrics';
import { motion } from 'framer-motion';

function ServiceMetricsCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden dark-card-glow border h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

export function DashboardMetricsGrid() {
  const { t, locale } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const { data: summary } = useDashboardSummary(activeTenantId);

  const m = t.dashboard.metrics;
  const nextSendLabel = formatNextSendAt(summary?.scheduling.nextSendAt ?? null, locale);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
    >
      <ServiceMetricsCard title={t.nav.newsletters}>
        <ViewStatGrid cols={2}>
          <ViewStatCard label={m.published} value={summary?.newsletters.published ?? 0} />
          <ViewStatCard label={m.drafts} value={summary?.newsletters.drafts ?? 0} />
          <ViewStatCard label={m.scheduled} value={summary?.newsletters.scheduled ?? 0} />
          <ViewStatCard label={m.inReview} value={summary?.newsletters.inReview ?? 0} />
        </ViewStatGrid>
      </ServiceMetricsCard>

      <ServiceMetricsCard title={t.nav.articles}>
        <ViewStatGrid cols={2}>
          <ViewStatCard label={m.published} value={summary?.articles.published ?? 0} />
          <ViewStatCard label={m.drafts} value={summary?.articles.drafts ?? 0} />
          <ViewStatCard label={m.scheduled} value={summary?.articles.scheduled ?? 0} />
          <ViewStatCard label={m.inReview} value={summary?.articles.inReview ?? 0} />
        </ViewStatGrid>
      </ServiceMetricsCard>

      <ServiceMetricsCard title={t.nav.announcements}>
        <ViewStatGrid cols={2}>
          <ViewStatCard label={m.published} value={summary?.announcements.published ?? 0} />
          <ViewStatCard label={m.drafts} value={summary?.announcements.drafts ?? 0} />
          <ViewStatCard label={m.scheduled} value={summary?.announcements.scheduled ?? 0} />
          <ViewStatCard label={m.inReview} value={summary?.announcements.inReview ?? 0} />
        </ViewStatGrid>
      </ServiceMetricsCard>

      <ServiceMetricsCard title={t.nav.campaigns}>
        <ViewStatGrid cols={3}>
          <ViewStatCard label={m.active} value={summary?.campaigns.active ?? 0} />
          <ViewStatCard label={m.drafts} value={summary?.campaigns.draft ?? 0} />
          <ViewStatCard
            label={m.avgPublishRate}
            value={`${summary?.campaigns.avgPublishRate ?? 0}%`}
          />
        </ViewStatGrid>
      </ServiceMetricsCard>

      <ServiceMetricsCard title={t.nav['editorial-calendar']}>
        <ViewStatGrid cols={3}>
          <ViewStatCard label={m.thisWeek} value={summary?.editorialCalendar.thisWeek ?? 0} />
          <ViewStatCard label={m.scheduled} value={summary?.editorialCalendar.scheduled ?? 0} />
          <ViewStatCard label={m.published} value={summary?.editorialCalendar.published ?? 0} />
        </ViewStatGrid>
      </ServiceMetricsCard>

      <ServiceMetricsCard title={t.nav.scheduling}>
        <ViewStatGrid cols={3}>
          <ViewStatCard label={m.queueSize} value={summary?.scheduling.queueSize ?? 0} />
          <ViewStatCard label={m.nextSend} value={nextSendLabel} />
          <ViewStatCard label={m.thisWeek} value={summary?.scheduling.thisWeek ?? 0} />
        </ViewStatGrid>
      </ServiceMetricsCard>

      <ServiceMetricsCard title={t.nav.channels}>
        <ViewStatGrid cols={3}>
          <ViewStatCard label={m.totalChannels} value={summary?.channels.total ?? 0} />
          <ViewStatCard label={m.activeChannels} value={summary?.channels.active ?? 0} />
          <ViewStatCard
            label={m.subscribers}
            value={(summary?.channels.subscribers ?? 0).toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US')}
          />
        </ViewStatGrid>
      </ServiceMetricsCard>
    </motion.div>
  );
}
