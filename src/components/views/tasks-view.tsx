'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Filter,
  SortAsc,
  MoreHorizontal,
  List,
  Columns3,
  User,
  Calendar,
  GripVertical,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Search,
} from 'lucide-react';
import { mockTasks, mockProjects, mockUsers } from '@/lib/mock-data';
import type { Task, TaskStatus, TaskPriority } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const statusConfig: Record<TaskStatus, { label: string; color: string; icon: React.ReactNode; bg: string }> = {
  todo: { label: 'To Do', color: 'text-slate-500', icon: <Circle className="h-4 w-4" />, bg: 'bg-slate-500/10' },
  in_progress: { label: 'In Progress', color: 'text-cyan-500', icon: <Clock className="h-4 w-4" />, bg: 'bg-cyan-500/10' },
  review: { label: 'In Review', color: 'text-amber-500', icon: <AlertCircle className="h-4 w-4" />, bg: 'bg-amber-500/10' },
  done: { label: 'Done', color: 'text-emerald-500', icon: <CheckCircle2 className="h-4 w-4" />, bg: 'bg-emerald-500/10' },
};

const priorityConfig: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  urgent: { label: 'Urgent', color: 'text-rose-600', bg: 'bg-rose-500/10 border-rose-200' },
  high: { label: 'High', color: 'text-amber-600', bg: 'bg-amber-500/10 border-amber-200' },
  medium: { label: 'Medium', color: 'text-cyan-600', bg: 'bg-cyan-500/10 border-cyan-200' },
  low: { label: 'Low', color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-200' },
};

function getUserInitials(id: string) {
  const user = mockUsers.find((u) => u.id === id);
  return user ? user.name.split(' ').map((n) => n[0]).join('') : '??';
}

function getUserName(id: string) {
  return mockUsers.find((u) => u.id === id)?.name || 'Unknown';
}

function getProjectName(id: string) {
  return mockProjects.find((p) => p.id === id)?.name || 'Unknown';
}

function getProjectColor(id: string) {
  return mockProjects.find((p) => p.id === id)?.color || '#10b981';
}

function TaskCard({ task }: { task: Task }) {
  const subtaskTotal = task.subtasks.length;
  const subtaskDone = task.subtasks.filter((s) => s.completed).length;
  const priority = priorityConfig[task.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="group p-3 bg-card rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 font-medium', priority.bg, priority.color)}>
          {priority.label}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Assign</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h4 className="text-sm font-medium mb-1.5 leading-snug">{task.title}</h4>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>

      <div className="flex flex-wrap gap-1 mb-3">
        {task.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
            {tag}
          </Badge>
        ))}
      </div>

      {subtaskTotal > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">Subtasks</span>
            <span className="text-[10px] font-medium">{subtaskDone}/{subtaskTotal}</span>
          </div>
          <Progress value={(subtaskDone / subtaskTotal) * 100} className="h-1" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[7px] bg-muted">
              {getUserInitials(task.assigneeId)}
            </AvatarFallback>
          </Avatar>
          <span className="text-[10px] text-muted-foreground">{getUserName(task.assigneeId)}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      </div>
    </motion.div>
  );
}

function KanbanView() {
  const statuses: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-220px)]">
      {statuses.map((status) => {
        const config = statusConfig[status];
        const tasks = mockTasks.filter((t) => t.status === status);

        return (
          <div key={status} className="flex-shrink-0 w-[280px] sm:w-[300px]">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className={cn('p-1 rounded', config.bg)}>
                  <span className={config.color}>{config.icon}</span>
                </div>
                <span className="text-sm font-semibold">{config.label}</span>
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                  {tasks.length}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="space-y-2.5 min-h-[200px] p-0.5 rounded-xl bg-muted/30">
              <AnimatePresence>
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </AnimatePresence>
              <button className="w-full p-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors flex items-center justify-center gap-1">
                <Plus className="h-3 w-3" /> Add task
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = mockTasks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-4 py-2.5 bg-muted/50 text-xs font-medium text-muted-foreground">
          <span className="w-6"></span>
          <span>Task</span>
          <span className="hidden sm:block w-20">Project</span>
          <span className="hidden md:block w-20">Priority</span>
          <span className="hidden md:block w-24">Assignee</span>
          <span className="w-20">Due Date</span>
        </div>

        <div className="divide-y">
          {filteredTasks.map((task) => {
            const status = statusConfig[task.status];
            const priority = priorityConfig[task.priority];

            return (
              <div
                key={task.id}
                className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <Checkbox className="h-4 w-4" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={cn('flex items-center gap-1 text-[10px]', status.color)}>
                      {status.icon}
                      {status.label}
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 w-20">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getProjectColor(task.projectId) }}
                  />
                  <span className="text-xs truncate">{getProjectName(task.projectId)}</span>
                </div>
                <div className="hidden md:block w-20">
                  <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', priority.bg, priority.color)}>
                    {priority.label}
                  </Badge>
                </div>
                <div className="hidden md:flex items-center gap-1.5 w-24">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[7px] bg-muted">
                      {getUserInitials(task.assigneeId)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs truncate">{getUserName(task.assigneeId)}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground w-20">
                  <Calendar className="h-3 w-3" />
                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function TasksView() {
  const { taskViewMode, setTaskViewMode } = useAppStore();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Tasks</h2>
          <p className="text-sm text-muted-foreground">
            {mockTasks.length} tasks · {mockTasks.filter((t) => t.status === 'done').length} completed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={taskViewMode} onValueChange={(v) => setTaskViewMode(v as typeof taskViewMode)}>
            <TabsList className="h-8">
              <TabsTrigger value="kanban" className="text-xs px-2.5">
                <Columns3 className="h-3.5 w-3.5 mr-1" /> Kanban
              </TabsTrigger>
              <TabsTrigger value="list" className="text-xs px-2.5">
                <List className="h-3.5 w-3.5 mr-1" /> List
              </TabsTrigger>
              <TabsTrigger value="my_tasks" className="text-xs px-2.5">
                <User className="h-3.5 w-3.5 mr-1" /> My Tasks
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="h-3.5 w-3.5 mr-1" /> Filter
          </Button>
          <Button size="sm" className="h-8 bg-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.48_0.15_160)]">
            <Plus className="h-3.5 w-3.5 mr-1" /> New Task
          </Button>
        </div>
      </div>

      {/* Views */}
      {taskViewMode === 'kanban' && <KanbanView />}
      {taskViewMode === 'list' && <ListView />}
      {taskViewMode === 'my_tasks' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">Tasks assigned to you</p>
          {mockTasks
            .filter((t) => t.assigneeId === 'u-1')
            .map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
        </div>
      )}
    </div>
  );
}
