'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { mockProjects, mockTasks, mockUsers } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  CalendarDays,
  Target,
  Users,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

// ---- Circular Progress Ring ----
function CircularProgress({
  value,
  size = 80,
  strokeWidth = 6,
  color = '#10b981',
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        className="text-muted/30"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </svg>
  );
}

// ---- Countdown helper ----
function getCountdown(dueDateStr: string): { text: string; isOverdue: boolean; isUrgent: boolean } {
  const now = new Date();
  const due = new Date(dueDateStr);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `${Math.abs(diffDays)}d overdue`, isOverdue: true, isUrgent: true };
  }
  if (diffDays === 0) {
    return { text: 'Due today', isOverdue: false, isUrgent: true };
  }
  if (diffDays === 1) {
    return { text: '1 day left', isOverdue: false, isUrgent: true };
  }
  if (diffDays <= 7) {
    return { text: `${diffDays} days left`, isOverdue: false, isUrgent: false };
  }
  return { text: `${diffDays} days left`, isOverdue: false, isUrgent: false };
}

// ---- Project Status Badge ----
function getProjectStatus(
  progress: number,
  dueDate: string,
  projectStatus: string
): { label: string; variant: 'onTrack' | 'atRisk' | 'behind' | 'completed' } {
  if (projectStatus === 'completed') return { label: 'Completed', variant: 'completed' };
  if (projectStatus === 'on_hold') return { label: 'On Hold', variant: 'behind' };

  const countdown = getCountdown(dueDate);
  if (countdown.isOverdue) return { label: 'Behind', variant: 'behind' };
  if (progress >= 70 && !countdown.isUrgent) return { label: 'On Track', variant: 'onTrack' };
  if (progress >= 40) return { label: 'At Risk', variant: 'atRisk' };
  return { label: 'Behind', variant: 'behind' };
}

// ---- Mock velocity data ----
function getVelocityData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day) => ({
    day,
    completed: [5, 8, 6, 9, 4, 2, 7][days.indexOf(day)],
  }));
}

// ---- Mock milestones ----
function getMilestones() {
  return [
    { id: 'ms-1', name: 'Sprint 4 End', date: '2025-01-22', completed: false },
    { id: 'ms-2', name: 'API Beta Release', date: '2025-02-01', completed: false },
    { id: 'ms-3', name: 'Mobile V2 Beta', date: '2025-02-15', completed: false },
    { id: 'ms-4', name: 'Website Launch', date: '2025-03-15', completed: false },
  ];
}

