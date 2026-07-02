'use client';

import { useState, useMemo, useSyncExternalStore } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Megaphone,
  Clock,
  TrendingUp,
  CalendarDays,
  MessageSquare,
  Activity,
  ChevronRight,
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
  CheckCircle,
  XCircle,
  ClipboardCheck,
} from 'lucide-react';
import {
  contentStatusColors,
  contentStatusLabels,
} from '@/lib/ui-constants';
import { useContent, useCalendarEvents } from '@/hooks/use-content';
import { useCampaigns } from '@/hooks/use-campaigns';
import { useAuditLog } from '@/hooks/use-audit';
import { useUserLookup } from '@/hooks/use-user-lookup';
import type { ContentItem } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ViewShell,
  ViewSubNav,
  ViewTabPanel,
} from '@/components/view-layout';
import { AllResourceAnalyticsPanels } from '@/components/resource-analytics';

const EMPTY_CONTENT: ContentItem[] = [];
const EMPTY_CAMPAIGNS: import('@/lib/types').Campaign[] = [];
const EMPTY_AUDIT_LOGS: import('@/lib/types').AuditLogEntry[] = [];
const EMPTY_CALENDAR_EVENTS: import('@/lib/types').CalendarEvent[] = [];

// --- Circular Progress Ring --------------------------------------------------
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

// --- Relative Time -----------------------------------------------------------
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

// --- Animation Variants ------------------------------------------------------
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -4, transition: { duration: 0.25, ease: 'easeOut' as const } },
};

