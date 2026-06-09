'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  Flag,
  Eye,
  FileText,
  Users,
  Target,
  Circle,
} from 'lucide-react';
import { mockCalendarEvents } from '@/lib/mock-data';
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

// ─── Event Type Config ───────────────────────────────────────────────────────
const eventTypeConfig: Record<string, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ElementType;
}> = {
  deadline: {
    label: 'deadline',
    color: '#ef4444',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
    icon: Flag,
  },
  publication: {
    label: 'publication',
    color: '#10b981',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    icon: FileText,
  },
  review: {
    label: 'review',
    color: '#f59e0b',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    icon: Eye,
  },
  meeting: {
    label: 'meeting',
    color: '#8b5cf6',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    icon: Users,
  },
  campaign: {
    label: 'campaign',
    color: '#06b6d4',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    icon: Target,
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isToday(year: number, month: number, day: number): boolean {
  const today = new Date();
  return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
}

function isSameDay(dateStr: string, year: number, month: number, day: number): boolean {
  const d = new Date(dateStr);
  return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function EditorialCalendarView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const locale = useAppStore((s) => s.locale);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  // Filter events by tenant
  const tenantEvents = useMemo(
    () => mockCalendarEvents.filter((ev) => ev.tenantId === activeTenantId),
    [activeTenantId]
  );

  // Get events for a specific day
  const getEventsForDay = useCallback(
    (day: number) => {
      return tenantEvents.filter((ev) => isSameDay(ev.date, currentYear, currentMonth, day));
    },
    [tenantEvents, currentYear, currentMonth]
  );

  // Selected day events
  const selectedDayEvents = useMemo(() => {
    if (selectedDay === null) return [];
    return getEventsForDay(selectedDay);
  }, [selectedDay, getEventsForDay]);

  // Upcoming deadlines
  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    return tenantEvents
      .filter((ev) => ev.type === 'deadline' && new Date(ev.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [tenantEvents]);

  // Calendar grid
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  // Adjust for Monday start (0=Mon, 6=Sun)
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

  // Month name
  const monthName = new Date(currentYear, currentMonth).toLocaleDateString(
    locale === 'fr' ? 'fr-FR' : 'en-US',
    { month: 'long', year: 'numeric' }
  );

  // Navigation
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDay(today.getDate());
  };

  // Week days
  const weekDays = locale === 'fr'
    ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getEventTypeLabel = (type: string): string => {
    switch (type) {
      case 'deadline': return t.editorialCalendar.deadline;
      case 'publication': return t.editorialCalendar.publication;
      case 'review': return t.editorialCalendar.review;
      case 'meeting': return t.editorialCalendar.meeting;
      case 'campaign': return t.editorialCalendar.campaign;
      default: return type;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      locale === 'fr' ? 'fr-FR' : 'en-US',
      { day: 'numeric', month: 'short' }
    );
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t.editorialCalendar.title}</h2>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={goToToday}
          className="gap-1.5 border-[oklch(0.55_0.15_160/0.3)] text-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.55_0.15_160/0.05)]"
        >
          <CalendarDays className="h-4 w-4" />
          {t.editorialCalendar.jumpToToday}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ─── Calendar Grid ─────────────────────────────────────────────── */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="overflow-hidden border shadow-md">
            <CardContent className="p-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPreviousMonth}
                  className="h-8 w-8 p-0 hover:bg-[oklch(0.55_0.15_160/0.05)]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-base font-bold capitalize">{monthName}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNextMonth}
                  className="h-8 w-8 p-0 hover:bg-[oklch(0.55_0.15_160/0.05)]"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Week Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-[10px] font-semibold text-muted-foreground py-1.5 uppercase">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for offset */}
                {Array.from({ length: adjustedFirstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
                  const day = dayIndex + 1;
                  const dayEvents = getEventsForDay(day);
                  const todayHighlight = isToday(currentYear, currentMonth, day);
                  const isSelected = selectedDay === day;

                  return (
                    <motion.button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        'aspect-square rounded-lg flex flex-col items-center justify-center text-xs relative transition-all duration-200 border',
                        isSelected
                          ? 'bg-[oklch(0.55_0.15_160)] text-white border-[oklch(0.55_0.15_160)] shadow-md'
                          : todayHighlight
                          ? 'bg-[oklch(0.55_0.15_160/0.1)] border-[oklch(0.55_0.15_160/0.3)] text-[oklch(0.55_0.15_160)] font-bold'
                          : 'border-transparent hover:bg-muted/50 hover:border-border'
                      )}
                    >
                      <span className={cn(
                        'text-xs',
                        !isSelected && dayEvents.length > 0 && 'font-semibold'
                      )}>
                        {day}
                      </span>
                      {/* Event dots */}
                      {dayEvents.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5">
                          {dayEvents.slice(0, 3).map((ev, i) => (
                            <div
                              key={i}
                              className="w-1 h-1 rounded-full"
                              style={{
                                backgroundColor: isSelected ? 'white' : ev.color,
                              }}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <div className={cn(
                              'w-1 h-1 rounded-full',
                              isSelected ? 'bg-white/60' : 'bg-muted-foreground/40'
                            )} />
                          )}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/50 flex-wrap">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                  {t.editorialCalendar.legend}
                </span>
                {Object.entries(eventTypeConfig).map(([type, conf]) => (
                  <div key={type} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: conf.color }}
                    />
                    <span className="text-[10px] text-muted-foreground">{getEventTypeLabel(type)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Side Panel ────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Events for Selected Day */}
          <motion.div variants={item}>
            <Card className="overflow-hidden border shadow-md">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold">
                  {selectedDay !== null
                    ? `${t.editorialCalendar.eventsFor} ${selectedDay} ${monthName.split(' ')[0]}`
                    : t.editorialCalendar.title}
                </CardTitle>
                {selectedDayEvents.length > 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    {selectedDayEvents.length} {t.editorialCalendar.events}
                  </p>
                )}
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {selectedDay === null ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    {locale === 'fr' ? 'Sélectionnez un jour pour voir les événements' : 'Select a day to see events'}
                  </p>
                ) : selectedDayEvents.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    {t.editorialCalendar.noEvents}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedDayEvents.map((event, idx) => {
                      const typeConf = eventTypeConfig[event.type] || eventTypeConfig.deadline;
                      const TypeIcon = typeConf.icon;
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05, duration: 0.2 }}
                          className={cn(
                            'flex items-start gap-2.5 p-2.5 rounded-lg border transition-all hover:shadow-sm cursor-pointer',
                            typeConf.bgColor,
                            typeConf.borderColor
                          )}
                        >
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: event.color + '20', color: event.color }}
                          >
                            <TypeIcon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{event.title}</p>
                            <p className="text-[10px] text-muted-foreground">{getEventTypeLabel(event.type)}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Deadlines */}
          <motion.div variants={item}>
            <Card className="overflow-hidden border shadow-md">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/15">
                    <Clock className="h-3.5 w-3.5 text-rose-500" />
                  </div>
                  <CardTitle className="text-sm font-semibold">
                    {t.editorialCalendar.upcomingDeadlines}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {upcomingDeadlines.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    {locale === 'fr' ? 'Aucune échéance à venir' : 'No upcoming deadlines'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {upcomingDeadlines.map((deadline, idx) => (
                      <motion.div
                        key={deadline.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                      >
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: deadline.color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{deadline.title}</p>
                          <p className="text-[10px] text-muted-foreground">{formatDate(deadline.date)}</p>
                        </div>
                        <Badge className="text-[9px] px-1.5 py-0.5 bg-rose-500/10 text-rose-600 border-rose-500/20">
                          {getEventTypeLabel(deadline.type)}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
