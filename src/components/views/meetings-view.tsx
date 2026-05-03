'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Video,
  Clock,
  Users,
  Calendar,
  Plus,
  MapPin,
  CalendarDays,
  ChevronRight,
  Circle,
  CheckCircle2,
  XCircle,
  PlayCircle,
  CalendarClock,
  ExternalLink,
  Timer,
  Radio,
} from 'lucide-react';
import { mockMeetings, mockUsers, mockProjects } from '@/lib/mock-data';
import type { Meeting, MeetingStatus } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

// Helper functions
function getUserInitials(id: string) {
  const user = mockUsers.find((u) => u.id === id);
  return user ? user.name.split(' ').map((n: string) => n[0]).join('') : '??';
}

function getUserName(id: string) {
  return mockUsers.find((u) => u.id === id)?.name || 'Unknown';
}

function getUserAvatarColor(id: string) {
  const user = mockUsers.find((u) => u.id === id);
  return user
    ? `oklch(0.7 ${0.08 + (user.name.charCodeAt(0) % 5) * 0.02} ${140 + (user.name.charCodeAt(1) % 40)})`
    : undefined;
}

function getProjectById(id: string) {
  return mockProjects.find((p) => p.id === id);
}

function formatMeetingDate(dateStr: string, t: ReturnType<typeof useTranslation>['t']) {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) return t.meetings.today;
  if (isTomorrow) return t.meetings.tomorrow;
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatMeetingTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

// ─── Countdown Timer Hook ────────────────────────────────────────────────────
function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Starting now');
        return;
      }

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

// ─── Meeting Duration Bar ────────────────────────────────────────────────────
function MeetingDurationBar({ meeting }: { meeting: Meeting }) {
  const meetingDate = new Date(meeting.date);
  const meetingEnd = new Date(meetingDate.getTime() + meeting.duration * 60000);
  const now = new Date();

  if (meeting.status !== 'in_progress') return null;

  const totalDuration = meeting.duration * 60000; // in ms
  const elapsed = now.getTime() - meetingDate.getTime();
  const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-muted-foreground font-medium">Progress</span>
        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[9px] text-muted-foreground">{formatMeetingTime(meeting.date)}</span>
        <span className="text-[9px] text-muted-foreground">{formatMeetingTime(meetingEnd.toISOString())}</span>
      </div>
    </div>
  );
}

// Status configuration with gradient border colors
const statusConfig: Record<
  MeetingStatus,
  { label: string; color: string; bg: string; borderGradient: string; icon: React.ReactNode; dotColor: string }
> = {
  scheduled: {
    label: 'Scheduled',
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-500/10 border-teal-200 dark:border-teal-800',
    borderGradient: 'from-teal-400 to-teal-600',
    icon: <CalendarClock className="h-3 w-3" />,
    dotColor: 'bg-teal-500',
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10 border-amber-200 dark:border-amber-800',
    borderGradient: 'from-amber-400 to-amber-600',
    icon: <PlayCircle className="h-3 w-3" />,
    dotColor: 'bg-amber-500',
  },
  completed: {
    label: 'Completed',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-200 dark:border-emerald-800',
    borderGradient: 'from-emerald-400 to-emerald-600',
    icon: <CheckCircle2 className="h-3 w-3" />,
    dotColor: 'bg-emerald-500',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-500 dark:text-red-400',
    bg: 'bg-red-500/10 border-red-200 dark:border-red-800',
    borderGradient: 'from-red-400 to-red-600',
    icon: <XCircle className="h-3 w-3" />,
    dotColor: 'bg-red-500',
  },
};

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

