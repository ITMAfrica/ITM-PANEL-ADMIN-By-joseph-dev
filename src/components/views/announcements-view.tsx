'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Megaphone,
  Plus,
  Search,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle2,
  Users,
  Clock,
  Shield,
} from 'lucide-react';
import { mockAnnouncements, getUserName, getUserInitials, contentStatusColors, contentStatusLabels } from '@/lib/mock-data';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Animation Variants ──────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.01, y: -2, transition: { duration: 0.2, ease: 'easeOut' } },
};

// ─── Urgency Config ──────────────────────────────────────────────────────────
const urgencyConfig: Record<string, {
  icon: React.ElementType;
  bg: string;
  text: string;
  border: string;
  strip: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}> = {
  info: {
    icon: Info,
    bg: 'bg-teal-500/5',
    text: 'text-teal-700',
    border: 'border-teal-500/20',
    strip: 'bg-teal-500',
    badgeBg: 'bg-teal-500/10',
    badgeText: 'text-teal-600',
    badgeBorder: 'border-teal-500/20',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-500/5',
    text: 'text-amber-700',
    border: 'border-amber-500/20',
    strip: 'bg-amber-500',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-600',
    badgeBorder: 'border-amber-500/20',
  },
  critical: {
    icon: AlertCircle,
    bg: 'bg-rose-500/5',
    text: 'text-rose-700',
    border: 'border-rose-500/20',
    strip: 'bg-rose-500',
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-600',
    badgeBorder: 'border-rose-500/20',
  },
};

// ─── Status Filters ──────────────────────────────────────────────────────────
const statusTabs = ['all', 'draft', 'review', 'published'] as const;
type StatusTab = typeof statusTabs[number];

const urgencyTabs = ['all', 'info', 'warning', 'critical'] as const;
type UrgencyTab = typeof urgencyTabs[number];

