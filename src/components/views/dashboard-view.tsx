'use client';

import { useEffect, useState, useMemo, useSyncExternalStore } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Megaphone,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  MessageSquare,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  ChevronRight,
  Plus,
  UserPlus,
  Send,
  Zap,
  Eye,
  CheckCircle2,
  Edit3,
  Trash2,
  LogIn,
  Shield,
  Mail,
  Bell,
} from 'lucide-react';
import {
  mockNewsletters,
  mockArticles,
  mockAnnouncements,
  mockCampaigns,
  mockCalendarEvents,
  mockAuditLogs,
  mockUsers,
  getUserName,
  getUserInitials,
  contentStatusColors,
  contentStatusLabels,
} from '@/lib/mock-data';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedCounter({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const spring = useSpring(0, { duration });
  const transformed = useTransform(spring, (latest) => Math.round(latest));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = transformed.on('change', (v) => {
      setDisplay(v);
    });
    return unsubscribe;
  }, [transformed]);

  return <span>{display}</span>;
}

// ─── Circular Progress Ring ──────────────────────────────────────────────────
function CircularProgress({
  value,
  size = 56,
  strokeWidth = 5,
  color,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/40"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold" style={{ color }}>
          {value}%
        </span>
      </div>
    </div>
  );
}

// ─── Relative Time ───────────────────────────────────────────────────────────
function getRelativeTime(dateStr: string, locale: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (locale === 'fr') {
    if (diffMins < 1) return "à l'instant";
    if (diffMins < 60) return `il y a ${diffMins}m`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays < 7) return `il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
  }
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Animation Variants ──────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -4, transition: { duration: 0.25, ease: 'easeOut' } },
};

// ─── Main Component ──────────────────────────────────────────────────────────
export function DashboardView() {
  const { t, locale } = useTranslation();
  const { setActivePage, setCreateContentDialogOpen, activeTenantId, currentUser } = useAppStore();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // ─── Compute CMS stats from mock data, filtered by activeTenantId ──────
  const allContent = useMemo(() => {
    const tenantNewsletters = mockNewsletters.filter((n) => n.tenantId === activeTenantId);
    const tenantArticles = mockArticles.filter((a) => a.tenantId === activeTenantId);
    const tenantAnnouncements = mockAnnouncements.filter((a) => a.tenantId === activeTenantId);
    return [...tenantNewsletters, ...tenantArticles, ...tenantAnnouncements];
  }, [activeTenantId]);

  const publishedCount = useMemo(
    () => allContent.filter((c) => c.status === 'published').length,
    [allContent]
  );

  const activeCampaigns = useMemo(
    () => mockCampaigns.filter((c) => c.tenantId === activeTenantId && c.status === 'active'),
    [activeTenantId]
  );

  const inReviewCount = useMemo(
    () => allContent.filter((c) => c.status === 'review').length,
    [allContent]
  );

  const avgOpenRate = useMemo(() => {
    const tenantNewsletters = mockNewsletters.filter((n) => n.tenantId === activeTenantId);
    const withRates = tenantNewsletters.filter((n) => n.openRate > 0);
    if (withRates.length === 0) return 0;
    const total = withRates.reduce((sum, n) => sum + n.openRate, 0);
    return Math.round((total / withRates.length) * 10) / 10;
  }, [activeTenantId]);

  const totalViews = useMemo(
    () => allContent.reduce((sum, c) => sum + (c.viewCount || 0), 0),
    [allContent]
  );

  const draftsCount = useMemo(
    () => allContent.filter((c) => c.status === 'draft').length,
    [allContent]
  );

  // ─── Chart Data: Publication Activity per Day of Week ──────────────────
  const publicationActivityData = useMemo(() => {
    const tenantLogs = mockAuditLogs.filter(
      (l) => l.tenantId === activeTenantId && l.action === 'publish'
    );
    const dayNames = locale === 'fr'
      ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Count publications per day of week from logs
    const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    tenantLogs.forEach((log) => {
      const day = new Date(log.timestamp).getDay();
      // Convert Sunday=0 to Monday-start index
      const idx = day === 0 ? 6 : day - 1;
      counts[idx]++;
    });

    // Add baseline data for visual appeal
    const baseline = [3, 5, 2, 6, 4, 1, 1];
    return dayNames.map((name, i) => ({
      name,
      published: counts[i] + baseline[i],
      scheduled: Math.max(1, Math.round(baseline[i] * 0.6)),
    }));
  }, [activeTenantId, locale]);

  // ─── Chart Data: Campaign Progress Over Time ───────────────────────────
  const campaignProgressData = useMemo(() => {
    const tenantCampaigns = mockCampaigns.filter((c) => c.tenantId === activeTenantId);
    const labels = locale === 'fr'
      ? ['S1', 'S2', 'S3', 'S4', 'S5', 'S6']
      : ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];

    const targetValues = [15, 30, 45, 60, 75, 90];
    const actualValues = tenantCampaigns.length > 0
      ? [10, 22, 35, 48, 58, 65]
      : [0, 0, 0, 0, 0, 0];

    return labels.map((name, i) => ({
      name,
      target: targetValues[i],
      actual: actualValues[i],
    }));
  }, [activeTenantId, locale]);

  // ─── Recent Activity from Audit Logs ───────────────────────────────────
  const recentActivity = useMemo(() => {
    return mockAuditLogs
      .filter((l) => l.tenantId === activeTenantId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 6);
  }, [activeTenantId]);

  const auditActionConfig: Record<string, { icon: React.ElementType; color: string; dotColor: string }> = {
    create: { icon: Zap, color: 'text-emerald-500', dotColor: 'bg-emerald-500' },
    update: { icon: Edit3, color: 'text-amber-500', dotColor: 'bg-amber-500' },
    delete: { icon: Trash2, color: 'text-rose-500', dotColor: 'bg-rose-500' },
    validate: { icon: CheckCircle2, color: 'text-teal-500', dotColor: 'bg-teal-500' },
    publish: { icon: Send, color: 'text-[oklch(0.55_0.15_160)]', dotColor: 'bg-[oklch(0.55_0.15_160)]' },
    login: { icon: LogIn, color: 'text-cyan-500', dotColor: 'bg-cyan-500' },
    logout: { icon: LogIn, color: 'text-slate-500', dotColor: 'bg-slate-500' },
    permission_change: { icon: Shield, color: 'text-violet-500', dotColor: 'bg-violet-500' },
  };

  const entityTypeIcon: Record<string, React.ElementType> = {
    newsletter: Mail,
    article: FileText,
    announcement: Bell,
    user: UserPlus,
    campaign: Megaphone,
  };

  // ─── Scheduled Content (next 3) ────────────────────────────────────────
  const scheduledContent = useMemo(() => {
    return allContent
      .filter((c) => c.status === 'scheduled' && c.scheduledAt)
      .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
      .slice(0, 3);
  }, [allContent]);

  // ─── Upcoming Calendar Events (next 3) ─────────────────────────────────
  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return mockCalendarEvents
      .filter((e) => e.tenantId === activeTenantId && e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);
  }, [activeTenantId]);

  // ─── Active Campaigns for Progress Section ─────────────────────────────
  const campaignsForProgress = useMemo(() => {
    return mockCampaigns
      .filter((c) => c.tenantId === activeTenantId && c.status === 'active')
      .map((c) => ({
        ...c,
        progress: c.contentCount > 0 ? Math.round((c.publishedCount / c.contentCount) * 100) : 0,
      }));
  }, [activeTenantId]);

  // ─── Chart Data: Content Type Distribution ─────────────────────────────
  const contentTypeData = useMemo(() => {
    const tenantNewsletters = mockNewsletters.filter((n) => n.tenantId === activeTenantId);
    const tenantArticles = mockArticles.filter((a) => a.tenantId === activeTenantId);
    const tenantAnnouncements = mockAnnouncements.filter((a) => a.tenantId === activeTenantId);
    return [
      { name: t.dashboard.newsletters, value: tenantNewsletters.length, color: '#14b8a6' },
      { name: t.dashboard.articles, value: tenantArticles.length, color: '#10b981' },
      { name: t.dashboard.announcements, value: tenantAnnouncements.length, color: '#f59e0b' },
    ].filter((d) => d.value > 0);
  }, [activeTenantId, t]);

  // ─── Editorial Pipeline Counts ────────────────────────────────────────────
  const pipelineCounts = useMemo(() => {
    const statuses = ['draft', 'review', 'approved', 'scheduled', 'published', 'archived'] as const;
    return statuses.map((status) => ({
      status,
      count: allContent.filter((c) => c.status === status).length,
    }));
  }, [allContent]);

  const pipelineColors: Record<string, { dot: string; bg: string; text: string }> = {
    draft: { dot: 'bg-slate-400', bg: 'bg-slate-500/10', text: 'text-slate-600' },
    review: { dot: 'bg-amber-400', bg: 'bg-amber-500/10', text: 'text-amber-600' },
    approved: { dot: 'bg-cyan-400', bg: 'bg-cyan-500/10', text: 'text-cyan-600' },
    scheduled: { dot: 'bg-violet-400', bg: 'bg-violet-500/10', text: 'text-violet-600' },
    published: { dot: 'bg-emerald-400', bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
    archived: { dot: 'bg-slate-400', bg: 'bg-slate-500/10', text: 'text-slate-500' },
  };

  // ─── Stats Config ──────────────────────────────────────────────────────
  const statsConfig = [
    {
      title: t.dashboard.totalTasks, // "Contenus publiés"
      value: publishedCount,
      change: '+12%',
      trend: 'up' as const,
      icon: FileText,
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-600',
      borderAccent: 'border-emerald-500/20',
      glowColor: 'shadow-emerald-500/5',
    },
    {
      title: t.dashboard.activeProjects, // "Campagnes actives"
      value: activeCampaigns.length,
      change: '+2',
      trend: 'up' as const,
      icon: Megaphone,
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-600',
      borderAccent: 'border-amber-500/20',
      glowColor: 'shadow-amber-500/5',
    },
    {
      title: t.dashboard.inProgress, // "En révision"
      value: inReviewCount,
      change: '-1',
      trend: 'down' as const,
      icon: Clock,
      gradient: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
      iconBg: 'bg-cyan-500/15',
      iconColor: 'text-cyan-600',
      borderAccent: 'border-cyan-500/20',
      glowColor: 'shadow-cyan-500/5',
    },
    {
      title: t.dashboard.completionRate, // "Taux d'ouverture"
      value: Math.round(avgOpenRate),
      isPercent: true,
      change: '+3.2%',
      trend: 'up' as const,
      icon: Eye,
      gradient: 'from-teal-500/10 via-teal-500/5 to-transparent',
      iconBg: 'bg-teal-500/15',
      iconColor: 'text-teal-600',
      borderAccent: 'border-teal-500/20',
      glowColor: 'shadow-teal-500/5',
    },
    {
      title: t.dashboard.totalViews, // "Total des vues"
      value: totalViews,
      change: '+18%',
      trend: 'up' as const,
      icon: Eye,
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-600',
      borderAccent: 'border-amber-500/20',
      glowColor: 'shadow-amber-500/5',
    },
    {
      title: t.dashboard.drafts, // "Brouillons"
      value: draftsCount,
      change: '-3',
      trend: 'down' as const,
      icon: Edit3,
      gradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
      iconBg: 'bg-rose-500/15',
      iconColor: 'text-rose-600',
      borderAccent: 'border-rose-500/20',
      glowColor: 'shadow-rose-500/5',
    },
  ];

  // ─── Quick Actions ─────────────────────────────────────────────────────
  const quickActions = [
    { icon: Plus, label: t.dashboard.quickActionNewTask, onClick: () => setCreateContentDialogOpen(true), color: 'text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-500/30' },
    { icon: Megaphone, label: t.dashboard.quickActionNewProject, onClick: () => setActivePage('campaigns'), color: 'text-amber-600 hover:bg-amber-500/10 hover:border-amber-500/30' },
    { icon: Send, label: t.dashboard.quickActionScheduleMeeting, onClick: () => setActivePage('scheduling'), color: 'text-teal-600 hover:bg-teal-500/10 hover:border-teal-500/30' },
    { icon: UserPlus, label: t.dashboard.quickActionInviteMember, onClick: () => setActivePage('users'), color: 'text-cyan-600 hover:bg-cyan-500/10 hover:border-cyan-500/30' },
  ];

  // ─── User color helper ─────────────────────────────────────────────────
  const getUserColor = (id: string) => {
    const colors = [
      'bg-emerald-500/20 text-emerald-700',
      'bg-amber-500/20 text-amber-700',
      'bg-cyan-500/20 text-cyan-700',
      'bg-rose-500/20 text-rose-700',
      'bg-teal-500/20 text-teal-700',
      'bg-orange-500/20 text-orange-700',
    ];
    const idx = mockUsers.findIndex((u) => u.id === id);
    return colors[idx % colors.length];
  };

  // ─── Welcome name ──────────────────────────────────────────────────────
  const welcomeName = currentUser?.name?.split(' ')[0] || 'Alex';

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 relative">
      {/* ─── Welcome Greeting Section ────────────────────────────────────── */}
      <motion.div variants={item} className="flex items-start justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-2xl sm:text-3xl font-bold tracking-tight"
          >
            {locale === 'fr' ? `Bon retour, ${welcomeName} !` : `Welcome back, ${welcomeName}!`}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center gap-2 mt-1"
          >
            <span className="text-sm text-muted-foreground">
              {mounted ? new Date().toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-sm text-[oklch(0.55_0.15_160)] font-medium">
              {t.dashboard.motivationalMessage}
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* ─── Quick Actions Row ───────────────────────────────────────────── */}
      <motion.div
        variants={item}
        className="flex items-center gap-2 flex-wrap"
      >
        {quickActions.map((action, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={action.onClick}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border/50 text-xs font-medium transition-all duration-200 ${action.color}`}
          >
            <action.icon className="h-3.5 w-3.5" />
            {action.label}
          </motion.button>
        ))}
      </motion.div>

      {/* ─── Stats Grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {statsConfig.map((stat, i) => {
          const IconComp = stat.icon;
          return (
            <motion.div key={i} variants={item}>
              <motion.div
                variants={cardHover}
                initial="rest"
                whileHover="hover"
                className="relative group"
              >
                <Card
                  className={`relative overflow-hidden border ${stat.borderAccent} shadow-md ${stat.glowColor} hover:shadow-lg transition-shadow duration-300`}
                >
                  {/* Gradient Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500`}
                  />
                  {/* Decorative Circle */}
                  <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-current/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ color: stat.iconColor.includes('emerald') ? '#10b981' : stat.iconColor.includes('amber') ? '#f59e0b' : stat.iconColor.includes('cyan') ? '#06b6d4' : stat.iconColor.includes('rose') ? '#f43f5e' : '#14b8a6' }} />

                  <CardContent className="relative p-5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <div className="flex items-baseline gap-1">
                          <p className="text-3xl font-extrabold tracking-tight">
                            {stat.isPercent ? (
                              <>
                                <AnimatedCounter value={stat.value} />
                                <span className="text-lg font-semibold text-muted-foreground ml-0.5">%</span>
                              </>
                            ) : (
                              <AnimatedCounter value={stat.value} />
                            )}
                          </p>
                        </div>
                      </div>
                      <div className={`p-3 rounded-2xl ${stat.iconBg} backdrop-blur-sm border border-white/10 shadow-sm`}>
                        <IconComp className={`h-5 w-5 ${stat.iconColor}`} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3">
                      <motion.div
                        className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          stat.trend === 'up'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-rose-500/10 text-rose-600'
                        }`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                      >
                        {stat.trend === 'up' ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {stat.change}
                      </motion.div>
                      <span className="text-[11px] text-muted-foreground">{t.dashboard.vsLastWeek}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Charts Section ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Publication Activity Bar Chart */}
        <motion.div variants={item}>
          <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/15">
                    <BarChart3 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">{t.dashboard.weeklyActivity}</CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {locale === 'fr' ? 'Contenus publiés vs planifiés' : 'Published vs scheduled content'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 hover:bg-emerald-500/5">
                  {t.dashboard.viewDetails}
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[220px] mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={publicationActivityData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      stroke="var(--muted-foreground)"
                      dy={8}
                    />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" dx={-4} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                        padding: '10px 14px',
                      }}
                      cursor={{ fill: 'var(--muted)', radius: 4 }}
                    />
                    <Bar dataKey="published" fill="oklch(0.55 0.15 160)" radius={[6, 6, 0, 0]} maxBarSize={28} name={locale === 'fr' ? 'Publiés' : 'Published'} />
                    <Bar dataKey="scheduled" fill="oklch(0.65 0.15 80 / 0.5)" radius={[6, 6, 0, 0]} maxBarSize={28} name={locale === 'fr' ? 'Planifiés' : 'Scheduled'} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Campaign Progress Area Chart */}
        <motion.div variants={item}>
          <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/15">
                    <Activity className="h-4 w-4 text-teal-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">{t.dashboard.sprintBurndown}</CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {locale === 'fr' ? 'Objectif vs avancement réel' : 'Target vs actual progress'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 hover:bg-teal-500/5">
                  {t.dashboard.viewDetails}
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[220px] mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={campaignProgressData}>
                    <defs>
                      <linearGradient id="campaignGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.55 0.15 160)" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="oklch(0.55 0.15 160)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      stroke="var(--muted-foreground)"
                      dy={8}
                    />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" dx={-4} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                        padding: '10px 14px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="target"
                      stroke="oklch(0.55 0.15 160 / 0.4)"
                      fill="none"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      name={locale === 'fr' ? 'Objectif' : 'Target'}
                    />
                    <Area
                      type="monotone"
                      dataKey="actual"
                      stroke="oklch(0.55 0.15 160)"
                      fill="url(#campaignGradient)"
                      strokeWidth={2.5}
                      name={locale === 'fr' ? 'Réel' : 'Actual'}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Type Distribution Pie Chart */}
        <motion.div variants={item}>
          <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/15">
                    <PieChartIcon className="h-4 w-4 text-teal-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">{t.dashboard.contentTypeBreakdown}</CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {locale === 'fr' ? 'Répartition des contenus par type' : 'Content breakdown by type'}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[160px] mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={contentTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {contentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                        padding: '10px 14px',
                      }}
                      formatter={(value: number) => [value, '']}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-2">
                {contentTypeData.map((entry, idx) => {
                  const total = contentTypeData.reduce((sum, d) => sum + d.value, 0);
                  const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                  return (
                    <div key={idx} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="text-[11px] text-muted-foreground">{entry.name}</span>
                      <span className="text-[11px] font-semibold">{entry.value}</span>
                      <span className="text-[10px] text-muted-foreground/60">({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Editorial Workflow Pipeline ─────────────────────────────────── */}
      <motion.div variants={item}>
        <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[oklch(0.55_0.15_160/0.1)] border border-[oklch(0.55_0.15_160/0.15)]">
                  <Activity className="h-4 w-4 text-[oklch(0.55_0.15_160)]" />
                </div>
                <CardTitle className="text-sm font-semibold">{t.dashboard.editorialPipeline}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-center justify-between gap-2 overflow-x-auto py-2">
              {pipelineCounts.map((stage, idx) => {
                const colors = pipelineColors[stage.status] || pipelineColors.draft;
                const statusLabels = contentStatusLabels[locale] || contentStatusLabels.fr;
                return (
                  <div key={stage.status} className="flex items-center gap-2">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + idx * 0.08, duration: 0.3 }}
                      className="flex flex-col items-center gap-1.5 min-w-[80px]"
                    >
                      <div className={`w-10 h-10 rounded-full ${colors.bg} border border-current/10 flex items-center justify-center`}>
                        <span className={`text-sm font-bold ${colors.text}`}>
                          <AnimatedCounter value={stage.count} />
                        </span>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${colors.dot} ring-2 ring-background`} />
                      <span className="text-[11px] font-medium text-muted-foreground text-center leading-tight">
                        {statusLabels[stage.status] || stage.status}
                      </span>
                    </motion.div>
                    {idx < pipelineCounts.length - 1 && (
                      <div className="flex-shrink-0 w-6 h-0.5 bg-border/60 rounded-full mt-[-20px]" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Recent Activity + Upcoming ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Activity */}
        <motion.div variants={item}>
          <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[oklch(0.55_0.15_160/0.1)] border border-[oklch(0.55_0.15_160/0.15)]">
                    <Activity className="h-4 w-4 text-[oklch(0.55_0.15_160)]" />
                  </div>
                  <CardTitle className="text-sm font-semibold">{t.dashboard.recentActivity}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1 hover:bg-[oklch(0.55_0.15_160/0.05)]"
                  onClick={() => setActivePage('audit')}
                >
                  {t.dashboard.seeAll}
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-1 max-h-[320px] overflow-y-auto">
                <AnimatePresence>
                  {recentActivity.map((log, idx) => {
                    const actionConfig = auditActionConfig[log.action] || auditActionConfig.update;
                    const ActionIcon = actionConfig.icon;
                    const EntityIcon = entityTypeIcon[log.entityType] || FileText;
                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + idx * 0.04, duration: 0.3, ease: 'easeOut' }}
                        className="group flex items-start gap-3 p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-muted/30 transition-all duration-200"
                      >
                        <div className="relative flex-shrink-0">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className={`text-xs font-semibold ${getUserColor(log.userId)}`}>
                              {getUserInitials(log.userId)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background flex items-center justify-center ${actionConfig.dotColor}`}>
                            <ActionIcon className="h-2 w-2 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-snug">
                            <span className="font-medium">{getUserName(log.userId)}</span>{' '}
                            <span className="text-muted-foreground">{log.details}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <EntityIcon className="h-3 w-3 text-muted-foreground/60" />
                              <span className="text-[11px] text-muted-foreground/70 capitalize">{log.entityType}</span>
                            </div>
                            <span className="text-muted-foreground/30">·</span>
                            <span className="text-[11px] text-muted-foreground/60">{getRelativeTime(log.timestamp, locale)}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Section */}
        <motion.div variants={item}>
          <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/15">
                    <CalendarDays className="h-4 w-4 text-amber-600" />
                  </div>
                  <CardTitle className="text-sm font-semibold">{t.dashboard.upcoming}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1 hover:bg-amber-500/5"
                  onClick={() => setActivePage('editorial-calendar')}
                >
                  {t.dashboard.seeAll}
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-4">
                {/* Scheduled Content */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {locale === 'fr' ? 'Contenus planifiés' : 'Scheduled Content'}
                  </h4>
                  <div className="space-y-2">
                    {scheduledContent.length === 0 ? (
                      <p className="text-xs text-muted-foreground/60 italic py-2">
                        {locale === 'fr' ? 'Aucun contenu planifié' : 'No scheduled content'}
                      </p>
                    ) : (
                      scheduledContent.map((content, idx) => {
                        const statusColors = contentStatusColors[content.status] || contentStatusColors.draft;
                        const statusLabels = contentStatusLabels[locale] || contentStatusLabels.fr;
                        return (
                          <motion.div
                            key={content.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + idx * 0.05, duration: 0.25 }}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[oklch(0.55_0.15_160/0.08)] border border-[oklch(0.55_0.15_160/0.12)] flex items-center justify-center">
                              {content.type === 'newsletter' ? (
                                <Mail className="h-4 w-4 text-[oklch(0.55_0.15_160)]" />
                              ) : content.type === 'article' ? (
                                <FileText className="h-4 w-4 text-[oklch(0.55_0.15_160)]" />
                              ) : (
                                <Bell className="h-4 w-4 text-[oklch(0.55_0.15_160)]" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{content.title}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {new Date(content.scheduledAt!).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                              {statusLabels[content.status] || content.status}
                            </Badge>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Upcoming Deadlines */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {t.dashboard.upcomingDeadlines}
                  </h4>
                  <div className="space-y-2">
                    {upcomingEvents.length === 0 ? (
                      <p className="text-xs text-muted-foreground/60 italic py-2">
                        {locale === 'fr' ? 'Aucune échéance à venir' : 'No upcoming deadlines'}
                      </p>
                    ) : (
                      upcomingEvents.map((event, idx) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + idx * 0.05, duration: 0.25 }}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          <div
                            className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border"
                            style={{
                              backgroundColor: `${event.color}15`,
                              borderColor: `${event.color}30`,
                            }}
                          >
                            {event.type === 'deadline' ? (
                              <Clock className="h-4 w-4" style={{ color: event.color }} />
                            ) : event.type === 'publication' ? (
                              <Send className="h-4 w-4" style={{ color: event.color }} />
                            ) : event.type === 'review' ? (
                              <Eye className="h-4 w-4" style={{ color: event.color }} />
                            ) : event.type === 'meeting' ? (
                              <MessageSquare className="h-4 w-4" style={{ color: event.color }} />
                            ) : (
                              <Megaphone className="h-4 w-4" style={{ color: event.color }} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{event.title}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {new Date(event.date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 capitalize"
                            style={{
                              backgroundColor: `${event.color}10`,
                              color: event.color,
                              borderColor: `${event.color}30`,
                            }}
                          >
                            {event.type}
                          </Badge>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Campaign Progress ───────────────────────────────────────────── */}
      {campaignsForProgress.length > 0 && (
        <motion.div variants={item}>
          <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/15">
                    <Megaphone className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">{t.dashboard.projectProgress}</CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {campaignsForProgress.length} {t.dashboard.activeProjectsCount}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1 hover:bg-amber-500/5"
                  onClick={() => setActivePage('campaigns')}
                >
                  {t.dashboard.viewAllProjects}
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaignsForProgress.map((campaign, idx) => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.08, duration: 0.3 }}
                    className="group p-4 rounded-xl border border-border/50 hover:border-border hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <CircularProgress
                        value={campaign.progress}
                        size={52}
                        strokeWidth={4}
                        color={campaign.color}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold truncate">{campaign.name}</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{campaign.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: campaign.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${campaign.progress}%` }}
                              transition={{ duration: 1, delay: 0.3 + idx * 0.1, ease: 'easeOut' }}
                            />
                          </div>
                          <span className="text-[10px] font-medium text-muted-foreground flex-shrink-0">
                            {campaign.publishedCount}/{campaign.contentCount}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Eye className="h-3 w-3" />
                            {campaign.avgOpenRate}%
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <TrendingUp className="h-3 w-3" />
                            {campaign.avgClickRate}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ─── Team Activity Heatmap ────────────────────────────────────────── */}
      <motion.div variants={item}>
        <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/15">
                  <Activity className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">{t.dashboard.teamActivityHeatmap}</CardTitle>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span>{t.dashboard.heatmapLess}</span>
                <div className="flex gap-0.5">
                  {[0.1, 0.25, 0.5, 0.75, 1].map((opacity, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: `oklch(0.55 0.15 160 / ${opacity})` }} />
                  ))}
                </div>
                <span>{t.dashboard.heatmapMore}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1" style={{ gridTemplateRows: 'repeat(4, 1fr)' }}>
              {Array.from({ length: 28 }).map((_, i) => {
                const level = mounted ? ((Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1 : 0.5;
                const opacity = level < 0.15 ? 0.05 : level < 0.35 ? 0.15 : level < 0.55 ? 0.3 : level < 0.75 ? 0.55 : 0.85;
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.02 * i, duration: 0.2 }}
                    whileHover={{ scale: 1.3, borderRadius: '4px' }}
                    className="aspect-square rounded-sm cursor-pointer transition-all"
                    style={{ backgroundColor: `oklch(0.55 0.15 160 / ${opacity})` }}
                    title={`${Math.round(level * 10)} activities`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex gap-3 text-[10px] text-muted-foreground">
                {(locale === 'fr' ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']).map((day) => (
                  <span key={day} className="w-6 text-center">{day}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
