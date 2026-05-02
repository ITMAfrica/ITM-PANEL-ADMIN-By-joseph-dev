'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Flag,
  Bell,
  Target,
  Users,
} from 'lucide-react';
import { mockCalendarEvents, mockProjects } from '@/lib/mock-data';
import type { CalendarEvent } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO,
} from 'date-fns';

// Event type configuration
const eventTypeConfig: Record<CalendarEvent['type'], { label: string; color: string; bg: string; dotColor: string; icon: React.ReactNode }> = {
  deadline: {
    label: 'Deadline',
    color: 'text-red-600',
    bg: 'bg-red-500/10 border-red-200',
    dotColor: 'bg-red-500',
    icon: <Flag className="h-3.5 w-3.5" />,
  },
  meeting: {
    label: 'Meeting',
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10 border-emerald-200',
    dotColor: 'bg-emerald-500',
    icon: <Users className="h-3.5 w-3.5" />,
  },
  milestone: {
    label: 'Milestone',
    color: 'text-purple-600',
    bg: 'bg-purple-500/10 border-purple-200',
    dotColor: 'bg-purple-500',
    icon: <Target className="h-3.5 w-3.5" />,
  },
  reminder: {
    label: 'Reminder',
    color: 'text-amber-600',
    bg: 'bg-amber-500/10 border-amber-200',
    dotColor: 'bg-amber-500',
    icon: <Bell className="h-3.5 w-3.5" />,
  },
};

function getProjectName(id?: string) {
  if (!id) return null;
  return mockProjects.find((p) => p.id === id)?.name || null;
}

function getProjectColor(id?: string) {
  if (!id) return null;
  return mockProjects.find((p) => p.id === id)?.color || null;
}

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

function CalendarDayCell({
  day,
  events,
  isCurrentMonth,
  isSelected,
  isTodayDate,
  onSelect,
}: {
  day: Date;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
  isSelected: boolean;
  isTodayDate: boolean;
  onSelect: (day: Date) => void;
}) {
  // Get unique event types for dots
  const eventTypes = [...new Set(events.map((e) => e.type))];

  return (
    <button
      onClick={() => onSelect(day)}
      className={cn(
        'relative flex flex-col items-center justify-start p-1.5 sm:p-2 min-h-[60px] sm:min-h-[80px] rounded-lg transition-all duration-150 text-left w-full',
        'hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20',
        !isCurrentMonth && 'opacity-30',
        isSelected && 'bg-primary/10 ring-2 ring-primary/20',
        isTodayDate && !isSelected && 'bg-emerald-500/5',
      )}
    >
      <span
        className={cn(
          'text-xs sm:text-sm font-medium flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full',
          isTodayDate && 'bg-emerald-500 text-white',
          isSelected && !isTodayDate && 'bg-primary text-primary-foreground',
        )}
      >
        {format(day, 'd')}
      </span>

      {/* Event dots */}
      {eventTypes.length > 0 && (
        <div className="flex items-center gap-0.5 mt-1 flex-wrap justify-center">
          {eventTypes.slice(0, 3).map((type) => (
            <span
              key={type}
              className={cn('w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full', eventTypeConfig[type].dotColor)}
            />
          ))}
          {eventTypes.length > 3 && (
            <span className="text-[8px] text-muted-foreground">+</span>
          )}
        </div>
      )}
    </button>
  );
}

function EventCard({ event }: { event: CalendarEvent }) {
  const config = eventTypeConfig[event.type];
  const projectName = getProjectName(event.projectId);
  const projectColor = getProjectColor(event.projectId);

  return (
    <motion.div variants={item}>
      <div className="group p-3 rounded-xl border hover:shadow-sm transition-all cursor-pointer">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'p-2 rounded-lg shrink-0',
              config.bg.replace('border-', 'bg-').split(' ')[0],
            )}
          >
            <span className={config.color}>{config.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-medium truncate">{event.title}</h4>
              <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0 shrink-0 font-medium', config.bg, config.color)}>
                {config.label}
              </Badge>
            </div>

            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <CalendarIcon className="h-3 w-3" />
                {format(parseISO(event.date), 'MMM d, yyyy')}
              </div>
              {event.endDate && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {format(parseISO(event.date), 'h:mm a')} – {format(parseISO(event.endDate), 'h:mm a')}
                </div>
              )}
            </div>

            {projectName && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: projectColor || '#10b981' }}
                />
                <span className="text-[10px] text-muted-foreground">{projectName}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return mockCalendarEvents.filter((event) => {
      const eventDate = parseISO(event.date);
      return isSameDay(eventDate, day);
    });
  };

  // Selected day events
  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  // Total events for current month view
  const monthEvents = useMemo(() => {
    return mockCalendarEvents.filter((event) => {
      const eventDate = parseISO(event.date);
      return isSameMonth(eventDate, currentMonth);
    });
  }, [currentMonth]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Calendar</h2>
          <p className="text-sm text-muted-foreground">
            {monthEvents.length} events this month
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => {
              setCurrentMonth(new Date());
              setSelectedDay(new Date());
            }}
          >
            Today
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold min-w-[140px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(eventTypeConfig).map(([type, config]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className={cn('w-2.5 h-2.5 rounded-full', config.dotColor)} />
            <span className="text-xs text-muted-foreground">{config.label}</span>
          </div>
        ))}
      </div>

      {/* Main content: Calendar + Side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-[10px] sm:text-xs font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const dayEvents = getEventsForDay(day);
                return (
                  <CalendarDayCell
                    key={day.toISOString()}
                    day={day}
                    events={dayEvents}
                    isCurrentMonth={isSameMonth(day, currentMonth)}
                    isSelected={selectedDay ? isSameDay(day, selectedDay) : false}
                    isTodayDate={isToday(day)}
                    onSelect={setSelectedDay}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Side Panel: Events for selected day */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                {selectedDay
                  ? format(selectedDay, 'EEEE, MMM d')
                  : 'Select a day'}
              </CardTitle>
              {selectedDayEvents.length > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {selectedDayEvents.length}
                </Badge>
              )}
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-3">
            <AnimatePresence mode="wait">
              {selectedDayEvents.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8 text-muted-foreground"
                >
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-medium">No events</p>
                  <p className="text-[10px] mt-1">No events scheduled for this day</p>
                </motion.div>
              ) : (
                <motion.div
                  key="events"
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-2.5 max-h-[calc(100vh-300px)] overflow-y-auto"
                >
                  {selectedDayEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