// ─── Main Component ──────────────────────────────────────────────────────────
export function AnnouncementsView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<StatusTab>('all');
  const [activeUrgency, setActiveUrgency] = useState<UrgencyTab>('all');

  // Filter announcements by tenant
  const tenantAnnouncements = useMemo(
    () => mockAnnouncements.filter((an) => an.tenantId === activeTenantId),
    [activeTenantId]
  );

  // Filter by status, urgency, and search
  const filteredAnnouncements = useMemo(() => {
    let result = tenantAnnouncements;
    if (activeStatus !== 'all') {
      result = result.filter((an) => an.status === activeStatus);
    }
    if (activeUrgency !== 'all') {
      result = result.filter((an) => an.urgency === activeUrgency);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (an) =>
          an.title.toLowerCase().includes(q) ||
          an.excerpt.toLowerCase().includes(q) ||
          getUserName(an.authorId).toLowerCase().includes(q)
      );
    }
    return result;
  }, [tenantAnnouncements, activeStatus, activeUrgency, searchQuery]);

  // Stats
  const totalAnnouncements = tenantAnnouncements.length;
  const publishedCount = tenantAnnouncements.filter((an) => an.status === 'published').length;
  const ackRate = tenantAnnouncements.filter((an) => an.totalRecipients > 0).length > 0
    ? Math.round(
        tenantAnnouncements
          .filter((an) => an.totalRecipients > 0)
          .reduce((sum, an) => sum + (an.acknowledgedCount / an.totalRecipients) * 100, 0) /
        tenantAnnouncements.filter((an) => an.totalRecipients > 0).length
      )
    : 0;
  const criticalCount = tenantAnnouncements.filter((an) => an.urgency === 'critical').length;

  const statusLabel = (status: string) => {
    const locale = useAppStore.getState().locale as 'fr' | 'en';
    return contentStatusLabels[locale]?.[status] || status;
  };

  const getUrgencyLabel = (urgency: string): string => {
    switch (urgency) {
      case 'info': return t.announcements.info;
      case 'warning': return t.announcements.warning;
      case 'critical': return t.announcements.critical;
      default: return urgency;
    }
  };

  const getTargetAudienceLabel = (audience: string): string => {
    switch (audience) {
      case 'all': return t.announcements.allUsers;
      case 'tenant': return t.announcements.specificTenant;
      case 'role': return t.announcements.specificRole;
      default: return audience;
    }
  };

  const stats = [
    {
      title: t.announcements.title,
      value: totalAnnouncements,
      icon: Megaphone,
      gradient: 'from-[oklch(0.55_0.15_160/0.1)] via-[oklch(0.55_0.15_160/0.05)] to-transparent',
      iconBg: 'bg-[oklch(0.55_0.15_160/0.15)]',
      iconColor: 'text-[oklch(0.55_0.15_160)]',
      borderAccent: 'border-[oklch(0.55_0.15_160/0.2)]',
    },
    {
      title: t.announcements.published,
      value: publishedCount,
      icon: CheckCircle2,
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-600',
      borderAccent: 'border-emerald-500/20',
    },
    {
      title: t.announcements.acknowledged,
      value: `${ackRate}%`,
      icon: Shield,
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-600',
      borderAccent: 'border-amber-500/20',
    },
    {
      title: t.announcements.critical,
      value: criticalCount,
      icon: AlertCircle,
      gradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
      iconBg: 'bg-rose-500/15',
      iconColor: 'text-rose-600',
      borderAccent: 'border-rose-500/20',
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t.announcements.title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalAnnouncements} {t.announcements.title.toLowerCase()}
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.50_0.15_165)] hover:from-[oklch(0.50_0.15_160)] hover:to-[oklch(0.45_0.15_165)] shadow-sm shadow-[oklch(0.55_0.15_160/0.2)] text-white"
        >
          <Plus className="h-4 w-4" />
          {t.announcements.newAnnouncement}
        </Button>
      </div>

      {/* ─── Stats Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const IconComp = stat.icon;
          return (
            <motion.div key={i} variants={item}>
              <motion.div variants={cardHover} initial="rest" whileHover="hover" className="relative group">
                <Card className={cn('relative overflow-hidden border shadow-md hover:shadow-lg transition-shadow duration-300', stat.borderAccent)}>
                  <div className={cn('absolute inset-0 bg-gradient-to-br opacity-60 group-hover:opacity-100 transition-opacity duration-500', stat.gradient)} />
                  <CardContent className="relative p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-extrabold tracking-tight">{stat.value}</p>
                      </div>
                      <div className={cn('p-2 rounded-xl border border-white/10 shadow-sm', stat.iconBg)}>
                        <IconComp className={cn('h-4 w-4', stat.iconColor)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Search & Filters ───────────────────────────────────────────── */}
      <motion.div variants={item} className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.announcements.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1.5">
            {statusTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveStatus(tab)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                  activeStatus === tab
                    ? 'bg-[oklch(0.55_0.15_160)] text-white shadow-sm'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {tab === 'all' ? t.announcements.all : statusLabel(tab)}
              </button>
            ))}
          </div>
          <span className="text-muted-foreground/30 self-center">|</span>
          <div className="flex gap-1.5">
            {urgencyTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveUrgency(tab)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                  activeUrgency === tab
                    ? 'bg-[oklch(0.55_0.15_160)] text-white shadow-sm'
                    : tab === 'critical'
                    ? 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20'
                    : tab === 'warning'
                    ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                    : tab === 'info'
                    ? 'bg-teal-500/10 text-teal-600 hover:bg-teal-500/20'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {tab === 'all' ? t.announcements.all : getUrgencyLabel(tab)}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ─── Announcements List ──────────────────────────────────────────── */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredAnnouncements.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center bg-muted/50 mb-4">
                <Megaphone className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{t.announcements.noResults}</p>
            </motion.div>
          ) : (
            filteredAnnouncements.map((announcement, idx) => {
              const urgency = urgencyConfig[announcement.urgency];
              const UrgencyIcon = urgency.icon;
              const statusColor = contentStatusColors[announcement.status];
              const ackPercent = announcement.totalRecipients > 0
                ? Math.round((announcement.acknowledgedCount / announcement.totalRecipients) * 100)
                : 0;

              return (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ delay: idx * 0.04, duration: 0.3 }}
                >
                  <Card className={cn('group overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300', urgency.border)}>
                    <div className="flex">
                      {/* Urgency color strip */}
                      <div className={cn('w-1.5 flex-shrink-0', urgency.strip)} />

                      <CardContent className="flex-1 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                          {/* Icon */}
                          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', urgency.badgeBg, 'border', urgency.badgeBorder)}>
                            <UrgencyIcon className={cn('h-5 w-5', urgency.badgeText)} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="text-sm font-semibold group-hover:text-[oklch(0.55_0.15_160)] transition-colors">
                                {announcement.title}
                              </h3>
                              <Badge className={cn('text-[10px] px-2 py-0.5 font-medium border', urgency.badgeBg, urgency.badgeText, urgency.badgeBorder)}>
                                {getUrgencyLabel(announcement.urgency)}
                              </Badge>
                              <Badge className={cn('text-[10px] px-2 py-0.5 font-medium border', statusColor.bg, statusColor.text, statusColor.border)}>
                                {statusLabel(announcement.status)}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                              {announcement.excerpt}
                            </p>

                            {/* Audience + Acknowledgment */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Users className="h-3.5 w-3.5" />
                                <span>{getTargetAudienceLabel(announcement.targetAudience)}</span>
                              </div>
                              {announcement.totalRecipients > 0 && (
                                <div className="flex items-center gap-2 flex-1 max-w-xs">
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                    <span className="font-medium text-emerald-600">
                                      {announcement.acknowledgedCount}/{announcement.totalRecipients}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <Progress value={ackPercent} className="h-1.5" />
                                  </div>
                                  <span className="text-xs text-muted-foreground font-medium">{ackPercent}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
