'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  CheckSquare,
  MessageSquare,
  FileText,
  FolderKanban,
  CalendarDays,
  Users,
  Activity,
  Filter,
} from 'lucide-react';
import { mockActivities, mockUsers } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const activityIcons: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  task_completed: { icon: <CheckSquare className="h-4 w-4" />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  comment_added: { icon: <MessageSquare className="h-4 w-4" />, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  task_created: { icon: <CheckSquare className="h-4 w-4" />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  file_uploaded: { icon: <FileText className="h-4 w-4" />, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  project_updated: { icon: <FolderKanban className="h-4 w-4" />, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  meeting_scheduled: { icon: <CalendarDays className="h-4 w-4" />, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  member_joined: { icon: <Users className="h-4 w-4" />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
};

function getUserName(id: string) {
  return mockUsers.find((u) => u.id === id)?.name || 'Unknown';
}

function getUserInitials(id: string) {
  const user = mockUsers.find((u) => u.id === id);
  return user ? user.name.split(' ').map((n) => n[0]).join('') : '??';
}

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

export function ActivityView() {
  const [filter, setFilter] = useState('all');

  const filterMap: Record<string, string[]> = {
    all: ['task_completed', 'comment_added', 'task_created', 'file_uploaded', 'project_updated', 'meeting_scheduled', 'member_joined'],
    tasks: ['task_completed', 'task_created'],
    comments: ['comment_added'],
    files: ['file_uploaded'],
    projects: ['project_updated', 'meeting_scheduled'],
    members: ['member_joined'],
  };

  const filtered = mockActivities.filter((a) =>
    filterMap[filter]?.includes(a.type)
  );

  // Group by date
  const grouped: Record<string, typeof filtered> = {};
  filtered.forEach((a) => {
    const date = new Date(a.timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(a);
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Activity</h2>
          <p className="text-sm text-muted-foreground">
            {mockActivities.length} events · Track all workspace changes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="h-3.5 w-3.5 mr-1" /> Filter
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="h-8">
          <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs px-3">Tasks</TabsTrigger>
          <TabsTrigger value="comments" className="text-xs px-3">Comments</TabsTrigger>
          <TabsTrigger value="files" className="text-xs px-3">Files</TabsTrigger>
          <TabsTrigger value="projects" className="text-xs px-3">Projects</TabsTrigger>
          <TabsTrigger value="members" className="text-xs px-3">Members</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Activity Timeline */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {Object.entries(grouped).map(([date, activities]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground whitespace-nowrap">{date}</h3>
              <Separator className="flex-1" />
            </div>

            <div className="space-y-1">
              {activities.map((activity) => {
                const config = activityIcons[activity.type] || {
                  icon: <Activity className="h-4 w-4" />,
                  color: 'text-muted-foreground',
                  bg: 'bg-muted',
                };

                return (
                  <motion.div
                    key={activity.id}
                    variants={item}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    {/* Timeline connector */}
                    <div className="flex flex-col items-center gap-1 mt-1">
                      <div className={cn('p-1.5 rounded-lg', config.bg)}>
                        <span className={config.color}>{config.icon}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[7px] bg-muted">
                            {getUserInitials(activity.userId)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm">
                          <span className="font-medium">{getUserName(activity.userId)}</span>{' '}
                          <span className="text-muted-foreground">{activity.description}</span>
                        </p>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 ml-7">
                        {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>

                    {/* Target badge */}
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {activity.targetType}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
