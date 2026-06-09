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
  ArrowUpRight,
  ArrowDownRight,
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
import {
  mockNewsletters,
  mockArticles,
  mockAnnouncements,
  mockCampaigns,
  mockUsers,
  getUserName,
  contentStatusLabels,
} from '@/lib/mock-data';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
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
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const COLORS = ['oklch(0.55 0.15 160)', 'oklch(0.65 0.15 80)', 'oklch(0.55 0.2 25)', 'oklch(0.6 0.15 300)', 'oklch(0.50 0.12 170)'];

// ─── Campaign Health Colors ──────────────────────────────────────────────────
const campaignHealthColors: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-emerald-500/10', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  draft: { bg: 'bg-slate-500/10', text: 'text-slate-600', dot: 'bg-slate-400' },
  paused: { bg: 'bg-amber-500/10', text: 'text-amber-700', dot: 'bg-amber-500' },
  completed: { bg: 'bg-teal-500/10', text: 'text-teal-600', dot: 'bg-teal-400' },
};

// ─── Export Type ─────────────────────────────────────────────────────────────
type ExportType = 'content' | 'campaigns' | 'engagement';

// ─── Main Component ──────────────────────────────────────────────────────────
export function ReportsView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const [copiedType, setCopiedType] = useState<ExportType | null>(null);

  // ─── Compute CMS Metrics ──────────────────────────────────────────────
  const tenantContent = useMemo(() => {
    const newsletters = mockNewsletters.filter(n => n.tenantId === activeTenantId);
    const articles = mockArticles.filter(a => a.tenantId === activeTenantId);
    const announcements = mockAnnouncements.filter(a => a.tenantId === activeTenantId);
    const campaigns = mockCampaigns.filter(c => c.tenantId === activeTenantId);
    return { newsletters, articles, announcements, campaigns };
  }, [activeTenantId]);

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
    const usersByTenant = mockUsers.filter(u => u.tenantId === activeTenantId);
    return usersByTenant.map(user => ({
      name: user.name.split(' ')[0],
      contenus: user.contentCount,
      publiés: Math.floor(user.contentCount * 0.6),
    }));
  }, [activeTenantId]);

  // ─── Export Handlers ───────────────────────────────────────────────────
  const getExportData = useCallback((type: ExportType) => {
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
          { Type: 'Article', 'Taux clic': tenantContent.articles.filter(a => a.clickRate > 0).reduce((s, a) => s + a.clickRate, 0) / Math.max(tenantContent.articles.filter(a => a.clickRate > 0).length, 1), 'Vues moyennes': tenantContent.articles.reduce((s, a) => s + a.viewCount, 0) / Math.max(tenantContent.articles.length, 1) },
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
      change: '+18%',
      trend: 'up' as const,
      icon: FileText,
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-600',
      borderAccent: 'border-emerald-500/20',
      glowColor: 'shadow-emerald-500/5',
    },
    {
      title: t.reports.completionRate,
      value: `${publicationRate}%`,
      isPercent: true,
      change: '+5%',
      trend: 'up' as const,
      icon: TrendingUp,
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-600',
      borderAccent: 'border-amber-500/20',
      glowColor: 'shadow-amber-500/5',
    },
    {
      title: t.reports.avgReadTime,
      value: `${avgReadTime} min`,
      isString: true,
      change: '-8%',
      trend: 'up' as const,
      icon: Clock,
      gradient: 'from-teal-500/10 via-teal-500/5 to-transparent',
      iconBg: 'bg-teal-500/15',
      iconColor: 'text-teal-600',
      borderAccent: 'border-teal-500/20',
      glowColor: 'shadow-teal-500/5',
    },
    {
      title: t.reports.activeContributors,
      value: activeContributors,
      change: '+2',
      trend: 'up' as const,
      icon: Users,
      gradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
      iconBg: 'bg-rose-500/15',
      iconColor: 'text-rose-600',
      borderAccent: 'border-rose-500/20',
      glowColor: 'shadow-rose-500/5',
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
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t.reports.title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{t.reports.subtitle}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="gap-1.5 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.50_0.15_165)] hover:from-[oklch(0.50_0.15_160)] hover:to-[oklch(0.45_0.15_165)] shadow-sm shadow-[oklch(0.55_0.15_160/0.2)] text-white"
            >
              <Download className="h-4 w-4" /> {t.reports.exportReport}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {/* Content Export */}
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              {t.reports.exportContent}
            </div>
            <DropdownMenuItem onClick={() => handleExportCSV('content')} className="gap-2 cursor-pointer">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>{t.reports.exportAsCSV}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportJSON('content')} className="gap-2 cursor-pointer">
              <FileJson className="h-4 w-4 text-amber-600" />
              <span>{t.reports.exportAsJSON}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopyToClipboard('content')} className="gap-2 cursor-pointer">
              {copiedType === 'content' ? (
                <Check className="h-4 w-4 text-emerald-600" />
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
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>{t.reports.exportAsCSV}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportJSON('campaigns')} className="gap-2 cursor-pointer">
              <FileJson className="h-4 w-4 text-amber-600" />
              <span>{t.reports.exportAsJSON}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopyToClipboard('campaigns')} className="gap-2 cursor-pointer">
              {copiedType === 'campaigns' ? (
                <Check className="h-4 w-4 text-emerald-600" />
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
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>{t.reports.exportAsCSV}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportJSON('engagement')} className="gap-2 cursor-pointer">
              <FileJson className="h-4 w-4 text-amber-600" />
              <span>{t.reports.exportAsJSON}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopyToClipboard('engagement')} className="gap-2 cursor-pointer">
              {copiedType === 'engagement' ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Clipboard className="h-4 w-4 text-muted-foreground" />
              )}
              <span>{copiedType === 'engagement' ? t.reports.copied : t.reports.copyToClipboard}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ─── Summary Stats ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const IconComp = stat.icon;
          return (
            <motion.div key={i} variants={item}>
              <motion.div
                initial="rest"
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="relative group"
              >
                <Card className={`relative overflow-hidden border ${stat.borderAccent} shadow-md ${stat.glowColor} hover:shadow-lg transition-shadow duration-300`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-current/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ color: stat.iconColor.includes('emerald') ? '#10b981' : stat.iconColor.includes('amber') ? '#f59e0b' : stat.iconColor.includes('teal') ? '#14b8a6' : '#ef4444' }} />
                  <CardContent className="relative p-5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <p className="text-3xl font-extrabold tracking-tight">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-2xl ${stat.iconBg} backdrop-blur-sm border border-white/10 shadow-sm`}>
                        <IconComp className={`h-5 w-5 ${stat.iconColor}`} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3">
                      <div className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${stat.trend === 'up' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                        {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {stat.change}
                      </div>
                      <span className="text-[11px] text-muted-foreground">{t.dashboard.vsLastPeriod}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Charts Row 1 ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Content Trend Chart */}
        <motion.div variants={item}>
          <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[oklch(0.55_0.15_160/0.1)] border border-[oklch(0.55_0.15_160/0.15)]">
                    <Activity className="h-4 w-4 text-[oklch(0.55_0.15_160)]" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">{t.reports.contentTrend}</CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Contenus publiés vs créés</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 hover:bg-[oklch(0.55_0.15_160/0.05)]">
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
                        <stop offset="0%" stopColor="oklch(0.55 0.15 160)" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="oklch(0.55 0.15 160)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="reportCreatedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.65 0.15 80)" stopOpacity={0.1} />
                        <stop offset="100%" stopColor="oklch(0.65 0.15 80)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" dy={8} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" dx={-4} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)', radius: 4 }} />
                    <Area type="monotone" dataKey="publiés" stroke="oklch(0.55 0.15 160)" fill="url(#reportPublishedGrad)" strokeWidth={2.5} name="Publiés" />
                    <Area type="monotone" dataKey="créés" stroke="oklch(0.65 0.15 80 / 0.7)" fill="url(#reportCreatedGrad)" strokeWidth={2} strokeDasharray="5 5" name="Créés" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content by Type Pie Chart */}
        <motion.div variants={item}>
          <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow duration-300">
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
        <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/15">
                  <BarChart3 className="h-4 w-4 text-teal-600" />
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
                  <Bar dataKey="contenus" fill="oklch(0.55 0.15 160)" radius={[0, 6, 6, 0]} maxBarSize={20} name={t.reports.active} />
                  <Bar dataKey="publiés" fill="oklch(0.55 0.15 160 / 0.3)" radius={[0, 6, 6, 0]} maxBarSize={20} name={t.reports.completed} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Campaign Health Overview ─────────────────────────────────────── */}
      <motion.div variants={item}>
        <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[oklch(0.55_0.15_160/0.1)] border border-[oklch(0.55_0.15_160/0.15)]">
                  <Target className="h-4 w-4 text-[oklch(0.55_0.15_160)]" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">{t.reports.campaignHealth}</CardTitle>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Progression et statut des campagnes</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 hover:bg-[oklch(0.55_0.15_160/0.05)]">
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
                          transition={{ duration: 1, delay: 0.2 + idx * 0.1, ease: 'easeOut' }}
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
    </motion.div>
  );
}
