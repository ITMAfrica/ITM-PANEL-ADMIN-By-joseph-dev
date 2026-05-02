'use client';

import { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { mockMeetings, mockUsers, mockProjects } from '@/lib/mock-data';
import type { Meeting, MeetingStatus } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Helper functions
function getUserInitials(id: string) {
  const user = mockUsers.find((u) => u.id === id);
  return user ? user.name.split(' ').map((n) => n[0]).join('') : '??';
}

function getUserName(id: string) {
  return mockUsers.find((u) => u.id === id)?.name || 'Unknown';
}

function getProjectById(id: string) {
  return mockProjects.find((p) => p.id === id);
}

function formatMeetingDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) return 'Today';
  if (isTomorrow) return 'Tomorrow';
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

// Status configuration
const statusConfig: Record<
  MeetingStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  scheduled: {
    label: 'Scheduled',
    color: 'text-teal-600',
    bg: 'bg-teal-500/10 border-teal-200',
    icon: <CalendarClock className="h-3 w-3" />,
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10 border-emerald-200',
    icon: <PlayCircle className="h-3 w-3" />,
  },
  completed: {
    label: 'Completed',
    color: 'text-slate-600',
    bg: 'bg-slate-500/10 border-slate-200',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-500',
    bg: 'bg-red-500/10 border-red-200',
    icon: <XCircle className="h-3 w-3" />,
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

// Meeting card component
function MeetingCard({ meeting }: { meeting: Meeting }) {
  const status = statusConfig[meeting.status];
  const project = meeting.projectId ? getProjectById(meeting.projectId) : null;
  const isUpcoming =
    meeting.status === 'scheduled' || meeting.status === 'in_progress';

  return (
    <motion.div variants={item}>
      <Card className="group hover:shadow-md transition-all duration-200 overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            {/* Left: Meeting info */}
            <div className="flex-1 min-w-0">
              {/* Title row */}
              <div className="flex items-start gap-2 mb-2">
                <h3 className="text-sm font-semibold leading-snug">
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
                  <span>{formatMeetingDate(meeting.date)}</span>
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
              </div>

              {/* Attendees */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex -space-x-2">
                  {meeting.attendees.slice(0, 5).map((id) => (
                    <Avatar
                      key={id}
                      className="h-6 w-6 border-2 border-background"
                    >
                      <AvatarFallback className="text-[8px] bg-muted">
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
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {meeting.attendees.length}
                </span>
              </div>
            </div>

            {/* Right: Action button */}
            <div className="flex items-center gap-2 sm:flex-col sm:items-end shrink-0">
              {isUpcoming && (
                <Button
                  size="sm"
                  className={cn(
                    'h-8 text-xs',
                    meeting.status === 'in_progress'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.48_0.15_160)] text-white'
                  )}
                >
                  <Video className="h-3.5 w-3.5 mr-1.5" />
                  {meeting.status === 'in_progress' ? 'Join Now' : 'Join'}
                </Button>
              )}
              {meeting.status === 'completed' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                >
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  Notes
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Timeline item component
function TimelineItem({
  meeting,
  isFirst,
  isLast,
}: {
  meeting: Meeting;
  isFirst: boolean;
  isLast: boolean;
}) {
  const status = statusConfig[meeting.status];
  const project = meeting.projectId ? getProjectById(meeting.projectId) : null;
  const isUpcoming =
    meeting.status === 'scheduled' || meeting.status === 'in_progress';

  const dotColor: Record<string, string> = {
    scheduled: 'bg-teal-500',
    in_progress: 'bg-emerald-500',
    completed: 'bg-slate-400',
    cancelled: 'bg-red-400',
  };

  return (
    <motion.div
      variants={item}
      className="flex gap-3 sm:gap-4"
    >
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center shrink-0 w-10">
        <div
          className={cn(
            'h-3 w-3 rounded-full border-2 border-background shrink-0 z-10',
            dotColor[meeting.status]
          )}
        />
        {!isLast && (
          <div className="w-px flex-1 bg-border" />
        )}
      </div>

      {/* Content */}
      <div className={cn('flex-1 min-w-0 pb-5', isLast && 'pb-0')}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg hover:bg-muted/30 transition-colors">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium truncate">{meeting.title}</h4>
              <Badge
                variant="outline"
                className={cn(
                  'text-[9px] px-1 py-0 font-medium shrink-0',
                  status.bg,
                  status.color
                )}
              >
                {status.label}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatMeetingDate(meeting.date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatMeetingTime(meeting.date)} · {formatDuration(meeting.duration)}
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
          </div>

          {isUpcoming && (
            <Button
              size="sm"
              className={cn(
                'h-7 text-[11px] shrink-0',
                meeting.status === 'in_progress'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.48_0.15_160)] text-white'
              )}
            >
              <Video className="h-3 w-3 mr-1" />
              {meeting.status === 'in_progress' ? 'Join Now' : 'Join'}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function MeetingsView() {
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
      const dateKey = formatMeetingDate(meeting.date);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(meeting);
    });
    return groups;
  }, [filteredMeetings]);

  // Stats
  const upcomingCount = mockMeetings.filter(
    (m) => m.status === 'scheduled' || m.status === 'in_progress'
  ).length;
  const totalMeetings = mockMeetings.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Meetings</h2>
          <p className="text-sm text-muted-foreground">
            {totalMeetings} meetings · {upcomingCount} upcoming
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as 'cards' | 'timeline')}
          >
            <TabsList className="h-8">
              <TabsTrigger value="cards" className="text-xs px-2.5">
                <CalendarDays className="h-3.5 w-3.5 mr-1" /> Cards
              </TabsTrigger>
              <TabsTrigger value="timeline" className="text-xs px-2.5">
                <Clock className="h-3.5 w-3.5 mr-1" /> Timeline
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            size="sm"
            className="h-8 bg-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.48_0.15_160)] text-white"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-9">
          <TabsTrigger value="upcoming" className="text-xs px-4">
            Upcoming
            {upcomingCount > 0 && (
              <Badge className="ml-1.5 h-4 min-w-[16px] px-1 text-[9px] bg-[oklch(0.55_0.15_160)] text-white">
                {upcomingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past" className="text-xs px-4">
            Past
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs px-4">
            All
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
            <Video className="h-10 w-10 mx-auto mb-3 opacity-40" />
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
                <MeetingCard key={meeting.id} meeting={meeting} />
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
                  <div key={dateLabel} className={groupIdx > 0 ? 'mt-4' : ''}>
                    {/* Date header */}
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {dateLabel}
                      </span>
                      <Separator className="flex-1" />
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
