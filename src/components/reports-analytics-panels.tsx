'use client';

import { useCallback, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Download,
  FileSpreadsheet,
  FileJson,
  Clipboard,
  Check,
} from 'lucide-react';
import { contentStatusLabels } from '@/lib/ui-constants';
import { useContent } from '@/hooks/use-content';
import { useCampaigns } from '@/hooks/use-campaigns';
import { useUsers } from '@/hooks/use-users';
import { useUserLookup } from '@/hooks/use-user-lookup';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  AnalyticsSection,
  ChartCard,
  ConnectedResourceTrend,
} from '@/components/resource-analytics';
import { generateResourceTrend } from '@/lib/analytics-resources';
import type { Newsletter, Article, Announcement } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  exportToCSV,
  exportToJSON,
  copyToClipboard,
} from '@/lib/export-utils';

const COLORS = ['oklch(0.55 0.18 250)', 'oklch(0.65 0.15 250)', 'oklch(0.55 0.2 25)', 'oklch(0.6 0.15 300)', 'oklch(0.50 0.12 170)'];

const KPI_TONES = ['amber', 'pink', 'cyan', 'purple'] as const;

const campaignHealthColors: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-blue-500/10', text: 'text-blue-700', dot: 'bg-blue-500' },
  draft: { bg: 'bg-slate-500/10', text: 'text-slate-600', dot: 'bg-slate-400' },
  paused: { bg: 'bg-amber-500/10', text: 'text-amber-700', dot: 'bg-amber-500' },
  completed: { bg: 'bg-blue-500/10', text: 'text-blue-600', dot: 'bg-blue-400' },
};

const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  fontSize: '12px',
  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
  padding: '10px 14px',
};

type ExportType = 'content' | 'campaigns' | 'engagement';

