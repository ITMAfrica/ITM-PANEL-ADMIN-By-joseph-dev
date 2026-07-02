'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileText,
  TrendingUp,
  Clock,
  Users,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  ChevronRight,
  Sparkles,
  FileSpreadsheet,
  FileJson,
  Clipboard,
  Check,
  Mail,
  Megaphone,
  BookOpen,
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
  ViewShell,
  ViewSubNav,
  ViewTabPanel,
  ViewToolbar,
  BrandPrimaryButton,
  ViewStatGrid,
  ViewStatCard,
} from '@/components/view-layout';
import { motion } from 'framer-motion';
import type { Newsletter, Article, Announcement } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
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

// ─── Animation ───────────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const COLORS = ['oklch(0.55 0.18 250)', 'oklch(0.65 0.15 250)', 'oklch(0.55 0.2 25)', 'oklch(0.6 0.15 300)', 'oklch(0.50 0.12 170)'];

// ─── Campaign Health Colors ──────────────────────────────────────────────────
const campaignHealthColors: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-blue-500/10', text: 'text-blue-700', dot: 'bg-blue-500' },
  draft: { bg: 'bg-slate-500/10', text: 'text-slate-600', dot: 'bg-slate-400' },
  paused: { bg: 'bg-amber-500/10', text: 'text-amber-700', dot: 'bg-amber-500' },
  completed: { bg: 'bg-blue-500/10', text: 'text-blue-600', dot: 'bg-blue-400' },
};

// ─── Export Type ─────────────────────────────────────────────────────────────
type ExportType = 'content' | 'campaigns' | 'engagement';

