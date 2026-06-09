'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  Mail,
  Eye,
  MousePointer,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  PieChart as PieChartIcon,
  Clock,
  FileText,
  Megaphone,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  mockNewsletters,
  mockArticles,
  mockAnnouncements,
  mockCampaigns,
} from '@/lib/mock-data';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ─── Animation ───────────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ─── Chart Colors (teal/emerald only) ────────────────────────────────────────
const COLORS = [
  'oklch(0.55 0.15 160)',
  'oklch(0.65 0.15 160)',
  'oklch(0.45 0.15 160)',
  'oklch(0.55 0.12 150)',
  'oklch(0.60 0.10 170)',
];

const PIE_COLORS = [
  'oklch(0.55 0.15 160)',
  'oklch(0.60 0.12 80)',
  'oklch(0.55 0.18 25)',
  'oklch(0.50 0.15 300)',
  'oklch(0.65 0.10 200)',
];

// ─── Data Generators ─────────────────────────────────────────────────────────
function generateWeeklyData(weeks: number) {
  const data = [];
  const now = new Date();
  for (let i = weeks - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7);
    const weekLabel = `S${String(weeks - i).padStart(2, '0')}`;
    data.push({
      name: weekLabel,
      published: Math.floor(Math.random() * 8) + 3,
      scheduled: Math.floor(Math.random() * 5) + 1,
    });
  }
  return data;
}

function generateEngagementByType() {
  return [
    { name: 'Newsletter', engagement: 68, views: 450, clicks: 120 },
    { name: 'Article', engagement: 45, views: 320, clicks: 85 },
    { name: 'Annonce', engagement: 72, views: 280, clicks: 60 },
    { name: 'Communiqué', engagement: 38, views: 190, clicks: 42 },
  ];
}

function generateContentDistribution() {
  return [
    { name: 'Newsletters', value: 6 },
    { name: 'Articles', value: 6 },
    { name: 'Annonces', value: 4 },
    { name: 'Campagnes', value: 5 },
  ];
}

// ─── Period selector options ─────────────────────────────────────────────────
const periods = [
  { key: '7d', label: '7d' },
  { key: '30d', label: '30d' },
  { key: '90d', label: '90d' },
  { key: '1y', label: '1a' },
] as const;

type Period = typeof periods[number]['key'];

