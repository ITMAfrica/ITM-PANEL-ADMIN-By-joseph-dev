'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Plus,
  LayoutGrid,
  List,
  Search,
  Calendar,
  FolderKanban,
  CheckCircle2,
  PauseCircle,
  Archive,
  Clock,
  MoreHorizontal,
  Users,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { mockProjects, mockUsers, mockTeams } from '@/lib/mock-data';
import { useTranslation } from '@/lib/i18n';
import type { Project, ProjectStatus } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ── Status Configuration ─────────────────────────────────────────────────────

const statusConfig: Record<ProjectStatus, { color: string; bg: string; icon: React.ReactNode; dotColor: string; solidBg: string; solidText: string }> = {
  active: {
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-200 dark:border-emerald-800',
    icon: <CheckCircle2 className="h-3 w-3" />,
    dotColor: 'bg-emerald-500',
    solidBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    solidText: 'text-emerald-700 dark:text-emerald-300',
  },
  on_hold: {
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10 border-amber-200 dark:border-amber-800',
    icon: <PauseCircle className="h-3 w-3" />,
    dotColor: 'bg-amber-500',
    solidBg: 'bg-amber-100 dark:bg-amber-900/50',
    solidText: 'text-amber-700 dark:text-amber-300',
  },
  completed: {
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-500/10 border-teal-200 dark:border-teal-800',
    icon: <CheckCircle2 className="h-3 w-3" />,
    dotColor: 'bg-teal-500',
    solidBg: 'bg-teal-100 dark:bg-teal-900/50',
    solidText: 'text-teal-700 dark:text-teal-300',
  },
  archived: {
    color: 'text-slate-500 dark:text-slate-400',
    bg: 'bg-slate-500/10 border-slate-200 dark:border-slate-800',
    icon: <Archive className="h-3 w-3" />,
    dotColor: 'bg-slate-400',
    solidBg: 'bg-slate-100 dark:bg-slate-800/50',
    solidText: 'text-slate-600 dark:text-slate-300',
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getUserInitials(id: string) {
  const user = mockUsers.find((u) => u.id === id);
  return user ? user.name.split(' ').map((n) => n[0]).join('') : '??';
}

function getUserName(id: string) {
  return mockUsers.find((u) => u.id === id)?.name || 'Unknown';
}

// ── Animation Variants ───────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ── Avatar Stack ─────────────────────────────────────────────────────────────

function AvatarStack({ memberIds, max = 4, size = 'sm' }: { memberIds: string[]; max?: number; size?: 'sm' | 'md' }) {
  const dims = size === 'sm' ? { avatar: 'h-6 w-6', text: 'text-[8px]', overlap: '-space-x-2', moreText: 'text-[10px]' }
    : { avatar: 'h-7 w-7', text: 'text-[9px]', overlap: '-space-x-2', moreText: 'text-[10px]' };

  return (
    <div className="flex items-center">
      <div className={cn('flex', dims.overlap)}>
        {memberIds.slice(0, max).map((id, idx) => (
          <TooltipProvider key={id} delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className={cn(dims.avatar, 'border-2 border-background ring-1 ring-muted/50', idx > 0 && 'ml-0')}>
                  <AvatarFallback className={cn(dims.text, 'bg-muted font-semibold')}>
                    {getUserInitials(id)}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{getUserName(id)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
      {memberIds.length > max && (
        <span className={cn(dims.moreText, 'text-muted-foreground ml-2 font-medium')}>
          +{memberIds.length - max}
        </span>
      )}
    </div>
  );
}

// ── Progress Bar with Label ──────────────────────────────────────────────────

function ProgressBar({ value, color, size = 'md' }: { value: number; color: string; size?: 'sm' | 'md' | 'lg' }) {
  const height = size === 'sm' ? 'h-1.5' : size === 'md' ? 'h-2' : 'h-2.5';
  return (
    <div className={cn('w-full bg-muted/50 rounded-full overflow-hidden', height)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={cn('h-full rounded-full', height)}
        style={{
          background: `linear-gradient(90deg, ${color}, ${color}dd)`,
        }}
      />
    </div>
  );
}

// ── Project Grid Card ────────────────────────────────────────────────────────

function ProjectGridCard({ project }: { project: Project }) {
  const { t } = useTranslation();
  const status = statusConfig[project.status];
  const statusLabels: Record<ProjectStatus, string> = { active: t.projects.active, on_hold: t.projects.onHold, completed: t.projects.completed, archived: t.projects.archived };
  const remainingTasks = project.taskCount - project.completedTasks;

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group"
    >
      <Card className="overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 border-0 shadow-sm">
        {/* Accent strip / gradient top border */}
        <div
          className="h-1.5 w-full"
          style={{
            background: `linear-gradient(90deg, ${project.color}, ${project.color}88)`,
          }}
        />

        <CardContent className="p-5">
          {/* Header: Icon + Name + Status badge + Menu */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-semibold shrink-0 shadow-sm"
                style={{ backgroundColor: project.color + '18', color: project.color }}
              >
                {project.icon}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold truncate">{project.name}</h3>
                <div className="mt-1">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full',
                      status.solidBg,
                      status.solidText
                    )}
                  >
                    {status.icon}
                    {statusLabels[project.status]}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{project.description}</p>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t.dashboard.projectProgress}</span>
              <span className="text-xs font-bold" style={{ color: project.color }}>{project.progress}%</span>
            </div>
            <ProgressBar value={project.progress} color={project.color} size="md" />
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              <span className="font-medium">{project.completedTasks}/{project.taskCount}</span>
            </div>
            {remainingTasks > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3 text-amber-500" />
                <span className="font-medium">{remainingTasks} left</span>
              </div>
            )}
            {project.progress >= 80 && project.status === 'active' && (
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <TrendingUp className="h-3 w-3" />
                On track
              </div>
            )}
          </div>

          {/* Footer: Members + Due Date */}
          <div className="flex items-center justify-between pt-3 border-t">
            <AvatarStack memberIds={project.members} max={4} size="sm" />
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
              <Calendar className="h-3 w-3" />
              {new Date(project.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Project List Row ─────────────────────────────────────────────────────────

function ProjectListRow({ project }: { project: Project }) {
  const { t } = useTranslation();
  const status = statusConfig[project.status];
  const statusLabels: Record<ProjectStatus, string> = { active: t.projects.active, on_hold: t.projects.onHold, completed: t.projects.completed, archived: t.projects.archived };

  return (
    <motion.div
      variants={item}
      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
      className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-4 py-3.5 items-center cursor-pointer transition-colors"
    >
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-sm shrink-0 shadow-sm"
        style={{ backgroundColor: project.color + '18', color: project.color }}
      >
        {project.icon}
      </div>

      {/* Name + Description */}
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate">{project.name}</p>
        <p className="text-xs text-muted-foreground truncate">{project.description}</p>
      </div>

      {/* Status badge */}
      <div className="hidden sm:block w-24">
        <span
          className={cn(
            'inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full',
            status.solidBg,
            status.solidText
          )}
        >
          {status.icon}
          {statusLabels[project.status]}
        </span>
      </div>

      {/* Progress */}
      <div className="hidden md:flex items-center gap-2.5 w-36">
        <div className="flex-1">
          <ProgressBar value={project.progress} color={project.color} size="sm" />
        </div>
        <span className="text-[10px] font-bold text-muted-foreground w-8 text-right">{project.progress}%</span>
      </div>

      {/* Members */}
      <div className="hidden lg:flex items-center w-24">
        <AvatarStack memberIds={project.members} max={3} size="sm" />
      </div>

      {/* Due Date + Task count */}
      <div className="flex items-center gap-3 w-32">
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
          <Calendar className="h-3 w-3" />
          {new Date(project.dueDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ── Status Filter Tabs ───────────────────────────────────────────────────────

function StatusFilterTabs({
  statusFilter,
  setStatusFilter,
}: {
  statusFilter: string;
  setStatusFilter: (v: string) => void;
}) {
  const { t } = useTranslation();
  const tabs = [
    { value: 'all', label: t.projects.all, icon: null },
    { value: 'active', label: t.projects.active, icon: <CheckCircle2 className="h-3 w-3" /> },
    { value: 'on_hold', label: t.projects.onHold, icon: <PauseCircle className="h-3 w-3" /> },
    { value: 'completed', label: t.projects.completed, icon: <CheckCircle2 className="h-3 w-3" /> },
    { value: 'archived', label: t.projects.archived, icon: <Archive className="h-3 w-3" /> },
  ];

  const counts: Record<string, number> = {
    all: mockProjects.length,
    active: mockProjects.filter((p) => p.status === 'active').length,
    on_hold: mockProjects.filter((p) => p.status === 'on_hold').length,
    completed: mockProjects.filter((p) => p.status === 'completed').length,
    archived: mockProjects.filter((p) => p.status === 'archived').length,
  };

  return (
    <div className="relative flex items-center gap-1 bg-muted/30 rounded-lg p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => setStatusFilter(tab.value)}
          className={cn(
            'relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200',
            statusFilter === tab.value
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.icon}
          {tab.label}
          <span
            className={cn(
              'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-bold',
              statusFilter === tab.value
                ? 'bg-[oklch(0.55_0.15_160)]/10 text-[oklch(0.55_0.15_160)]'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {counts[tab.value] || 0}
          </span>
        </button>
      ))}
      {/* Animated underline */}
      <motion.div
        className="absolute bottom-0 h-0.5 bg-[oklch(0.55_0.15_160)] rounded-full"
        layoutId="statusUnderline"
        style={{ display: 'none' }} // Hidden since using pill style
      />
    </div>
  );
}

// ── Main Projects View ───────────────────────────────────────────────────────

export function ProjectsView() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');

  // Filter projects
  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesTeam =
      teamFilter === 'all' ||
      mockTeams.some(
        (team) => team.id === teamFilter && team.projects.includes(project.id)
      );
    return matchesSearch && matchesStatus && matchesTeam;
  });

  const activeCount = mockProjects.filter((p) => p.status === 'active').length;
  const totalCount = mockProjects.length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t.projects.title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            <span className="font-semibold text-foreground">{totalCount}</span> {t.projects.title} · <span className="font-semibold text-emerald-600 dark:text-emerald-400">{activeCount}</span> {t.projects.active}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
            <TabsList className="h-8 bg-muted/50 p-0.5">
              <TabsTrigger
                value="grid"
                className="text-xs px-2.5 h-7 rounded-md gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <LayoutGrid className="h-3.5 w-3.5" /> {t.projects.grid}
              </TabsTrigger>
              <TabsTrigger
                value="list"
                className="text-xs px-2.5 h-7 rounded-md gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <List className="h-3.5 w-3.5" /> {t.projects.list}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            size="sm"
            className="h-8 gap-1.5 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.48_0.15_160)] hover:from-[oklch(0.48_0.15_160)] hover:to-[oklch(0.42_0.15_160)] text-white shadow-sm shadow-[oklch(0.55_0.15_160)]/20"
          >
            <Sparkles className="h-3.5 w-3.5" /> {t.projects.newProject}
          </Button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col gap-3">
        {/* Status filter tabs */}
        <StatusFilterTabs statusFilter={statusFilter} setStatusFilter={setStatusFilter} />

        {/* Search + team filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.projects.search}
              className="pl-9 h-9 bg-muted/30 border-transparent focus:border-[oklch(0.55_0.15_160)]/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="h-9 w-[150px] text-xs bg-muted/30 border-transparent">
              <Users className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder={t.projects.team} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.projects.all} {t.projects.team}s</SelectItem>
              {mockTeams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {filteredProjects.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold">{t.projects.noResults}</p>
                <p className="text-xs mt-1 text-muted-foreground/70">Try adjusting your filters</p>
              </div>
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filteredProjects.map((project) => (
                  <ProjectGridCard key={project.id} project={project} />
                ))}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {filteredProjects.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold">{t.projects.noResults}</p>
                <p className="text-xs mt-1 text-muted-foreground/70">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden shadow-sm">
                {/* Table header */}
                <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-4 py-2.5 bg-muted/50 border-b text-xs font-semibold text-muted-foreground">
                  <span className="w-9"></span>
                  <span>{t.projects.title}</span>
                  <span className="hidden sm:block w-24">{t.projects.status}</span>
                  <span className="hidden md:block w-36">{t.dashboard.projectProgress}</span>
                  <span className="hidden lg:block w-24">{t.projects.team}</span>
                  <span className="w-32">{t.tasks.dueDate}</span>
                </div>

                {/* Table rows */}
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="divide-y"
                >
                  {filteredProjects.map((project) => (
                    <ProjectListRow key={project.id} project={project} />
                  ))}
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