// ─── Main Component ──────────────────────────────────────────────────────────
export function ReportsView() {
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

  // ─── Chart Data ───────────────────────────────────────────────────────
  const contentTrendData = useMemo(() => [
    { name: 'S18', publiés: 4, créés: 6 },
    { name: 'S19', publiés: 6, créés: 5 },
    { name: 'S20', publiés: 3, créés: 7 },
    { name: 'S21', publiés: 8, créés: 4 },
    { name: 'S22', publiés: 5, créés: 6 },
    { name: 'S23', publiés: 7, créés: 3 },
    { name: 'S24', publiés: 9, créés: 5 },
  ], []);

  const contentByTypeData = useMemo(() => [
    { name: 'Newsletters', value: tenantContent.newsletters.length },
    { name: 'Articles', value: tenantContent.articles.length },
    { name: 'Annonces', value: tenantContent.announcements.length },
    { name: 'Campagnes', value: tenantContent.campaigns.length },
  ], [tenantContent]);

  const teamWorkloadData = useMemo(() => {
    return tenantUsers.map(user => ({
      name: user.name.split(' ')[0],
      contenus: user.contentCount,
      publiés: Math.floor(user.contentCount * 0.6),
    }));
  }, [tenantUsers]);

  // ─── Export Handlers ───────────────────────────────────────────────────
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
      case 'engagement':
        return [
          { Type: 'Newsletter', 'Taux ouverture': tenantContent.newsletters.filter(n => n.openRate > 0).reduce((s, n) => s + n.openRate, 0) / Math.max(tenantContent.newsletters.filter(n => n.openRate > 0).length, 1), 'Taux clic': tenantContent.newsletters.filter(n => n.clickRate > 0).reduce((s, n) => s + n.clickRate, 0) / Math.max(tenantContent.newsletters.filter(n => n.clickRate > 0).length, 1) },
          { Type: 'Article', 'Taux clic': tenantContent.articles.filter(a => (a.clickRate ?? 0) > 0).reduce((s, a) => s + (a.clickRate ?? 0), 0) / Math.max(tenantContent.articles.filter(a => (a.clickRate ?? 0) > 0).length, 1), 'Vues moyennes': tenantContent.articles.reduce((s, a) => s + a.viewCount, 0) / Math.max(tenantContent.articles.length, 1) },
        ];
    }
  }, [tenantContent]);

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
  }, [getExportData]);

  const stats = [
    {
      title: t.reports.totalContent,
      value: totalContent,
      icon: FileText,
      accentVariant: 'blue' as const,
    },
    {
      title: t.reports.completionRate,
      value: `${publicationRate}%`,
      isPercent: true,
      icon: TrendingUp,
      accentVariant: 'amber' as const,
    },
    {
      title: t.reports.avgReadTime,
      value: `${avgReadTime} min`,
      isString: true,
      icon: Clock,
      accentVariant: 'blue' as const,
    },
    {
      title: t.reports.activeContributors,
      value: activeContributors,
      icon: Users,
      accentVariant: 'rose' as const,
    },
  ];

  const tooltipStyle = {
    backgroundColor: 'var(--popover)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    fontSize: '12px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
    padding: '10px 14px',
  };

  return (
    <ViewShell>
      <ViewSubNav
        tabs={[{ id: 'reports' as const, label: t.reports.title, icon: <FileText className="h-3.5 w-3.5" /> }]}
        activeTab="reports"
        onTabChange={() => {}}
      />
      <ViewTabPanel>
        <ViewStatGrid cols={4}>
          {stats.map((stat) => {
            const IconComp = stat.icon;
            return (
              <ViewStatCard
                key={stat.title}
                label={stat.title}
                value={stat.value}
                icon={IconComp}
                accentVariant={stat.accentVariant}
              />
            );
          })}
        </ViewStatGrid>

        <ViewToolbar
          actions={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <BrandPrimaryButton>
                  <Download className="h-4 w-4" /> {t.reports.exportReport}
                </BrandPrimaryButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
            {/* Content Export */}
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

            {/* Campaigns Export */}
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

            {/* Engagement Export */}
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
          }
        />

      {/* ─── Charts Row 1 ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Content Trend Chart */}
        <motion.div variants={item}>
          <Card className="overflow-hidden dark-card-glow border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[oklch(0.55_0.18_250/0.1)] border border-[oklch(0.55_0.18_250/0.15)]">
                    <Activity className="h-4 w-4 text-[oklch(0.55_0.18_250)]" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">{t.reports.contentTrend}</CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Contenus publiés vs créés</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 hover:bg-[oklch(0.55_0.18_250/0.05)]">
                  Détails <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={contentTrendData}>
                    <defs>
                      <linearGradient id="reportPublishedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.55 0.18 250)" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="oklch(0.55 0.18 250)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="reportCreatedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.65 0.15 250)" stopOpacity={0.1} />
                        <stop offset="100%" stopColor="oklch(0.65 0.15 250)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" dy={8} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" dx={-4} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)', radius: 4 }} />
                    <Area type="monotone" dataKey="publiés" stroke="oklch(0.55 0.18 250)" fill="url(#reportPublishedGrad)" strokeWidth={2.5} name="Publiés" />
                    <Area type="monotone" dataKey="créés" stroke="oklch(0.65 0.15 80 / 0.7)" fill="url(#reportCreatedGrad)" strokeWidth={2} strokeDasharray="5 5" name="Créés" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content by Type Pie Chart */}
        <motion.div variants={item}>
          <Card className="overflow-hidden dark-card-glow border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/15">
                    <PieChartIcon className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">{t.reports.contentByType}</CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Répartition des contenus par type</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
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
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend
                      fontSize={12}
                      formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Team Workload ───────────────────────────────────────────────── */}
      <motion.div variants={item}>
        <Card className="overflow-hidden dark-card-glow border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/15">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">{t.reports.teamWorkload}</CardTitle>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Contenus par contributeur de l&apos;entité</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamWorkloadData} layout="vertical" barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" />
                  <YAxis type="category" dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" width={80} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)', radius: 4 }} />
                  <Bar dataKey="contenus" fill="oklch(0.55 0.18 250)" radius={[0, 6, 6, 0]} maxBarSize={20} name={t.reports.active} />
                  <Bar dataKey="publiés" fill="oklch(0.55 0.18 250 / 0.3)" radius={[0, 6, 6, 0]} maxBarSize={20} name={t.reports.completed} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Campaign Health Overview ─────────────────────────────────────── */}
      <motion.div variants={item}>
        <Card className="overflow-hidden dark-card-glow border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[oklch(0.55_0.18_250/0.1)] border border-[oklch(0.55_0.18_250/0.15)]">
                  <Target className="h-4 w-4 text-[oklch(0.55_0.18_250)]" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">{t.reports.campaignHealth}</CardTitle>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Progression et statut des campagnes</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 hover:bg-[oklch(0.55_0.18_250/0.05)]">
                Voir tout <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tenantContent.campaigns.map((campaign, idx) => {
                const health = campaignHealthColors[campaign.status] || campaignHealthColors.active;
                const progress = campaign.contentCount > 0 ? Math.round((campaign.publishedCount / campaign.contentCount) * 100) : 0;
                const statusLabel = contentStatusLabels.fr[campaign.status] || campaign.status;
                return (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    className="group flex items-center gap-4 p-3 rounded-xl hover:bg-muted/30 transition-all duration-200 cursor-pointer"
                  >
                    {/* Campaign Icon */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0 border border-white/10 shadow-sm"
                      style={{ backgroundColor: campaign.color + '20', color: campaign.color }}
                    >
                      <Target className="h-4 w-4" />
                    </div>

                    {/* Progress */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">{campaign.name}</span>
                        <span className="text-xs font-semibold text-muted-foreground">{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted/60 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${campaign.color}, ${campaign.color}cc)`,
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, delay: 0.2 + idx * 0.1, ease: 'easeOut' as const }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>{campaign.contentCount} contenus</span>
                      <span>{campaign.publishedCount} publiés</span>
                      <span>{campaign.totalReach.toLocaleString('fr-FR')} portée</span>
                    </div>

                    {/* Status Badge */}
                    <Badge
                      className={cn('text-[10px] px-2.5 py-0.5 gap-1 font-medium flex-shrink-0 border-0', health.bg, health.text)}
                    >
                      <div className={cn('w-1.5 h-1.5 rounded-full', health.dot)} />
                      {statusLabel}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </ViewTabPanel>
    </ViewShell>
  );
}
