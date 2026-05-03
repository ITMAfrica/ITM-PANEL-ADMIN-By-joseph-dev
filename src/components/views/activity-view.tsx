'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  CheckSquare,
  MessageSquare,
  FileText,
  FolderKanban,
  CalendarDays,
  Users,
  Activity,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { mockActivities, mockUsers } from '@/lib/mock-data';
import { useTranslation } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ─── Activity Type Config ────────────────────────────────────────────────────
const activityConfig: Record<string, {
  icon: React.ElementType;
  color: string;
  bg: string;
  dotColor: string;
  borderColor: string;
}> = {
  task_completed: { icon: CheckSquare, color: 'text-teal-600', bg: 'bg-teal-500/15', dotColor: 'bg-teal-500', borderColor: 'border-teal-500/20' },
  task_created: { icon: CheckSquare, color: 'text-teal-600', bg: 'bg-teal-500/15', dotColor: 'bg-teal-500', borderColor: 'border-teal-500/20' },
  comment_added: { icon: MessageSquare, color: 'text-cyan-600', bg: 'bg-cyan-500/15', dotColor: 'bg-cyan-500', borderColor: 'border-cyan-500/20' },
  file_uploaded: { icon: FileText, color: 'text-amber-600', bg: 'bg-amber-500/15', dotColor: 'bg-amber-500', borderColor: 'border-amber-500/20' },
  project_updated: { icon: FolderKanban, color: 'text-emerald-600', bg: 'bg-emerald-500/15', dotColor: 'bg-emerald-500', borderColor: 'border-emerald-500/20' },
  meeting_scheduled: { icon: CalendarDays, color: 'text-emerald-600', bg: 'bg-emerald-500/15', dotColor: 'bg-emerald-500', borderColor: 'border-emerald-500/20' },
  member_joined: { icon: Users, color: 'text-pink-600', bg: 'bg-pink-500/15', dotColor: 'bg-pink-500', borderColor: 'border-pink-500/20' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getUserName(id: string) {
  return mockUsers.find((u) => u.id === id)?.name || 'Unknown';
}

function getUserInitials(id: string) {
  const user = mockUsers.find((u) => u.id === id);
  return user ? user.name.split(' ').map((n) => n[0]).join('') : '??';
}

function getUserColor(id: string) {
  const colors = [
    'bg-emerald-500/20 text-emerald-700',
    'bg-amber-500/20 text-amber-700',
    'bg-cyan-500/20 text-cyan-700',
    'bg-rose-500/20 text-rose-700',
    'bg-pink-500/20 text-pink-700',
    'bg-teal-500/20 text-teal-700',
    'bg-orange-500/20 text-orange-700',
    'bg-violet-500/20 text-violet-700',
  ];
  const idx = mockUsers.findIndex((u) => u.id === id);
  return colors[idx % colors.length];
}

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

// ─── Filter Pill Config ──────────────────────────────────────────────────────
const filterOptions = [
  { value: 'all', types: ['task_completed', 'task_created', 'comment_added', 'file_uploaded', 'project_updated', 'meeting_scheduled', 'member_joined'] },
  { value: 'tasks', types: ['task_completed', 'task_created'] },
  { value: 'comments', types: ['comment_added'] },
  { value: 'files', types: ['file_uploaded'] },
  { value: 'projects', types: ['project_updated', 'meeting_scheduled'] },
  { value: 'members', types: ['member_joined'] },
] as const;

const filterIconMap: Record<string, React.ElementType> = {
  all: Activity,
  tasks: CheckSquare,
  comments: MessageSquare,
  files: FileText,
  projects: FolderKanban,
  members: Users,
};

// ─── Animation Variants ──────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const dateHeader = {
  hidden: { opacity: 0, y: -8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// ─── Main Component ──────────────────────────────────────────────────────────
export function ActivityView() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    const filterObj = filterOptions.find((f) => f.value === filter);
    if (!filterObj) return mockActivities;
    return mockActivities.filter((a) => filterObj.types.includes(a.type as typeof filterObj.types[number]));
  }, [filter]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach((a) => {
      const dateKey = new Date(a.timestamp).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(a);
    });
    return groups;
  }, [filtered]);

  const filterCount = (value: string) => {
    const filterObj = filterOptions.find((f) => f.value === value);
    if (!filterObj) return mockActivities.length;
    return mockActivities.filter((a) => filterObj.types.includes(a.type as typeof filterObj.types[number])).length;
  };

  return (
    <div className="space-y-5">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t.activity.title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {mockActivities.length} {t.activity.events} · {t.activity.trackChanges}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs border-dashed hover:border-solid hover:bg-muted/50"
          >
            <Filter className="h-3.5 w-3.5" /> {t.activity.filter}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </div>
      </div>

      {/* ─── Filter Pills ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {filterOptions.map((opt) => {
          const Icon = filterIconMap[opt.value] || Activity;
          const isActive = filter === opt.value;
          return (
            <motion.button
              key={opt.value}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilter(opt.value)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border',
                isActive
                  ? 'bg-[oklch(0.55_0.15_160)] text-white border-[oklch(0.55_0.15_160)] shadow-sm shadow-[oklch(0.55_0.15_160/0.2)]'
                  : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-3 w-3" />
              {t.activity[opt.value as keyof typeof t.activity] || opt.value}
              <span
                className={cn(
                  'ml-0.5 text-[10px] font-semibold px-1.5 py-0 rounded-full',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {filterCount(opt.value)}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* ─── Activity Timeline ───────────────────────────────────────────── */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        <AnimatePresence mode="wait">
          {Object.entries(grouped).map(([dateKey, activities]) => (
            <motion.div key={dateKey} initial="hidden" animate="show" className="space-y-1">
              {/* Date Header */}
              <motion.div variants={dateHeader} className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[oklch(0.55_0.15_160)] shadow-sm shadow-[oklch(0.55_0.15_160/0.3)]" />
                  <h3 className="text-sm font-semibold text-foreground whitespace-nowrap">
                    {getDateLabel(activities[0].timestamp)}
                  </h3>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-border via-border/50 to-transparent" />
                <span className="text-[10px] text-muted-foreground font-medium">
                  {activities.length} {t.activity.events}
                </span>
              </motion.div>

              {/* Timeline Items */}
              <div className="relative ml-1">
                {/* Vertical Line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-border via-border/40 to-transparent" />

                <div className="space-y-0.5">
                  {activities.map((activity, idx) => {
                    const config = activityConfig[activity.type] || {
                      icon: Activity,
                      color: 'text-muted-foreground',
                      bg: 'bg-muted',
                      dotColor: 'bg-muted-foreground',
                      borderColor: 'border-muted',
                    };
                    const IconComp = config.icon;

                    return (
                      <motion.div
                        key={activity.id}
                        variants={item}
                        className="group relative flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-all duration-200 cursor-pointer"
                      >
                        {/* Timeline Dot */}
                        <div className="relative z-10 flex-shrink-0 mt-1">
                          <div
                            className={cn(
                              'w-[7px] h-[7px] rounded-full ring-[3px] ring-background transition-all duration-200',
                              config.dotColor,
                              'group-hover:scale-150 group-hover:ring-2'
                            )}
                          />
                        </div>

                        {/* Activity Icon */}
                        <div
                          className={cn(
                            'flex-shrink-0 p-2 rounded-xl border transition-all duration-200 group-hover:scale-105 group-hover:shadow-sm',
                            config.bg,
                            config.borderColor
                          )}
                        >
                          <IconComp className={cn('h-4 w-4', config.color)} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5 ring-1 ring-background shadow-sm">
                              <AvatarFallback className={cn('text-[7px] font-semibold', getUserColor(activity.userId))}>
                                {getUserInitials(activity.userId)}
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-sm leading-relaxed">
                              <span className="font-semibold">{getUserName(activity.userId)}</span>{' '}
                              <span className="text-muted-foreground">{activity.description}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 ml-7">
                            <span className="text-[11px] text-muted-foreground/70 font-medium">
                              {getRelativeTime(activity.timestamp)}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[9px] px-1.5 py-0 h-4 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                                config.bg,
                                config.color,
                                config.borderColor
                              )}
                            >
                              {activity.targetType}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {Object.keys(grouped).length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No activity found</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your filters</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
