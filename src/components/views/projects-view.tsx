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
} from 'lucide-react';
import { mockProjects, mockUsers, mockTeams } from '@/lib/mock-data';
import type { Project, ProjectStatus } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Status configuration
const statusConfig: Record<ProjectStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  active: { label: 'Active', color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  on_hold: { label: 'On Hold', color: 'text-amber-600', bg: 'bg-amber-500/10 border-amber-200', icon: <PauseCircle className="h-3 w-3" /> },
  completed: { label: 'Completed', color: 'text-teal-600', bg: 'bg-teal-500/10 border-teal-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  archived: { label: 'Archived', color: 'text-slate-500', bg: 'bg-slate-500/10 border-slate-200', icon: <Archive className="h-3 w-3" /> },
};

function getUserInitials(id: string) {
  const user = mockUsers.find((u) => u.id === id);
  return user ? user.name.split(' ').map((n) => n[0]).join('') : '??';
}

function getUserName(id: string) {
  return mockUsers.find((u) => u.id === id)?.name || 'Unknown';
}

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

// Project card for Grid view
function ProjectGridCard({ project }: { project: Project }) {
  const status = statusConfig[project.status];
  const remainingTasks = project.taskCount - project.completedTasks;

  return (
    <motion.div variants={item}>
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden">
        <CardContent className="p-5">
          {/* Header: Icon + Name + Menu */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-semibold shrink-0"
                style={{ backgroundColor: project.color + '20', color: project.color }}
              >
                {project.icon}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold truncate">{project.name}</h3>
                <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 mt-1 font-medium', status.bg, status.color)}>
                  <span className="mr-1 inline-flex">{status.icon}</span>
                  {status.label}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{project.description}</p>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-muted-foreground">Progress</span>
              <span className="text-xs font-bold" style={{ color: project.color }}>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <CheckCircle2 className="h-3 w-3" />
                <span>{project.completedTasks}/{project.taskCount} tasks</span>
              </div>
              {remainingTasks > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{remainingTasks} left</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer: Members + Due Date */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-1">
              <div className="flex -space-x-2">
                {project.members.slice(0, 4).map((id) => (
                  <Avatar key={id} className="h-6 w-6 border-2 border-background">
                    <AvatarFallback className="text-[8px] bg-muted">
                      {getUserInitials(id)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {project.members.length > 4 && (
                <span className="text-[10px] text-muted-foreground ml-1.5">
                  +{project.members.length - 4}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
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

// Project row for List view
function ProjectListRow({ project }: { project: Project }) {
  const status = statusConfig[project.status];

  return (
    <motion.div
      variants={item}
      className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors cursor-pointer"
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
        style={{ backgroundColor: project.color + '20', color: project.color }}
      >
        {project.icon}
      </div>

      {/* Name + Description */}
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{project.name}</p>
        <p className="text-xs text-muted-foreground truncate">{project.description}</p>
      </div>

      {/* Status */}
      <div className="hidden sm:block w-24">
        <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 font-medium', status.bg, status.color)}>
          <span className="mr-1 inline-flex">{status.icon}</span>
          {status.label}
        </Badge>
      </div>

      {/* Progress */}
      <div className="hidden md:flex items-center gap-2 w-32">
        <Progress value={project.progress} className="h-1.5 flex-1" />
        <span className="text-[10px] font-medium text-muted-foreground w-8 text-right">{project.progress}%</span>
      </div>

      {/* Members */}
      <div className="hidden lg:flex items-center -space-x-1.5 w-20">
        {project.members.slice(0, 3).map((id) => (
          <Avatar key={id} className="h-5 w-5 border-2 border-background">
            <AvatarFallback className="text-[7px] bg-muted">
              {getUserInitials(id)}
            </AvatarFallback>
          </Avatar>
        ))}
        {project.members.length > 3 && (
          <span className="text-[10px] text-muted-foreground ml-2">
            +{project.members.length - 3}
          </span>
        )}
      </div>

      {/* Due Date + Tasks */}
      <div className="flex items-center gap-3 w-28">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
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

export function ProjectsView() {
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Projects</h2>
          <p className="text-sm text-muted-foreground">
            {totalCount} projects · {activeCount} active
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
            <TabsList className="h-8">
              <TabsTrigger value="grid" className="text-xs px-2.5">
                <LayoutGrid className="h-3.5 w-3.5 mr-1" /> Grid
              </TabsTrigger>
              <TabsTrigger value="list" className="text-xs px-2.5">
                <List className="h-3.5 w-3.5 mr-1" /> List
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button size="sm" className="h-8 bg-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.48_0.15_160)]">
            <Plus className="h-3.5 w-3.5 mr-1" /> New Project
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[130px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="h-9 w-[140px] text-xs">
              <SelectValue placeholder="Team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
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
                <FolderKanban className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">No projects found</p>
                <p className="text-xs mt-1">Try adjusting your filters</p>
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
                <FolderKanban className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">No projects found</p>
                <p className="text-xs mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-4 py-2.5 bg-muted/50 text-xs font-medium text-muted-foreground">
                  <span className="w-8"></span>
                  <span>Project</span>
                  <span className="hidden sm:block w-24">Status</span>
                  <span className="hidden md:block w-32">Progress</span>
                  <span className="hidden lg:block w-20">Members</span>
                  <span className="w-28">Due Date</span>
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

