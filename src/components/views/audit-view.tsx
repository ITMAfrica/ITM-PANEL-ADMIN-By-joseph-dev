'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ScrollText,
  Search,
  Download,
  Clock,
  User,
  Activity,
  Zap,
  CalendarDays,
  ArrowUpRight,
  Filter,
  TrendingUp,
} from 'lucide-react';
import { mockAuditLogs, getUserName, getUserInitials, roleColors } from '@/lib/mock-data';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { AuditLogEntry } from '@/lib/types';

// ─── Animation ───────────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ─── Action type colors ──────────────────────────────────────────────────────
const actionColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  create: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
  update: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20', dot: 'bg-amber-500' },
  delete: { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-500/20', dot: 'bg-rose-500' },
  validate: { bg: 'bg-cyan-500/10', text: 'text-cyan-600', border: 'border-cyan-500/20', dot: 'bg-cyan-500' },
  publish: { bg: 'bg-teal-500/10', text: 'text-teal-600', border: 'border-teal-500/20', dot: 'bg-teal-500' },
  login: { bg: 'bg-slate-500/10', text: 'text-slate-600', border: 'border-slate-500/20', dot: 'bg-slate-500' },
  permission_change: { bg: 'bg-violet-500/10', text: 'text-violet-600', border: 'border-violet-500/20', dot: 'bg-violet-500' },
  logout: { bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/20', dot: 'bg-slate-400' },
};

// ─── Action type icons ───────────────────────────────────────────────────────
const actionIcons: Record<string, string> = {
  create: '➕',
  update: '✏️',
  delete: '🗑️',
  validate: '✅',
  publish: '📤',
  login: '🔑',
  permission_change: '🔐',
  logout: '🚪',
};

// ─── Entity type labels ──────────────────────────────────────────────────────
const entityTypeLabels: Record<string, string> = {
  newsletter: 'Newsletter',
  article: 'Article',
  announcement: 'Annonce',
  user: 'Utilisateur',
  campaign: 'Campagne',
  media: 'Média',
  template: 'Modèle',
  settings: 'Paramètres',
};

// ─── Avatar gradient colors ──────────────────────────────────────────────────
const avatarGradients = [
  'from-teal-500 to-emerald-600',
  'from-emerald-500 to-teal-600',
  'from-cyan-500 to-teal-600',
  'from-amber-500 to-teal-600',
  'from-rose-500 to-teal-600',
  'from-violet-500 to-emerald-600',
  'from-emerald-400 to-cyan-500',
  'from-teal-400 to-emerald-500',
];

function formatTimestamp(ts: string): { date: string; time: string; relative: string } {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let relative: string;
  if (diffMins < 1) relative = "à l'instant";
  else if (diffMins < 60) relative = `il y a ${diffMins}m`;
  else if (diffHours < 24) relative = `il y a ${diffHours}h`;
  else if (diffDays < 7) relative = `il y a ${diffDays}j`;
  else relative = d.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });

  return {
    date: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    relative,
  };
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function AuditView() {
  const { t } = useTranslation();
  const { activeTenantId } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');

  // Get unique values for filters
  const actionTypes = useMemo(() => {
    const types = new Set(mockAuditLogs.map((log) => log.action));
    return Array.from(types).sort();
  }, []);

  const entityTypes = useMemo(() => {
    const types = new Set(mockAuditLogs.map((log) => log.entityType));
    return Array.from(types).sort();
  }, []);

  const userIds = useMemo(() => {
    const ids = new Set(mockAuditLogs.map((log) => log.userId));
    return Array.from(ids).sort();
  }, []);

  // Filter logs
  const filteredLogs = useMemo(() => {
    let logs = mockAuditLogs;

    // Filter by activeTenantId for non-super-admin
    // In this demo we don't strictly enforce it, but we support it
    if (actionFilter !== 'all') {
      logs = logs.filter((l) => l.action === actionFilter);
    }
    if (entityFilter !== 'all') {
      logs = logs.filter((l) => l.entityType === entityFilter);
    }
    if (userFilter !== 'all') {
      logs = logs.filter((l) => l.userId === userFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.details.toLowerCase().includes(q) ||
          getUserName(l.userId).toLowerCase().includes(q) ||
          l.entityType.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q)
      );
    }

    // Sort by timestamp descending
    return [...logs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [searchQuery, actionFilter, entityFilter, userFilter]);

  // Stats
  const todayActions = useMemo(() => {
    const today = new Date().toDateString();
    return mockAuditLogs.filter(
      (l) => new Date(l.timestamp).toDateString() === today
    ).length;
  }, []);

  const mostActiveUser = useMemo(() => {
    const counts: Record<string, number> = {};
    mockAuditLogs.forEach((l) => {
      counts[l.userId] = (counts[l.userId] || 0) + 1;
    });
    const topUserId = Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0];
    return topUserId ? getUserName(topUserId) : '-';
  }, []);

  const mostCommonAction = useMemo(() => {
    const counts: Record<string, number> = {};
    mockAuditLogs.forEach((l) => {
      counts[l.action] = (counts[l.action] || 0) + 1;
    });
    const top = Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0];
    return top || '-';
  }, []);

  const statCards = [
    {
      title: "Actions aujourd'hui",
      value: todayActions,
      icon: Zap,
      gradient: 'from-teal-500/10 via-teal-500/5 to-transparent',
      iconBg: 'bg-teal-500/15 border-teal-500/15',
      iconColor: 'text-teal-600',
      borderAccent: 'border-teal-500/20',
    },
    {
      title: 'Utilisateur le plus actif',
      value: mostActiveUser.split(' ')[0],
      icon: User,
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-500/15 border-emerald-500/15',
      iconColor: 'text-emerald-600',
      borderAccent: 'border-emerald-500/20',
      isText: true,
    },
    {
      title: 'Action la plus fréquente',
      value: t.audit[mostCommonAction as keyof typeof t.audit] || mostCommonAction,
      icon: Activity,
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      iconBg: 'bg-amber-500/15 border-amber-500/15',
      iconColor: 'text-amber-600',
      borderAccent: 'border-amber-500/20',
      isText: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t.audit.title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {mockAuditLogs.length} entrées · {todayActions} aujourd'hui
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 hover:border-[oklch(0.55_0.15_160/0.3)] hover:text-[oklch(0.55_0.15_160)]"
        >
          <Download className="h-4 w-4" /> {t.audit.exportLog}
        </Button>
      </div>

      {/* ─── Stats Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statCards.map((stat, i) => {
          const IconComp = stat.icon;
          return (
            <motion.div key={i} variants={item} initial="hidden" animate="show">
              <Card className={`relative overflow-hidden border ${stat.borderAccent} shadow-sm hover:shadow-md transition-shadow duration-300 group`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
                <CardContent className="relative p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${stat.iconBg}`}>
                    <IconComp className={`h-4 w-4 ${stat.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground font-medium">{stat.title}</p>
                    <p className={cn('tracking-tight', stat.isText ? 'text-sm font-bold truncate' : 'text-xl font-extrabold')}>
                      {stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Filters Bar ─────────────────────────────────────────────────── */}
      <Card className="border-border/60">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans le journal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-xs pl-8 bg-muted/30 border-transparent focus:border-[oklch(0.55_0.15_160/0.3)]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="h-8 w-[140px] text-xs bg-muted/30 border-transparent">
                  <Activity className="h-3 w-3 mr-1 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.audit.filterAction}</SelectItem>
                  {actionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t.audit[type as keyof typeof t.audit] || type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="h-8 w-[140px] text-xs bg-muted/30 border-transparent">
                  <Filter className="h-3 w-3 mr-1 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.audit.filterEntity}</SelectItem>
                  {entityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {entityTypeLabels[type] || type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="h-8 w-[150px] text-xs bg-muted/30 border-transparent">
                  <User className="h-3 w-3 mr-1 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.audit.filterUser}</SelectItem>
                  {userIds.map((id) => (
                    <SelectItem key={id} value={id}>
                      {getUserName(id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Audit Log Timeline ──────────────────────────────────────────── */}
      {filteredLogs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-muted/50 mb-4">
            <ScrollText className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">{t.audit.noResults}</p>
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show">
          <Card className="border-border/60 overflow-hidden">
            <div className="divide-y">
              {filteredLogs.map((log, idx) => {
                const userName = getUserName(log.userId);
                const initials = getUserInitials(log.userId);
                const gradient = avatarGradients[idx % avatarGradients.length];
                const actionColor = actionColors[log.action] || actionColors.update;
                const { date, time, relative } = formatTimestamp(log.timestamp);
                const entityLabel = entityTypeLabels[log.entityType] || log.entityType;

                return (
                  <motion.div
                    key={log.id}
                    variants={item}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-muted/20 transition-colors group"
                  >
                    {/* Timeline connector */}
                    <div className="relative flex flex-col items-center flex-shrink-0">
                      <div
                        className={cn(
                          'h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white bg-gradient-to-br',
                          gradient
                        )}
                      >
                        {initials}
                      </div>
                      {/* Timeline line (hidden for last item) */}
                      {idx < filteredLogs.length - 1 && (
                        <div className="w-px flex-1 bg-border/40 mt-1 min-h-[16px]" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{userName}</span>

                        {/* Action badge */}
                        <Badge
                          className={cn(
                            'text-[9px] px-2 py-0 h-4 font-semibold border gap-1',
                            actionColor.bg,
                            actionColor.text,
                            actionColor.border
                          )}
                        >
                          <div className={cn('w-1.5 h-1.5 rounded-full', actionColor.dot)} />
                          {t.audit[log.action as keyof typeof t.audit] || log.action}
                        </Badge>

                        {/* Entity type */}
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1.5 py-0 h-4 font-medium border-border/40 text-muted-foreground"
                        >
                          {entityLabel}
                        </Badge>
                      </div>

                      {/* Details */}
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                        {log.details}
                      </p>
                    </div>

                    {/* Timestamp */}
                    <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
                      <span className="text-[10px] text-muted-foreground font-medium">{relative}</span>
                      <span className="text-[9px] text-muted-foreground/60 hidden sm:inline">
                        {date} · {time}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