// Meeting card component with gradient left border
function MeetingCard({ meeting, t }: { meeting: Meeting; t: ReturnType<typeof useTranslation>['t'] }) {
  const status = statusConfig[meeting.status];
  const project = meeting.projectId ? getProjectById(meeting.projectId) : null;

  return (
    <motion.div variants={item}>
      <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden relative dark-card-glow">
        {/* Gradient left border */}
        <div className={cn('absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b', status.borderGradient)} />

        <CardContent className="p-4 sm:p-5 pl-5 sm:pl-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            {/* Left: Meeting info */}
            <div className="flex-1 min-w-0">
              {/* Title row */}
              <div className="flex items-start gap-2 mb-2">
                <h3 className="text-sm font-bold leading-snug">
                  {meeting.title}
                </h3>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] px-1.5 py-0 font-medium shrink-0',
                    status.bg,
                    status.color
                  )}
                >
                  <span className="mr-1 inline-flex">{status.icon}</span>
                  {status.label}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {meeting.description}
              </p>

              {/* Details row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatMeetingDate(meeting.date, t)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {formatMeetingTime(meeting.date)} ·{' '}
                    {formatDuration(meeting.duration)}
                  </span>
                </div>
                {project && (
                  <div className="flex items-center gap-1.5">
                    <Circle
                      className="h-2.5 w-2.5"
                      style={{ fill: project.color, color: project.color }}
                    />
                    <span>{project.name}</span>
                  </div>
                )}
                {meeting.link && (
                  <div className="flex items-center gap-1.5 text-[oklch(0.55_0.15_160)]">
                    <ExternalLink className="h-3 w-3" />
                    <span className="underline decoration-dotted">Meeting Link</span>
                  </div>
                )}
              </div>

              {/* Attendees */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex -space-x-2">
                  {meeting.attendees.slice(0, 5).map((id) => (
                    <Avatar
                      key={id}
                      className="h-7 w-7 border-2 border-background shadow-sm"
                    >
                      <AvatarFallback
                        className="text-[8px] font-semibold"
                        style={{ backgroundColor: getUserAvatarColor(id) }}
                      >
                        {getUserInitials(id)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                {meeting.attendees.length > 5 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{meeting.attendees.length - 5} more
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 ml-auto">
                  <Users className="h-3 w-3" />
                  {meeting.attendees.length}
                </span>
              </div>

              {/* Duration bar for in-progress meetings */}
              <MeetingDurationBar meeting={meeting} />
            </div>

            {/* Right: Action button */}
            <div className="flex items-center gap-2 sm:flex-col sm:items-end shrink-0">
              {meeting.status === 'in_progress' && (
                <Button
                  size="sm"
                  className={cn(
                    'h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm relative overflow-hidden'
                  )}
                >
                  {/* Enhanced pulse animation with double ring */}
                  <span className="absolute inset-0 rounded-md animate-ping bg-emerald-400/20" />
                  <span className="absolute inset-0 rounded-md animate-pulse bg-emerald-400/10" />
                  <Video className="h-3.5 w-3.5 mr-1.5 relative z-10" />
                  <span className="relative z-10">{t.meetings.joinNow}</span>
                </Button>
              )}
              {meeting.status === 'scheduled' && (
                <Button
                  size="sm"
                  className="h-9 text-xs bg-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.48_0.15_160)] text-white shadow-sm"
                >
                  <Video className="h-3.5 w-3.5 mr-1.5" />
                  {t.meetings.join}
                </Button>
              )}
              {meeting.status === 'completed' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs"
                >
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  {t.meetings.notes}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Timeline item component with connecting lines
function TimelineItem({
  meeting,
  isFirst,
  isLast,
  t,
}: {
  meeting: Meeting;
  isFirst: boolean;
  isLast: boolean;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const status = statusConfig[meeting.status];
  const project = meeting.projectId ? getProjectById(meeting.projectId) : null;

  return (
    <motion.div
      variants={item}
      className="flex gap-3 sm:gap-4"
    >
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center shrink-0 w-12">
        <div className="flex flex-col items-center">
          {/* Time label */}
          <span className="text-[10px] font-semibold text-muted-foreground mb-1">
            {formatMeetingTime(meeting.date)}
          </span>
          <div
            className={cn(
              'h-4 w-4 rounded-full border-3 border-background shrink-0 z-10 shadow-sm ring-2',
              meeting.status === 'in_progress' ? 'ring-amber-500/30' :
              meeting.status === 'scheduled' ? 'ring-teal-500/30' :
              meeting.status === 'completed' ? 'ring-emerald-500/30' :
              'ring-red-500/30',
              status.dotColor
            )}
          />
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gradient-to-b from-border to-transparent mt-1" />
        )}
      </div>

      {/* Content */}
      <div className={cn('flex-1 min-w-0 pb-5', isLast && 'pb-0')}>
        <div className={cn(
          'flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl hover:bg-muted/30 transition-all duration-150 border border-transparent hover:border-border/50',
        )}>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-semibold truncate">{meeting.title}</h4>
              <Badge
                variant="outline"
                className={cn(
                  'text-[9px] px-1.5 py-0 font-medium shrink-0',
                  status.bg,
                  status.color
                )}
              >
                {status.label}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(meeting.duration)}
              </span>
              {project && (
                <span className="flex items-center gap-1">
                  <Circle
                    className="h-2 w-2"
                    style={{ fill: project.color, color: project.color }}
                  />
                  {project.name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {meeting.attendees.length}
              </span>
            </div>

            {/* Duration bar for in-progress timeline items */}
            <MeetingDurationBar meeting={meeting} />
          </div>

          {meeting.status === 'in_progress' ? (
            <Button
              size="sm"
              className="h-8 text-[11px] shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white relative overflow-hidden"
            >
              <span className="absolute inset-0 rounded-md animate-ping bg-emerald-400/20" />
              <span className="absolute inset-0 rounded-md animate-pulse bg-emerald-400/10" />
              <Video className="h-3 w-3 mr-1 relative z-10" />
              <span className="relative z-10">{t.meetings.joinNow}</span>
            </Button>
          ) : meeting.status === 'scheduled' ? (
            <Button
              size="sm"
              className="h-8 text-[11px] shrink-0 bg-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.48_0.15_160)] text-white"
            >
              <Video className="h-3 w-3 mr-1" />
              {t.meetings.join}
            </Button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Countdown Header ────────────────────────────────────────────────────────
function NextMeetingCountdown() {
  const nextMeeting = useMemo(() => {
    return mockMeetings
      .filter((m) => m.status === 'scheduled' || m.status === 'in_progress')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }, []);

  const meetingDate = nextMeeting ? new Date(nextMeeting.date) : new Date();
  const timeLeft = useCountdown(meetingDate);

  if (!nextMeeting) return null;

  const isStartingSoon = meetingDate.getTime() - Date.now() < 300000; // 5 min

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 rounded-xl border',
        nextMeeting.status === 'in_progress'
          ? 'bg-amber-500/5 border-amber-500/15'
          : isStartingSoon
          ? 'bg-emerald-500/5 border-emerald-500/15'
          : 'bg-muted/30 border-border',
      )}
    >
      <div className={cn(
        'p-1.5 rounded-lg',
        nextMeeting.status === 'in_progress'
          ? 'bg-amber-500/15'
          : 'bg-[oklch(0.55_0.15_160/0.1)]',
      )}>
        {nextMeeting.status === 'in_progress' ? (
          <Radio className="h-4 w-4 text-amber-500 animate-countdown-pulse" />
        ) : (
          <Timer className="h-4 w-4 text-[oklch(0.55_0.15_160)]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold truncate">{nextMeeting.title}</p>
          {nextMeeting.status === 'in_progress' && (
            <Badge className="text-[8px] px-1.5 py-0 h-4 bg-amber-500/15 text-amber-600 border-amber-500/15 font-bold">
              LIVE
            </Badge>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {nextMeeting.status === 'in_progress' ? 'In progress · ' : 'Starts in '}
          <span className={cn(
            'font-bold font-mono',
            isStartingSoon && 'text-emerald-600 dark:text-emerald-400',
          )}>
            {timeLeft}
          </span>
        </p>
      </div>
      {nextMeeting.status === 'in_progress' ? (
        <Button
          size="sm"
          className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white relative overflow-hidden shrink-0"
        >
          <span className="absolute inset-0 rounded-md animate-ping bg-emerald-400/20" />
          <Video className="h-3 w-3 mr-1 relative z-10" />
          <span className="relative z-10">Quick Join</span>
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-[10px] shrink-0 hover:bg-[oklch(0.55_0.15_160/0.05)] hover:border-[oklch(0.55_0.15_160/0.3)]"
        >
          <Clock className="h-3 w-3 mr-1" />
          {formatMeetingTime(nextMeeting.date)}
        </Button>
      )}
    </motion.div>
  );
}

export function MeetingsView() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('upcoming');
  const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('cards');

  // Filter meetings by tab
  const filteredMeetings = useMemo(() => {
    const sorted = [...mockMeetings].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    switch (activeTab) {
      case 'upcoming':
        return sorted.filter(
          (m) => m.status === 'scheduled' || m.status === 'in_progress'
        );
      case 'past':
        return sorted.filter(
          (m) => m.status === 'completed' || m.status === 'cancelled'
        );
      default:
        return sorted;
    }
  }, [activeTab]);

  // Group meetings by date for timeline
  const groupedMeetings = useMemo(() => {
    const groups: Record<string, Meeting[]> = {};
    filteredMeetings.forEach((meeting) => {
      const dateKey = formatMeetingDate(meeting.date, t);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(meeting);
    });
    return groups;
  }, [filteredMeetings, t]);

  // Stats
  const upcomingCount = mockMeetings.filter(
    (m) => m.status === 'scheduled' || m.status === 'in_progress'
  ).length;
  const totalMeetings = mockMeetings.length;
  const inProgressCount = mockMeetings.filter(m => m.status === 'in_progress').length;

  return (
    <div className="space-y-4">
      {/* Next Meeting Countdown */}
      <NextMeetingCountdown />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{t.meetings.title}</h2>
          <p className="text-sm text-muted-foreground">
            {totalMeetings} {t.meetings.title.toLowerCase()} · {upcomingCount} {t.meetings.upcoming.toLowerCase()}
            {inProgressCount > 0 && (
              <span className="text-amber-600 dark:text-amber-400 font-medium"> · {inProgressCount} {t.meetings.inProgress.toLowerCase()}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as 'cards' | 'timeline')}
          >
            <TabsList className="h-8">
              <TabsTrigger value="cards" className="text-xs px-2.5">
                <CalendarDays className="h-3.5 w-3.5 mr-1" /> {t.meetings.cards}
              </TabsTrigger>
              <TabsTrigger value="timeline" className="text-xs px-2.5">
                <Clock className="h-3.5 w-3.5 mr-1" /> {t.meetings.timeline}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            size="sm"
            className="h-8 bg-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.48_0.15_160)] text-white shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> {t.meetings.scheduleMeeting}
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-9">
          <TabsTrigger value="upcoming" className="text-xs px-4">
            {t.meetings.upcoming}
            {upcomingCount > 0 && (
              <Badge className="ml-1.5 h-4 min-w-[16px] px-1 text-[9px] bg-[oklch(0.55_0.15_160)] text-white">
                {upcomingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past" className="text-xs px-4">
            {t.meetings.past}
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs px-4">
            {t.meetings.all}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content */}
      <AnimatePresence mode="wait">
        {filteredMeetings.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16 text-muted-foreground"
          >
            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <Video className="h-8 w-8 opacity-30" />
            </div>
            <p className="text-sm font-medium">No meetings found</p>
            <p className="text-xs mt-1">
              {activeTab === 'upcoming'
                ? 'No upcoming meetings scheduled'
                : activeTab === 'past'
                ? 'No past meetings to show'
                : 'Schedule a meeting to get started'}
            </p>
          </motion.div>
        ) : viewMode === 'cards' ? (
          <motion.div
            key={`cards-${activeTab}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
              {filteredMeetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} t={t} />
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key={`timeline-${activeTab}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-1">
              {Object.entries(groupedMeetings).map(
                ([dateLabel, meetings], groupIdx) => (
                  <div key={dateLabel} className={groupIdx > 0 ? 'mt-6' : ''}>
                    {/* Date header */}
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {dateLabel}
                      </span>
                      <Separator className="flex-1" />
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {meetings.length}
                      </Badge>
                    </div>

                    {/* Timeline items */}
                    <motion.div
                      variants={container}
                      initial="hidden"
                      animate="show"
                    >
                      {meetings.map((meeting, idx) => (
                        <TimelineItem
                          key={meeting.id}
                          meeting={meeting}
                          isFirst={idx === 0}
                          isLast={idx === meetings.length - 1}
                          t={t}
                        />
                      ))}
                    </motion.div>
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