// ─── Main Component ──────────────────────────────────────────────────────────
export function StatisticsView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const [period, setPeriod] = useState<Period>('30d');

  // Compute real metrics from mock data filtered by tenant
  const tenantContent = useMemo(() => {
    const newsletters = mockNewsletters.filter(n => n.tenantId === activeTenantId);
    const articles = mockArticles.filter(a => a.tenantId === activeTenantId);
    const announcements = mockAnnouncements.filter(a => a.tenantId === activeTenantId);
    const campaigns = mockCampaigns.filter(c => c.tenantId === activeTenantId);
    return { newsletters, articles, announcements, campaigns };
  }, [activeTenantId]);

  const publishedContent = useMemo(() => {
    return [
      ...tenantContent.newsletters.filter(n => n.status === 'published'),
      ...tenantContent.articles.filter(a => a.status === 'published'),
      ...tenantContent.announcements.filter(a => a.status === 'published'),
    ].length;
  }, [tenantContent]);

  const newslettersSent = tenantContent.newsletters.filter(n => n.status === 'published').length;

  const avgOpenRate = useMemo(() => {
    const published = tenantContent.newsletters.filter(n => n.status === 'published' && n.openRate > 0);
    if (published.length === 0) return 0;
    return Math.round(published.reduce((sum, n) => sum + n.openRate, 0) / published.length * 10) / 10;
  }, [tenantContent]);

  const avgClickRate = useMemo(() => {
    const published = tenantContent.newsletters.filter(n => n.status === 'published' && n.clickRate > 0);
    if (published.length === 0) return 0;
    return Math.round(published.reduce((sum, n) => sum + n.clickRate, 0) / published.length * 10) / 10;
  }, [tenantContent]);

  const engagementRate = useMemo(() => {
    return Math.round((avgOpenRate * 0.4 + avgClickRate * 0.6) * 10) / 10;
  }, [avgOpenRate, avgClickRate]);

  // Generate chart data based on period
  const weeksCount = period === '7d' ? 7 : period === '30d' ? 12 : period === '90d' ? 12 : 12;
  const weeklyData = useMemo(() => generateWeeklyData(weeksCount), [weeksCount]);
  const engagementData = useMemo(() => generateEngagementByType(), []);
  const contentDistribution = useMemo(() => generateContentDistribution(), []);

  const stats = [
    {
      title: t.statistics.contentPublished,
      value: publishedContent,
      change: '+12%',
      trend: 'up' as const,
      icon: FileText,
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-600',
      borderAccent: 'border-emerald-500/20',
    },
    {
      title: t.statistics.newslettersSent,
      value: newslettersSent,
      change: '+8%',
      trend: 'up' as const,
      icon: Mail,
      gradient: 'from-teal-500/10 via-teal-500/5 to-transparent',
      iconBg: 'bg-teal-500/15',
      iconColor: 'text-teal-600',
      borderAccent: 'border-teal-500/20',
    },
    {
      title: t.statistics.openRate,
      value: `${avgOpenRate}%`,
      change: '+3.2%',
      trend: 'up' as const,
      icon: Eye,
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-600',
      borderAccent: 'border-amber-500/20',
    },
    {
      title: t.statistics.clickRate,
      value: `${avgClickRate}%`,
      change: '-1.1%',
      trend: 'down' as const,
      icon: MousePointer,
      gradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
      iconBg: 'bg-rose-500/15',
      iconColor: 'text-rose-600',
      borderAccent: 'border-rose-500/20',
    },
    {
      title: t.statistics.conversionRate,
      value: '4.8%',
      change: '+0.6%',
      trend: 'up' as const,
      icon: TrendingUp,
      gradient: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
      iconBg: 'bg-cyan-500/15',
      iconColor: 'text-cyan-600',
      borderAccent: 'border-cyan-500/20',
    },
    {
      title: t.statistics.engagement,
      value: `${engagementRate}%`,
      change: '+2.4%',
      trend: 'up' as const,
      icon: Activity,
      gradient: 'from-[oklch(0.55_0.15_160/0.1)] via-[oklch(0.55_0.15_160/0.05)] to-transparent',
      iconBg: 'bg-[oklch(0.55_0.15_160/0.15)]',
      iconColor: 'text-[oklch(0.55_0.15_160)]',
      borderAccent: 'border-[oklch(0.55_0.15_160/0.2)]',
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
          <h2 className="text-xl font-bold tracking-tight">{t.statistics.title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Mesurez les performances de votre communication
          </p>
        </div>
        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
          {periods.map(p => (
            <Button
              key={p.key}
              variant={period === p.key ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'h-7 text-xs px-3',
                period === p.key && 'bg-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.50_0.15_165)] text-white shadow-sm',
              )}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* ─── Key Metrics ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((stat, i) => {
          const IconComp = stat.icon;
          return (
            <motion.div key={i} variants={item}>
              <Card className={`relative overflow-hidden border ${stat.borderAccent} shadow-sm hover:shadow-md transition-shadow duration-300`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-60`} />
                <CardContent className="relative p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg ${stat.iconBg}`}>
                      <IconComp className={`h-3.5 w-3.5 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <p className="text-lg font-extrabold tracking-tight">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{stat.title}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <div className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${stat.trend === 'up' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                      {stat.trend === 'up' ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                      {stat.change}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Charts Row 1 ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Area Chart - Content published over time */}
        <motion.div variants={item}>
          <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[oklch(0.55_0.15_160/0.1)] border border-[oklch(0.55_0.15_160/0.15)]">
                    <Activity className="h-4 w-4 text-[oklch(0.55_0.15_160)]" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">{t.statistics.contentPublished}</CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Contenus publiés vs planifiés</p>
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
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="statsPublishedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.55 0.15 160)" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="oklch(0.55 0.15 160)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="statsScheduledGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.65 0.15 160)" stopOpacity={0.1} />
                        <stop offset="100%" stopColor="oklch(0.65 0.15 160)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" dy={8} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" dx={-4} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)', radius: 4 }} />
                    <Area type="monotone" dataKey="published" stroke="oklch(0.55 0.15 160)" fill="url(#statsPublishedGrad)" strokeWidth={2.5} name="Publiés" />
                    <Area type="monotone" dataKey="scheduled" stroke="oklch(0.65 0.15 160 / 0.7)" fill="url(#statsScheduledGrad)" strokeWidth={2} strokeDasharray="5 5" name="Planifiés" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bar Chart - Engagement by content type */}
        <motion.div variants={item}>
          <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/15">
                    <BarChart3 className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">{t.statistics.engagement}</CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Engagement par type de contenu</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={engagementData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" dy={8} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" dx={-4} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)', radius: 4 }} />
                    <Bar dataKey="engagement" fill="oklch(0.55 0.15 160)" radius={[6, 6, 0, 0]} maxBarSize={40} name="Engagement %" />
                    <Bar dataKey="clicks" fill="oklch(0.55 0.15 160 / 0.3)" radius={[6, 6, 0, 0]} maxBarSize={40} name="Clics" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Charts Row 2 ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pie Chart - Content distribution by type */}
        <motion.div variants={item}>
          <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/15">
                    <PieChartIcon className="h-4 w-4 text-teal-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">{t.statistics.audience}</CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Distribution des contenus par type</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={contentDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {contentDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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

        {/* Quick Insights */}
        <motion.div variants={item}>
          <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[oklch(0.55_0.15_160/0.1)] border border-[oklch(0.55_0.15_160/0.15)]">
                  <Sparkles className="h-4 w-4 text-[oklch(0.55_0.15_160)]" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Insights rapides</CardTitle>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Recommandations basées sur vos données</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    title: 'Meilleur créneau d\'envoi',
                    value: 'Mardi 9h-10h',
                    description: 'Vos newsletters ont le taux d\'ouverture le plus élevé le mardi matin',
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-500/10',
                  },
                  {
                    title: 'Type le plus engageant',
                    value: 'Annonces',
                    description: 'Les annonces obtiennent 72% d\'engagement en moyenne',
                    color: 'text-amber-600',
                    bg: 'bg-amber-500/10',
                  },
                  {
                    title: 'Tendance d\'audience',
                    value: '+15% ce mois',
                    description: 'Votre audience croît régulièrement depuis 3 semaines',
                    color: 'text-teal-600',
                    bg: 'bg-teal-500/10',
                  },
                  {
                    title: 'Optimisation suggérée',
                    value: 'Objets plus courts',
                    description: 'Les objets de moins de 40 caractères ont 23% plus d\'ouvertures',
                    color: 'text-[oklch(0.55_0.15_160)]',
                    bg: 'bg-[oklch(0.55_0.15_160/0.1)]',
                  },
                ].map((insight, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.08 }}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className={cn('p-2 rounded-lg', insight.bg)}>
                      <TrendingUp className={cn('h-4 w-4', insight.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{insight.title}</p>
                        <span className={cn('text-xs font-semibold', insight.color)}>{insight.value}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{insight.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