// --- Main Component ----------------------------------------------------------
export function DashboardView() {
  const { t, locale } = useTranslation();
  const setActivePage = useAppStore((s) => s.setActivePage);
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // --- State for new sections -----------------------------------------------
  const [dashboardPeriod, setDashboardPeriod] = useState<'7j' | '30j' | '90j'>('30j');
  const dashboardWeeksCount = dashboardPeriod === '7j' ? 7 : 12;

  const { data: allContentData } = useContent({ tenantId: activeTenantId });
  const { data: reviewContentData } = useContent({ tenantId: activeTenantId, status: 'review' });
  const { data: tenantCampaignsData } = useCampaigns(activeTenantId);
  const { data: auditLogsData } = useAuditLog(activeTenantId);
  const { data: calendarEventsData } = useCalendarEvents(activeTenantId);
  const allContent = allContentData ?? EMPTY_CONTENT;
  const reviewContent = reviewContentData ?? EMPTY_CONTENT;
  const tenantCampaigns = tenantCampaignsData ?? EMPTY_CAMPAIGNS;
  const auditLogs = auditLogsData ?? EMPTY_AUDIT_LOGS;
  const calendarEvents = calendarEventsData ?? EMPTY_CALENDAR_EVENTS;
  const { getUserName, getUserInitials } = useUserLookup(activeTenantId);

  const [dismissedApprovalIds, setDismissedApprovalIds] = useState<Set<string>>(() => new Set());

  const approvalItems = useMemo(
    () => reviewContent.filter((item) => !dismissedApprovalIds.has(item.id)),
    [reviewContent, dismissedApprovalIds]
  );

  const handleApprove = (id: string) => {
    setDismissedApprovalIds((prev) => new Set(prev).add(id));
  };

  const handleReject = (id: string) => {
    setDismissedApprovalIds((prev) => new Set(prev).add(id));
  };

  // --- Recent Activity from Audit Logs -----------------------------------
  const recentActivity = useMemo(() => {
    return auditLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 6);
  }, [auditLogs]);

  const auditActionConfig: Record<string, { icon: React.ElementType; color: string; dotColor: string }> = {
    create: { icon: Zap, color: 'text-blue-500', dotColor: 'bg-blue-500' },
    update: { icon: Edit3, color: 'text-amber-500', dotColor: 'bg-amber-500' },
    delete: { icon: Trash2, color: 'text-rose-500', dotColor: 'bg-rose-500' },
    validate: { icon: CheckCircle2, color: 'text-blue-500', dotColor: 'bg-blue-500' },
    publish: { icon: Send, color: 'text-[oklch(0.55_0.18_250)]', dotColor: 'bg-[oklch(0.55_0.18_250)]' },
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

  // --- Scheduled Content (next 3) ----------------------------------------
  const scheduledContent = useMemo(() => {
    return allContent
      .filter((c) => c.status === 'scheduled' && c.scheduledAt)
      .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
      .slice(0, 3);
  }, [allContent]);

  // --- Upcoming Calendar Events (next 3) ---------------------------------
  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return calendarEvents
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);
  }, [calendarEvents]);

  // --- Active Campaigns for Progress Section -----------------------------
  const campaignsForProgress = useMemo(() => {
    return tenantCampaigns
      .filter((c) => c.status === 'active')
      .map((c) => ({
        ...c,
        progress: c.contentCount > 0 ? Math.round((c.publishedCount / c.contentCount) * 100) : 0,
      }));
  }, [tenantCampaigns]);

  // --- User color helper -------------------------------------------------
  const getUserColor = (id: string) => {
    const colors = [
      'bg-blue-500/20 text-blue-700',
      'bg-amber-500/20 text-amber-700',
      'bg-cyan-500/20 text-cyan-700',
      'bg-rose-500/20 text-rose-700',
      'bg-blue-500/20 text-blue-700',
      'bg-orange-500/20 text-orange-700',
    ];
    const idx = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[idx % colors.length];
  };

  return (
    <ViewShell>
      <ViewSubNav
        tabs={[{ id: 'overview', label: t.dashboard.title }]}
        activeTab="overview"
        onTabChange={() => {}}
      />
      <ViewTabPanel>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">

      {/* --- Analytics (same display as Statistics page) --------------------- */}
      <motion.div variants={item} className="space-y-4">
        <div className="flex items-center justify-end gap-2">
          {(['7j', '30j', '90j'] as const).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setDashboardPeriod(period)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                dashboardPeriod === period
                  ? 'bg-[#1D141F] text-white'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              {period}
            </button>
          ))}
        </div>
        <AllResourceAnalyticsPanels weeksCount={dashboardWeeksCount} />
      </motion.div>


      {/* --- Content Approval Queue ---------------------------------------- */}
      <motion.div variants={item}>
          <Card className="overflow-hidden dark-card-glow border h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/15">
                    <ClipboardCheck className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">{t.dashboard.approvalQueue}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t.dashboard.approvalQueueDesc}</p>
                  </div>
                </div>
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/15 text-xs">
                  {approvalItems.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {approvalItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <div className="p-3 rounded-2xl bg-emerald-500/10">
                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{t.dashboard.allClear}</p>
                  <p className="text-xs text-muted-foreground">{t.dashboard.allClearDesc}</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {approvalItems.map((contentItem, idx) => {
                    const typeIcon = contentItem.type === 'newsletter' ? Mail : contentItem.type === 'article' ? FileText : Megaphone;
                    const typeColor = contentItem.type === 'newsletter' ? 'bg-[oklch(0.55_0.18_250/0.1)] text-[oklch(0.55_0.18_250)]' : contentItem.type === 'article' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600';
                    const priorityColor = contentItem.priority === 'urgent' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : contentItem.priority === 'high' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' : contentItem.priority === 'medium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-slate-500/10 text-slate-600 border-slate-500/20';
                    const priorityLabel = contentItem.priority === 'urgent' ? 'Urgent' : contentItem.priority === 'high' ? 'High' : contentItem.priority === 'medium' ? 'Medium' : 'Low';
                    const TypeIcon = typeIcon;
                    return (
                      <motion.div
                        key={contentItem.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.06, duration: 0.3 }}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors group"
                      >
                        <div className={`p-1.5 rounded-lg ${typeColor} flex-shrink-0`}>
                          <TypeIcon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{contentItem.title}</p>
                            <Badge className={`${priorityColor} text-xs px-1.5 py-0 h-4 border flex-shrink-0`}>
                              {priorityLabel}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="h-4 w-4">
                              <AvatarFallback className="text-xs bg-muted">
                                {getUserInitials(contentItem.authorId)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">{getUserName(contentItem.authorId)}</span>
                            <span className="text-sm text-muted-foreground/60">·</span>
                            <span className="text-sm text-muted-foreground/60">{getRelativeTime(contentItem.updatedAt, locale)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs bg-[oklch(0.55_0.18_250/0.1)] text-[oklch(0.55_0.18_250)] hover:bg-[oklch(0.55_0.18_250/0.2)] hover:text-[oklch(0.55_0.18_250)]"
                            onClick={() => handleApprove(contentItem.id)}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {t.dashboard.approve}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-500/10 hover:text-rose-600"
                            onClick={() => handleReject(contentItem.id)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            {t.dashboard.reject}
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

      {/* --- Recent Activity + Upcoming ------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Activity */}
        <motion.div variants={item}>
          <Card className="overflow-hidden dark-card-glow border h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[oklch(0.55_0.18_250/0.1)] border border-[oklch(0.55_0.18_250/0.15)]">
                    <Activity className="h-4 w-4 text-[oklch(0.55_0.18_250)]" />
                  </div>
                  <CardTitle className="text-sm font-semibold">{t.dashboard.recentActivity}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1 hover:bg-[oklch(0.55_0.18_250/0.05)]"
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
                        transition={{ delay: 0.05 + idx * 0.04, duration: 0.3, ease: 'easeOut' as const }}
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
                              <span className="text-sm text-muted-foreground/70 capitalize">{log.entityType}</span>
                            </div>
                            <span className="text-muted-foreground/30">·</span>
                            <span className="text-sm text-muted-foreground/60">{getRelativeTime(log.timestamp, locale)}</span>
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
          <Card className="overflow-hidden dark-card-glow border h-full">
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
                            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[oklch(0.55_0.18_250/0.08)] border border-[oklch(0.55_0.18_250/0.12)] flex items-center justify-center">
                              {content.type === 'newsletter' ? (
                                <Mail className="h-4 w-4 text-[oklch(0.55_0.18_250)]" />
                              ) : content.type === 'article' ? (
                                <FileText className="h-4 w-4 text-[oklch(0.55_0.18_250)]" />
                              ) : (
                                <Bell className="h-4 w-4 text-[oklch(0.55_0.18_250)]" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{content.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(content.scheduledAt!).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <Badge variant="outline" className={`text-xs px-1.5 py-0 ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
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
                        {t.editorialCalendar.noUpcomingDeadlines}
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
                            <p className="text-sm text-muted-foreground">
                              {new Date(event.date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-xs px-1.5 py-0 capitalize"
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

      {/* --- Campaign Progress --------------------------------------------- */}
      {campaignsForProgress.length > 0 && (
        <motion.div variants={item}>
          <Card className="overflow-hidden dark-card-glow border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/15">
                    <Megaphone className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">{t.dashboard.projectProgress}</CardTitle>
                    <p className="text-sm text-muted-foreground">
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
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{campaign.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: campaign.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${campaign.progress}%` }}
                              transition={{ duration: 1, delay: 0.3 + idx * 0.1, ease: 'easeOut' as const }}
                            />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground flex-shrink-0">
                            {campaign.publishedCount}/{campaign.contentCount}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <Eye className="h-3 w-3" />
                            {campaign.avgOpenRate}%
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
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

      {/* --- Team Activity Heatmap ------------------------------------------ */}
      <motion.div variants={item}>
        <Card className="overflow-hidden dark-card-glow border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/15">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">{t.dashboard.teamActivityHeatmap}</CardTitle>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>{t.dashboard.heatmapLess}</span>
                <div className="flex gap-0.5">
                  {[0.1, 0.25, 0.5, 0.75, 1].map((opacity, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: `oklch(0.55 0.18 250 / ${opacity})` }} />
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
                    style={{ backgroundColor: `oklch(0.55 0.18 250 / ${opacity})` }}
                    title={`${Math.round(level * 10)} activities`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex gap-3 text-xs text-muted-foreground">
                {(locale === 'fr' ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']).map((day) => (
                  <span key={day} className="w-6 text-center">{day}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </motion.div>
      </ViewTabPanel>
    </ViewShell>
  );
}