export function ProgressBoard() {
  const { t } = useTranslation();
  const mountedRef = useRef(false);
  const [mountedFlag, setMountedFlag] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    setMountedFlag(true);
  }, []);

  const projects = mockProjects;
  const tasks = mockTasks;
  const users = mockUsers;

  // Task breakdown per project
  const projectTaskBreakdown = useMemo(() => {
    const breakdown: Record<string, { todo: number; in_progress: number; review: number; done: number }> = {};
    for (const project of projects) {
      breakdown[project.id] = { todo: 0, in_progress: 0, review: 0, done: 0 };
    }
    for (const task of tasks) {
      if (breakdown[task.projectId]) {
        breakdown[task.projectId][task.status] += 1;
      }
    }
    return breakdown;
  }, [projects, tasks]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const activeProjects = projects.filter((p) => p.status === 'active').length;
    const avgCompletion = Math.round(
      projects.reduce((sum, p) => sum + p.progress, 0) / projects.length
    );
    const tasksThisWeek = tasks.filter(
      (t) => t.status === 'done' || t.status === 'in_progress'
    ).length;
    const onTimeProjects = projects.filter((p) => {
      if (p.status === 'completed') return true;
      const countdown = getCountdown(p.dueDate);
      return !countdown.isOverdue && p.progress >= 50;
    }).length;
    const onTimeRate = Math.round((onTimeProjects / projects.length) * 100);

    return { activeProjects, avgCompletion, tasksThisWeek, onTimeRate };
  }, [projects, tasks]);

  const velocityData = useMemo(() => getVelocityData(), []);
  const milestones = useMemo(() => getMilestones(), []);

  if (!mountedFlag) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">{t.common.loading}</div>
      </div>
    );
  }

  const statusVariantStyles = {
    onTrack: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    atRisk: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    behind: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    completed: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-[oklch(0.55_0.15_160)]" />
            {t.progressBoard.title}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{t.progressBoard.subtitle}</p>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: <Target className="h-4 w-4" />,
            value: summaryStats.activeProjects,
            label: t.progressBoard.totalProjects,
            color: 'text-[oklch(0.55_0.15_160)]',
            bg: 'bg-[oklch(0.55_0.15_160/0.1)]',
            border: 'border-[oklch(0.55_0.15_160/0.2)]',
          },
          {
            icon: <TrendingUp className="h-4 w-4" />,
            value: `${summaryStats.avgCompletion}%`,
            label: t.progressBoard.avgCompletion,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
          },
          {
            icon: <CheckCircle2 className="h-4 w-4" />,
            value: summaryStats.tasksThisWeek,
            label: t.progressBoard.tasksThisWeek,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
          },
          {
            icon: <Clock className="h-4 w-4" />,
            value: `${summaryStats.onTimeRate}%`,
            label: t.progressBoard.onTimeRate,
            color: 'text-cyan-600 dark:text-cyan-400',
            bg: 'bg-cyan-500/10',
            border: 'border-cyan-500/20',
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`border ${stat.border} bg-gradient-to-br from-background to-muted/10 overflow-hidden`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                </div>
                <p className={`text-2xl font-extrabold tracking-tight ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Project Progress Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-[oklch(0.55_0.15_160)]" />
          {t.progressBoard.projectProgress}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project, i) => {
            const breakdown = projectTaskBreakdown[project.id] || { todo: 0, in_progress: 0, review: 0, done: 0 };
            const countdown = getCountdown(project.dueDate);
            const status = getProjectStatus(project.progress, project.dueDate, project.status);
            const projectMembers = users.filter((u) => project.members.includes(u.id));

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                  {/* Color accent strip */}
                  <div
                    className="h-1.5"
                    style={{
                      background: `linear-gradient(to right, ${project.color}, ${project.color}80)`,
                    }}
                  />
                  <CardContent className="p-5">
                    {/* Top: Name + Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg shrink-0">{project.icon}</span>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm truncate">{project.name}</h3>
                          <p className="text-[11px] text-muted-foreground truncate">{project.description}</p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`shrink-0 text-[10px] px-2 py-0.5 border ${statusVariantStyles[status.variant]}`}
                      >
                        {status.variant === 'onTrack' && <TrendingUp className="h-2.5 w-2.5 mr-1" />}
                        {status.variant === 'atRisk' && <AlertTriangle className="h-2.5 w-2.5 mr-1" />}
                        {status.variant === 'behind' && <AlertTriangle className="h-2.5 w-2.5 mr-1" />}
                        {status.variant === 'completed' && <CheckCircle2 className="h-2.5 w-2.5 mr-1" />}
                        {status.label}
                      </Badge>
                    </div>

                    {/* Progress Ring + Task Breakdown */}
                    <div className="flex items-center gap-5 mb-4">
                      {/* Circular Progress */}
                      <div className="relative shrink-0">
                        <CircularProgress
                          value={project.progress}
                          size={80}
                          strokeWidth={6}
                          color={project.color}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold" style={{ color: project.color }}>
                            {project.progress}%
                          </span>
                        </div>
                      </div>

                      {/* Task breakdown pills */}
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: t.progressBoard.todo, count: breakdown.todo, bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400' },
                          { label: t.progressBoard.inProgress, count: breakdown.in_progress, bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
                          { label: t.progressBoard.review, count: breakdown.review, bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400' },
                          { label: t.progressBoard.done, count: breakdown.done, bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
                        ].map((pill) => (
                          <span
                            key={pill.label}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${pill.bg} ${pill.text}`}
                          >
                            {pill.count} {pill.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Team member avatars */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {projectMembers.slice(0, 4).map((member, idx) => (
                          <Avatar
                            key={member.id}
                            className="h-7 w-7 border-2 border-background"
                            style={{ marginLeft: idx === 0 ? 0 : '-6px', zIndex: 4 - idx }}
                          >
                            <AvatarFallback
                              className="text-[9px] font-medium"
                              style={{
                                backgroundColor: `${project.color}20`,
                                color: project.color,
                              }}
                            >
                              {member.name.split(' ').map((n) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {projectMembers.length > 4 && (
                          <span
                            className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-muted text-[9px] font-medium text-muted-foreground border-2 border-background"
                            style={{ marginLeft: '-6px' }}
                          >
                            +{projectMembers.length - 4}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground ml-2">
                          {projectMembers.length} {t.progressBoard.members}
                        </span>
                      </div>

                      {/* Due date with countdown */}
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                        <span
                          className={
                            countdown.isOverdue
                              ? 'text-rose-500 font-medium'
                              : countdown.isUrgent
                                ? 'text-amber-500 font-medium'
                                : 'text-muted-foreground'
                          }
                        >
                          {countdown.text}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Team Velocity + Milestone Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Velocity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[oklch(0.55_0.15_160/0.1)] border border-[oklch(0.55_0.15_160/0.2)]">
                    <BarChart3 className="h-4 w-4 text-[oklch(0.55_0.15_160)]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{t.progressBoard.teamVelocity}</h3>
                    <p className="text-[10px] text-muted-foreground">{t.progressBoard.velocitySubtitle}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                  <TrendingUp className="h-2.5 w-2.5 mr-1" />
                  +12%
                </Badge>
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={velocityData} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="completed"
                      fill="oklch(0.55 0.15 160)"
                      radius={[4, 4, 0, 0]}
                      name={t.progressBoard.tasksCompleted}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Milestone Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <CalendarDays className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{t.progressBoard.milestones}</h3>
                  <p className="text-[10px] text-muted-foreground">{t.progressBoard.milestonesSubtitle}</p>
                </div>
              </div>

              {/* Horizontal timeline */}
              <div className="relative mt-4">
                {/* Connecting line */}
                <div className="absolute top-3 left-0 right-0 h-0.5 bg-gradient-to-r from-[oklch(0.55_0.15_160)] via-amber-500/50 to-muted" />

                <div className="flex justify-between relative">
                  {milestones.map((milestone, idx) => {
                    const daysUntil = Math.ceil(
                      (new Date(milestone.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    );
                    const isPast = daysUntil < 0;

                    return (
                      <div
                        key={milestone.id}
                        className="flex flex-col items-center text-center flex-1 min-w-0 px-1"
                      >
                        {/* Dot */}
                        <div
                          className={`relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isPast
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : idx === 0
                                ? 'bg-[oklch(0.55_0.15_160)] border-[oklch(0.55_0.15_160)] text-white'
                                : 'bg-background border-muted-foreground/30 text-muted-foreground'
                          }`}
                        >
                          {isPast ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <ArrowRight className="h-3 w-3" />
                          )}
                        </div>
                        {/* Label */}
                        <div className="mt-2 min-w-0">
                          <p className="text-[11px] font-medium truncate max-w-[100px]">
                            {milestone.name}
                          </p>
                          <p className={`text-[9px] ${isPast ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                            {isPast ? t.progressBoard.completed : `${daysUntil}d`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Milestone detail list */}
              <div className="mt-8 space-y-3">
                {milestones.map((milestone) => {
                  const daysUntil = Math.ceil(
                    (new Date(milestone.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );
                  const isPast = daysUntil < 0;
                  const isUrgent = !isPast && daysUntil <= 7;

                  return (
                    <div
                      key={milestone.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isPast
                            ? 'bg-emerald-500'
                            : isUrgent
                              ? 'bg-amber-500'
                              : 'bg-[oklch(0.55_0.15_160)]'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium">{milestone.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(milestone.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-1.5 py-0 ${
                            isPast
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : isUrgent
                                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          {isPast ? t.progressBoard.completed : `${daysUntil}d`}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
