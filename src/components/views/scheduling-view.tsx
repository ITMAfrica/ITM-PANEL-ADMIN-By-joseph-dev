'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock,
  Calendar as CalendarIcon,
  Plus,
  MoreHorizontal,
  Pencil,
  CalendarClock,
  XCircle,
  Mail,
  FileText,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  Timer,
  ArrowRight,
} from 'lucide-react';
import {
  mockNewsletters,
  mockArticles,
  mockAnnouncements,
  mockChannels,
  getUserName,
  contentStatusColors,
  contentStatusLabels,
} from '@/lib/mock-data';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import type { ContentItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Animation ───────────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getTypeIcon(type: string) {
  switch (type) {
    case 'newsletter': return Mail;
    case 'article': return FileText;
    case 'announcement': return Megaphone;
    default: return FileText;
  }
}

function formatCountdown(targetDate: string): string {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return 'Maintenant';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}j ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getChannelNames(channelIds: string[]): string[] {
  return channelIds.map(id => mockChannels.find(c => c.id === id)?.name || id);
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function SchedulingView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const [view, setView] = useState<'calendar' | 'queue'>('queue');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Combine all scheduled content for active tenant
  const scheduledContent = useMemo(() => {
    const all: (ContentItem & { channelIds?: string[] })[] = [
      ...mockNewsletters.filter(n => n.status === 'scheduled' && n.tenantId === activeTenantId),
      ...mockArticles.filter(a => a.status === 'scheduled' && a.tenantId === activeTenantId),
      ...mockAnnouncements.filter(a => a.status === 'scheduled' && a.tenantId === activeTenantId),
    ];
    return all.sort((a, b) => {
      const dateA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Infinity;
      const dateB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Infinity;
      return dateA - dateB;
    });
  }, [activeTenantId]);

  // Stats
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndStr = weekEnd.toISOString().split('T')[0];

  const scheduledToday = scheduledContent.filter(c => {
    if (!c.scheduledAt) return false;
    const d = c.scheduledAt.split('T')[0];
    return d === todayStr;
  }).length;

  const scheduledThisWeek = scheduledContent.filter(c => {
    if (!c.scheduledAt) return false;
    const d = c.scheduledAt.split('T')[0];
    return d >= todayStr && d <= weekEndStr;
  }).length;

  const nextScheduled = scheduledContent.find(c => c.scheduledAt && new Date(c.scheduledAt) > today);

  // Calendar logic
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday start
  const daysInMonth = lastDay.getDate();
  const monthName = firstDay.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const calendarDays = useMemo(() => {
    const days: { date: number; isCurrentMonth: boolean; items: typeof scheduledContent }[] = [];
    // Previous month padding
    const prevLastDay = new Date(year, month, 0).getDate();
    for (let i = startPad - 1; i >= 0; i--) {
      days.push({ date: prevLastDay - i, isCurrentMonth: false, items: [] });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const itemsForDay = scheduledContent.filter(c => c.scheduledAt?.startsWith(dateStr));
      days.push({ date: d, isCurrentMonth: true, items: itemsForDay });
    }
    // Next month padding
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: d, isCurrentMonth: false, items: [] });
    }
    return days;
  }, [year, month, startPad, daysInMonth, scheduledContent]);

  const statusLabel = (status: string) => {
    const locale = t === ({} as any) ? 'fr' : 'fr';
    return contentStatusLabels[locale]?.[status] || contentStatusLabels.fr[status] || status;
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t.scheduling.title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gérez vos envois planifiés et planifiez de nouvelles publications
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.50_0.15_165)] hover:from-[oklch(0.50_0.15_160)] hover:to-[oklch(0.45_0.15_165)] shadow-sm shadow-[oklch(0.55_0.15_160/0.2)] text-white"
        >
          <Plus className="h-4 w-4" />
          Planifier un envoi
        </Button>
      </div>

      {/* ─── Stats ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Planifiés aujourd'hui",
            value: scheduledToday,
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
          },
          {
            label: 'Cette semaine',
            value: scheduledThisWeek,
            icon: CalendarIcon,
            color: 'text-teal-600',
            bg: 'bg-teal-500/10',
            border: 'border-teal-500/20',
          },
          {
            label: 'Prochain envoi',
            value: nextScheduled ? new Date(nextScheduled.scheduledAt!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—',
            icon: Timer,
            color: 'text-emerald-600',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} variants={item}>
              <Card className={cn('overflow-hidden border', stat.border)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn('p-2.5 rounded-xl', stat.bg)}>
                    <Icon className={cn('h-5 w-5', stat.color)} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ─── View Toggle ─────────────────────────────────────────────────── */}
      <Tabs value={view} onValueChange={(v) => setView(v as 'calendar' | 'queue')}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="queue" className="gap-1.5 text-xs">
            <Clock className="h-3.5 w-3.5" /> {t.scheduling.queue}
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-1.5 text-xs">
            <CalendarIcon className="h-3.5 w-3.5" /> {t.scheduling.calendar}
          </TabsTrigger>
        </TabsList>

        {/* ─── Queue View ──────────────────────────────────────────────────── */}
        <TabsContent value="queue" className="mt-4">
          {scheduledContent.length === 0 ? (
            <motion.div variants={item}>
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center py-12 gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center">
                    <Clock className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">{t.scheduling.noScheduled}</p>
                  <Button size="sm" variant="outline" className="gap-1.5 mt-1">
                    <Plus className="h-3.5 w-3.5" /> Planifier un envoi
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {scheduledContent.map((content, idx) => {
                  const TypeIcon = getTypeIcon(content.type);
                  const channels = 'channelIds' in content ? getChannelNames((content as any).channelIds || []) : [];
                  const statusColor = contentStatusColors[content.status] || contentStatusColors.draft;

                  return (
                    <motion.div
                      key={content.id}
                      variants={item}
                      initial="hidden"
                      animate="show"
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="overflow-hidden border hover:shadow-md transition-all duration-200 group">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            {/* Type Icon */}
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[oklch(0.55_0.15_160/0.15)] to-[oklch(0.55_0.15_160/0.05)] border border-[oklch(0.55_0.15_160/0.2)] flex items-center justify-center flex-shrink-0">
                              <TypeIcon className="h-5 w-5 text-[oklch(0.55_0.15_160)]" />
                            </div>

                            {/* Content Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-semibold truncate">{content.title}</h3>
                                <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', statusColor.bg, statusColor.text, statusColor.border)}>
                                  {statusLabel(content.status)}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                                  {content.type}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <CalendarClock className="h-3 w-3" />
                                  {content.scheduledAt ? new Date(content.scheduledAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-amber-500" />
                                  <span className="font-medium text-amber-600">{content.scheduledAt ? formatCountdown(content.scheduledAt) : '—'}</span>
                                </span>
                                <span>par {getUserName(content.authorId)}</span>
                              </div>
                              {channels.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {channels.map(ch => (
                                    <Badge key={ch} variant="secondary" className="text-[10px] px-1.5 py-0">
                                      {ch}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <CalendarClock className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600">
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        {/* ─── Calendar View ───────────────────────────────────────────────── */}
        <TabsContent value="calendar" className="mt-4">
          <motion.div variants={item}>
            <Card className="overflow-hidden border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <CardTitle className="text-sm font-semibold capitalize">{monthName}</CardTitle>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => setCurrentMonth(new Date())}>
                    Aujourd&apos;hui
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                    <div key={day} className="text-center text-[10px] font-medium text-muted-foreground py-1">
                      {day}
                    </div>
                  ))}
                </div>
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, idx) => {
                    const isToday = day.isCurrentMonth && day.date === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                    return (
                      <div
                        key={idx}
                        className={cn(
                          'min-h-[72px] p-1.5 rounded-lg border text-xs transition-colors',
                          day.isCurrentMonth ? 'bg-background border-border/50' : 'bg-muted/20 border-transparent',
                          isToday && 'border-[oklch(0.55_0.15_160)] ring-1 ring-[oklch(0.55_0.15_160/0.2)]',
                          day.items.length > 0 && day.isCurrentMonth && 'bg-[oklch(0.55_0.15_160/0.02)]',
                        )}
                      >
                        <div className={cn(
                          'flex items-center justify-center w-6 h-6 rounded-full text-[11px] mb-0.5',
                          isToday ? 'bg-[oklch(0.55_0.15_160)] text-white font-bold' : 'text-muted-foreground font-medium',
                        )}>
                          {day.date}
                        </div>
                        <div className="space-y-0.5 max-h-[48px] overflow-hidden">
                          {day.items.slice(0, 2).map(content => {
                            const TypeIcon = getTypeIcon(content.type);
                            return (
                              <div
                                key={content.id}
                                className="flex items-center gap-1 px-1 py-0.5 rounded bg-[oklch(0.55_0.15_160/0.1)] text-[oklch(0.55_0.15_160)] truncate"
                              >
                                <TypeIcon className="h-2.5 w-2.5 flex-shrink-0" />
                                <span className="truncate text-[10px] font-medium">{content.title}</span>
                              </div>
                            );
                          })}
                          {day.items.length > 2 && (
                            <div className="text-[10px] text-muted-foreground text-center">
                              +{day.items.length - 2}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