function weeksFromRange(from?: Date, to?: Date, fallback = 12): number {
  if (!from || !to) return fallback;
  const days =
    Math.floor((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  return Math.max(1, Math.min(52, Math.ceil(days / 7)));
}

export function ReportsAnalyticsPanels({
  weeksCount,
  rangeFrom,
  rangeTo,
}: {
  weeksCount?: number;
  rangeFrom?: Date;
  rangeTo?: Date;
}) {
  const resolvedWeeks = weeksCount ?? weeksFromRange(rangeFrom, rangeTo);
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const [copiedType, setCopiedType] = useState<ExportType | null>(null);
  const { data: allContent = [] } = useContent({ tenantId: activeTenantId });
  const { data: campaigns = [] } = useCampaigns(activeTenantId);
  const { data: tenantUsers = [] } = useUsers(activeTenantId);
  const { getUserName } = useUserLookup(activeTenantId);

  const tenantContent = useMemo(() => ({
    newsletters: allContent.filter((c) => c.type === 'newsletter') as Newsletter[],
    articles: allContent.filter((c) => c.type === 'article') as Article[],
    announcements: allContent.filter((c) => c.type === 'announcement') as Announcement[],
    campaigns,
  }), [allContent, campaigns]);

  const totalContent = useMemo(() => {
    return tenantContent.newsletters.length + tenantContent.articles.length + tenantContent.announcements.length;
  }, [tenantContent]);

  const publishedContent = useMemo(() => {
    const all = [
      ...tenantContent.newsletters,
      ...tenantContent.articles,
      ...tenantContent.announcements,
    ];
    return all.filter(c => c.status === 'published').length;
  }, [tenantContent]);

  const publicationRate = totalContent > 0 ? Math.round((publishedContent / totalContent) * 100) : 0;

  const avgReadTime = useMemo(() => {
    const articles = tenantContent.articles.filter(a => a.readingTime > 0);
    if (articles.length === 0) return 0;
    return Math.round(articles.reduce((sum, a) => sum + a.readingTime, 0) / articles.length);
  }, [tenantContent]);

  const activeContributors = useMemo(() => {
    const authorIds = new Set([
      ...tenantContent.newsletters.map(n => n.authorId),
      ...tenantContent.articles.map(a => a.authorId),
      ...tenantContent.announcements.map(a => a.authorId),
    ]);
    return authorIds.size;
  }, [tenantContent]);

  const publishedItems = useMemo(() => {
    return [
      ...tenantContent.newsletters,
      ...tenantContent.articles,
      ...tenantContent.announcements,
    ].filter((c) => c.status === 'published');
  }, [tenantContent]);

  const contentTrendData = useMemo(
    () => generateResourceTrend(resolvedWeeks, publishedItems),
    [resolvedWeeks, publishedItems]
  );

  const contentByTypeData = useMemo(() => [
    { name: 'Newsletters', value: tenantContent.newsletters.length },
    { name: 'Articles', value: tenantContent.articles.length },
    { name: 'Annonces', value: tenantContent.announcements.length },
    { name: 'Campagnes', value: tenantContent.campaigns.length },
  ], [tenantContent]);

  const teamWorkloadData = useMemo(() => {
    const allItems = [
      ...tenantContent.newsletters,
      ...tenantContent.articles,
      ...tenantContent.announcements,
    ];
    return tenantUsers.map((user) => {
      const userItems = allItems.filter((c) => c.authorId === user.id);
      return {
        name: user.name.split(' ')[0],
        contenus: userItems.length > 0 ? userItems.length : user.contentCount,
        publiés: userItems.filter((c) => c.status === 'published').length,
      };
    });
  }, [tenantUsers, tenantContent]);

  const getExportData = useCallback((type: ExportType): Record<string, unknown>[] => {
    switch (type) {
      case 'content':
        return [
          ...tenantContent.newsletters.map(n => ({ Titre: n.title, Type: 'Newsletter', Statut: n.status, Auteur: getUserName(n.authorId), 'Date création': n.createdAt })),
          ...tenantContent.articles.map(a => ({ Titre: a.title, Type: 'Article', Statut: a.status, Auteur: getUserName(a.authorId), 'Date création': a.createdAt })),
          ...tenantContent.announcements.map(a => ({ Titre: a.title, Type: 'Annonce', Statut: a.status, Auteur: getUserName(a.authorId), 'Date création': a.createdAt })),
        ];
      case 'campaigns':
        return tenantContent.campaigns.map(c => ({
          Nom: c.name,
          Statut: c.status,
          'Contenus': c.contentCount,
          'Publiés': c.publishedCount,
          'Portée': c.totalReach,
          'Taux ouverture': `${c.avgOpenRate}%`,
          'Taux clic': `${c.avgClickRate}%`,
        }));
      case 'engagement': {
        const publishedNewsletters = tenantContent.newsletters.filter((n) => n.status === 'published');
        const publishedArticles = tenantContent.articles.filter((a) => a.status === 'published');
        const nlOpen = publishedNewsletters.filter((n) => n.openRate > 0);
        const nlClick = publishedNewsletters.filter((n) => n.clickRate > 0);
        const artClick = publishedArticles.filter((a) => (a.clickRate ?? 0) > 0);
        return [
          {
            Type: 'Newsletter',
            'Taux ouverture':
              nlOpen.length > 0
                ? nlOpen.reduce((s, n) => s + n.openRate, 0) / nlOpen.length
                : 0,
            'Taux clic':
              nlClick.length > 0
                ? nlClick.reduce((s, n) => s + n.clickRate, 0) / nlClick.length
                : 0,
          },
          {
            Type: 'Article',
            'Taux clic':
              artClick.length > 0
                ? artClick.reduce((s, a) => s + (a.clickRate ?? 0), 0) / artClick.length
                : 0,
            'Vues moyennes':
              publishedArticles.length > 0
                ? publishedArticles.reduce((s, a) => s + a.viewCount, 0) / publishedArticles.length
                : 0,
          },
        ];
      }
    }
  }, [tenantContent, getUserName]);

  const handleExportCSV = useCallback((type: ExportType) => {
    const data = getExportData(type);
    exportToCSV(data, `contentflow-${type}-${new Date().toISOString().split('T')[0]}`);
  }, [getExportData]);

  const handleExportJSON = useCallback((type: ExportType) => {
    const data = getExportData(type);
    exportToJSON(data, `contentflow-${type}-${new Date().toISOString().split('T')[0]}`);
  }, [getExportData]);

  const handleCopyToClipboard = useCallback(async (type: ExportType) => {
    const data = getExportData(type);
    const success = await copyToClipboard(data, 'csv');
    if (success) {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    }
  }, [getExportData, setCopiedType]);

  const overviewMetrics = [
    { label: t.reports.totalContent, value: totalContent, tone: KPI_TONES[0] },
    { label: t.reports.completionRate, value: `${publicationRate}%`, tone: KPI_TONES[1] },
    { label: t.reports.avgReadTime, value: `${avgReadTime} min`, tone: KPI_TONES[2] },
    { label: t.reports.activeContributors, value: activeContributors, tone: KPI_TONES[3] },
  ];

  const typeMetrics = contentByTypeData.map((item, index) => ({
    label: item.name,
    value: item.value,
    tone: KPI_TONES[index % KPI_TONES.length],
  }));

  const totalTeamContent = tenantUsers.reduce((sum, u) => sum + u.contentCount, 0);
  const avgTeamContent = tenantUsers.length > 0 ? Math.round(totalTeamContent / tenantUsers.length) : 0;
  const topContributor = tenantUsers.reduce((max, u) => (u.contentCount > max ? u.contentCount : max), 0);

  const teamMetrics = [
    { label: t.reports.activeContributors, value: tenantUsers.length, tone: KPI_TONES[0] },
    { label: t.reports.totalContent, value: totalTeamContent, tone: KPI_TONES[1] },
    { label: t.reports.avgReadTime, value: avgTeamContent, tone: KPI_TONES[2] },
    { label: t.reports.active, value: topContributor, tone: KPI_TONES[3] },
  ];

  const activeCampaigns = tenantContent.campaigns.filter(c => c.status === 'active').length;
  const completedCampaigns = tenantContent.campaigns.filter(c => c.status === 'completed').length;
  const draftCampaigns = tenantContent.campaigns.filter(c => c.status === 'draft').length;
  const avgCampaignProgress = tenantContent.campaigns.length > 0
    ? Math.round(
        tenantContent.campaigns.reduce((sum, c) => {
          const progress = c.contentCount > 0 ? (c.publishedCount / c.contentCount) * 100 : 0;
          return sum + progress;
        }, 0) / tenantContent.campaigns.length
      )
    : 0;

  const campaignMetrics = [
    { label: t.reports.active, value: activeCampaigns, tone: KPI_TONES[0] },
    { label: t.reports.completed, value: completedCampaigns, tone: KPI_TONES[1] },
    { label: 'Brouillons', value: draftCampaigns, tone: KPI_TONES[2] },
    { label: t.reports.completionRate, value: `${avgCampaignProgress}%`, tone: KPI_TONES[3] },
  ];

  const exportMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <span className="inline-flex items-center gap-2 rounded-full bg-[oklch(0.55_0.18_250)] px-4 h-10 text-sm font-semibold text-white hover:opacity-90 cursor-pointer">
          <Download className="h-4 w-4" /> {t.reports.exportReport}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          {t.reports.exportContent}
        </div>
        <DropdownMenuItem onClick={() => handleExportCSV('content')} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 text-blue-600" />
          <span>{t.reports.exportAsCSV}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExportJSON('content')} className="gap-2 cursor-pointer">
          <FileJson className="h-4 w-4 text-amber-600" />
          <span>{t.reports.exportAsJSON}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCopyToClipboard('content')} className="gap-2 cursor-pointer">
          {copiedType === 'content' ? (
            <Check className="h-4 w-4 text-blue-600" />
          ) : (
            <Clipboard className="h-4 w-4 text-muted-foreground" />
          )}
          <span>{copiedType === 'content' ? t.reports.copied : t.reports.copyToClipboard}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          {t.reports.exportCampaigns}
        </div>
        <DropdownMenuItem onClick={() => handleExportCSV('campaigns')} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 text-blue-600" />
          <span>{t.reports.exportAsCSV}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExportJSON('campaigns')} className="gap-2 cursor-pointer">
          <FileJson className="h-4 w-4 text-amber-600" />
          <span>{t.reports.exportAsJSON}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCopyToClipboard('campaigns')} className="gap-2 cursor-pointer">
          {copiedType === 'campaigns' ? (
            <Check className="h-4 w-4 text-blue-600" />
          ) : (
            <Clipboard className="h-4 w-4 text-muted-foreground" />
          )}
          <span>{copiedType === 'campaigns' ? t.reports.copied : t.reports.copyToClipboard}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          {t.reports.exportEngagement}
        </div>
        <DropdownMenuItem onClick={() => handleExportCSV('engagement')} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 text-blue-600" />
          <span>{t.reports.exportAsCSV}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExportJSON('engagement')} className="gap-2 cursor-pointer">
          <FileJson className="h-4 w-4 text-amber-600" />
          <span>{t.reports.exportAsJSON}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCopyToClipboard('engagement')} className="gap-2 cursor-pointer">
          {copiedType === 'engagement' ? (
            <Check className="h-4 w-4 text-blue-600" />
          ) : (
            <Clipboard className="h-4 w-4 text-muted-foreground" />
          )}
          <span>{copiedType === 'engagement' ? t.reports.copied : t.reports.copyToClipboard}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-8">
      <AnalyticsSection title={t.reports.title} metrics={overviewMetrics}>
        <div className="flex justify-end -mt-10 mb-2">{exportMenu}</div>
        <ConnectedResourceTrend
          resource="all"
          weeksCount={resolvedWeeks}
          rangeFrom={rangeFrom}
          rangeTo={rangeTo}
          fallbackData={contentTrendData}
          subtitle={t.reports.contentTrend}
          chartId="reports-overview"
        />
      </AnalyticsSection>

      <AnalyticsSection title={t.reports.contentByType} metrics={typeMetrics}>
        <ChartCard subtitle={t.statistics.contentByType}>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contentByTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {contentByTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend
                  fontSize={12}
                  formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </AnalyticsSection>

      <AnalyticsSection title={t.reports.teamWorkload} metrics={teamMetrics}>
        <ChartCard subtitle={t.reports.teamWorkload}>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamWorkloadData} layout="vertical" barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" />
                <YAxis type="category" dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" width={80} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'var(--muted)', radius: 4 }} />
                <Bar dataKey="contenus" fill="oklch(0.55 0.18 250)" radius={[0, 6, 6, 0]} maxBarSize={20} name={t.reports.active} />
                <Bar dataKey="publiés" fill="oklch(0.55 0.18 250 / 0.3)" radius={[0, 6, 6, 0]} maxBarSize={20} name={t.reports.completed} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </AnalyticsSection>

      <AnalyticsSection title={t.reports.campaignHealth} metrics={campaignMetrics}>
        <ChartCard subtitle={t.reports.campaignHealth}>
          <div className="space-y-4">
            {tenantContent.campaigns.map((campaign) => {
              const health = campaignHealthColors[campaign.status] || campaignHealthColors.active;
              const progress = campaign.contentCount > 0 ? Math.round((campaign.publishedCount / campaign.contentCount) * 100) : 0;
              const statusLabel = contentStatusLabels.fr[campaign.status] || campaign.status;
              return (
                <div
                  key={campaign.id}
                  className="group flex items-center gap-4 p-3 rounded-xl hover:bg-muted/30 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">{campaign.name}</span>
                      <span className="text-xs font-semibold text-muted-foreground">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted/60 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          background: `linear-gradient(90deg, ${campaign.color}, ${campaign.color}cc)`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>{campaign.contentCount} contenus</span>
                    <span>{campaign.publishedCount} publiés</span>
                    <span>{campaign.totalReach.toLocaleString('fr-FR')} portée</span>
                  </div>

                  <Badge
                    className={cn('text-[10px] px-2.5 py-0.5 gap-1 font-medium flex-shrink-0 border-0', health.bg, health.text)}
                  >
                    <div className={cn('w-1.5 h-1.5 rounded-full', health.dot)} />
                    {statusLabel}
                  </Badge>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </AnalyticsSection>
    </div>
  );
}
