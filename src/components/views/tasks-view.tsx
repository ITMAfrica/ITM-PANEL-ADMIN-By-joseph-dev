'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Plus,
  Filter,
  SortAsc,
  SortDesc,
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
  ChevronDown,
  ChevronRight,
  Flame,
  ArrowUpRight,
  ArrowRight,
  ArrowDownRight,
  Target,
  AlertTriangle,
  SlidersHorizontal,
} from 'lucide-react';
import { mockTasks, mockProjects, mockUsers } from '@/lib/mock-data';
import { useTranslation } from '@/lib/i18n';
import type { Task, TaskStatus, TaskPriority } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// DnD Kit imports
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ── Config Maps ──────────────────────────────────────────────────────────────

const statusConfig: Record<TaskStatus, { color: string; icon: React.ReactNode; bg: string; gradient: string; headerBg: string; dotColor: string }> = {
  todo: {
    color: 'text-slate-600 dark:text-slate-400',
    icon: <Circle className="h-4 w-4" />,
    bg: 'bg-slate-500/10',
    gradient: 'from-slate-50 to-slate-100/50 dark:from-slate-950/50 dark:to-slate-900/30',
    headerBg: 'bg-slate-100 dark:bg-slate-800/60',
    dotColor: 'bg-slate-400',
  },
  in_progress: {
    color: 'text-cyan-600 dark:text-cyan-400',
    icon: <Clock className="h-4 w-4" />,
    bg: 'bg-cyan-500/10',
    gradient: 'from-cyan-50/80 to-cyan-100/30 dark:from-cyan-950/40 dark:to-cyan-900/20',
    headerBg: 'bg-cyan-100 dark:bg-cyan-900/40',
    dotColor: 'bg-cyan-500',
  },
  review: {
    color: 'text-amber-600 dark:text-amber-400',
    icon: <AlertCircle className="h-4 w-4" />,
    bg: 'bg-amber-500/10',
    gradient: 'from-amber-50/80 to-amber-100/30 dark:from-amber-950/40 dark:to-amber-900/20',
    headerBg: 'bg-amber-100 dark:bg-amber-900/40',
    dotColor: 'bg-amber-500',
  },
  done: {
    color: 'text-emerald-600 dark:text-emerald-400',
    icon: <CheckCircle2 className="h-4 w-4" />,
    bg: 'bg-emerald-500/10',
    gradient: 'from-emerald-50/80 to-emerald-100/30 dark:from-emerald-950/40 dark:to-emerald-900/20',
    headerBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    dotColor: 'bg-emerald-500',
  },
};

const priorityConfig: Record<TaskPriority, { color: string; bg: string; strip: string; icon: React.ReactNode; dotColor: string; gradientFrom: string }> = {
  urgent: {
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-500/10 border-rose-200 dark:border-rose-800',
    strip: 'border-l-rose-500',
    icon: <Flame className="h-3 w-3" />,
    dotColor: 'bg-rose-500',
    gradientFrom: 'from-rose-500',
  },
  high: {
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10 border-amber-200 dark:border-amber-800',
    strip: 'border-l-amber-500',
    icon: <ArrowUpRight className="h-3 w-3" />,
    dotColor: 'bg-amber-500',
    gradientFrom: 'from-amber-500',
  },
  medium: {
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-200 dark:border-cyan-800',
    strip: 'border-l-cyan-500',
    icon: <ArrowRight className="h-3 w-3" />,
    dotColor: 'bg-cyan-500',
    gradientFrom: 'from-cyan-500',
  },
  low: {
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-200 dark:border-emerald-800',
    strip: 'border-l-emerald-500',
    icon: <ArrowDownRight className="h-3 w-3" />,
    dotColor: 'bg-emerald-500',
    gradientFrom: 'from-emerald-500',
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

function getUserStatus(id: string) {
  return mockUsers.find((u) => u.id === id)?.status || 'offline';
}

function getProjectName(id: string) {
  return mockProjects.find((p) => p.id === id)?.name || 'Unknown';
}

function getProjectColor(id: string) {
  return mockProjects.find((p) => p.id === id)?.color || '#10b981';
}

function isOverdue(dueDate: string, status: TaskStatus) {
  if (status === 'done') return false;
  return new Date(dueDate) < new Date();
}

// ── Sort types ───────────────────────────────────────────────────────────────

type SortField = 'title' | 'priority' | 'dueDate' | 'status' | 'project';
type SortDirection = 'asc' | 'desc';

const priorityOrder: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

// ── Task Card (Kanban) - base card without sortable ──────────────────────────

function TaskCardContent({ task, onClick }: { task: Task; onClick?: () => void }) {
  const { t } = useTranslation();
  const subtaskTotal = task.subtasks.length;
  const subtaskDone = task.subtasks.filter((s) => s.completed).length;
  const priority = priorityConfig[task.priority];
  const overdue = isOverdue(task.dueDate, task.status);
  const pl: Record<TaskPriority, string> = { urgent: t.tasks.urgent, high: t.tasks.high, medium: t.tasks.medium, low: t.tasks.low };
  const assigneeStatus = getUserStatus(task.assigneeId);

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative bg-card rounded-xl border shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden',
        'border-l-[3px]',
        priority.strip
      )}
    >
      <div className="p-3 pl-3.5">
        {/* Top row: priority badge + drag handle + menu */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] px-1.5 py-0 font-semibold gap-0.5 flex items-center',
                priority.bg,
                priority.color
              )}
            >
              {priority.icon}
              {pl[task.priority]}
            </Badge>
          </div>
          <div className="flex items-center gap-0.5">
            <div className="opacity-0 group-hover:opacity-40 transition-opacity cursor-grab p-0.5">
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>{t.common.edit}</DropdownMenuItem>
                <DropdownMenuItem>{t.tasks.assignee}</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">{t.common.delete}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm font-medium mb-1.5 leading-snug">{task.title}</h4>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-muted/80 font-medium">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Subtask progress */}
        {subtaskTotal > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground font-medium">{t.tasks.subtasks}</span>
              <span className="text-[10px] font-bold">{subtaskDone}/{subtaskTotal}</span>
            </div>
            <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full bg-gradient-to-r transition-all',
                  subtaskDone === subtaskTotal
                    ? 'from-emerald-400 to-emerald-500'
                    : 'from-[oklch(0.6_0.15_160)] to-[oklch(0.5_0.12_170)]'
                )}
                style={{ width: `${(subtaskDone / subtaskTotal) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer: assignee + due date */}
        <div className="flex items-center justify-between">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Avatar className="h-5 w-5 ring-1 ring-background">
                      <AvatarFallback className="text-[7px] bg-muted font-medium">
                        {getUserInitials(task.assigneeId)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online indicator */}
                    <span
                      className={cn(
                        'absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-1 ring-background',
                        assigneeStatus === 'online' ? 'bg-emerald-500' :
                        assigneeStatus === 'away' ? 'bg-amber-400' :
                        assigneeStatus === 'busy' ? 'bg-rose-500' :
                        'bg-slate-300 dark:bg-slate-600'
                      )}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">{getUserName(task.assigneeId)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{getUserName(task.assigneeId)} · {assigneeStatus}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div
            className={cn(
              'flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md',
              overdue
                ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10'
                : 'text-muted-foreground'
            )}
          >
            {overdue ? (
              <AlertTriangle className="h-3 w-3" />
            ) : (
              <Calendar className="h-3 w-3" />
            )}
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sortable Task Card (wraps TaskCardContent with useSortable) ──────────────

function SortableTaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <TaskCardContent task={task} onClick={onClick} />
    </motion.div>
  );
}

// ── Droppable Kanban Column ──────────────────────────────────────────────────

function DroppableKanbanColumn({
  status,
  tasks,
  isOver,
  children,
}: {
  status: TaskStatus;
  tasks: Task[];
  isOver: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id: `column-${status}`, data: { type: 'column', status } });
  const config = statusConfig[status];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-shrink-0 w-[280px] sm:w-[300px] transition-all duration-200',
        isOver && 'ring-2 ring-[oklch(0.55_0.15_160)]/40 ring-offset-2 ring-offset-background rounded-2xl'
      )}
    >
      {/* Column header */}
      <div className={cn('flex items-center justify-between mb-3 px-3 py-2.5 rounded-xl', config.headerBg)}>
        <div className="flex items-center gap-2">
          <div className={cn('p-1 rounded-md', config.bg)}>
            <span className={config.color}>{config.icon}</span>
          </div>
          <span className="text-sm font-bold">{status}</span>
          <span
            className={cn(
              'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold text-white',
              config.dotColor
            )}
          >
            {tasks.length}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-black/5 dark:hover:bg-white/10">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Cards area with subtle gradient background */}
      <div
        className={cn(
          'space-y-2.5 min-h-[200px] p-2 rounded-xl bg-gradient-to-b transition-colors duration-200',
          config.gradient,
          isOver && 'bg-[oklch(0.55_0.15_160)]/5'
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ── Kanban View with DnD ─────────────────────────────────────────────────────

function KanbanView() {
  const { setSelectedTask } = useAppStore();
  const { t } = useTranslation();
  const statuses: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];
  const sl: Record<TaskStatus, string> = { todo: t.tasks.todo, in_progress: t.tasks.inProgress, review: t.tasks.inReview, done: t.tasks.done };

  // Local task state initialized from mock data
  const [tasks, setTasks] = useState<Task[]>([...mockTasks]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  function findContainer(id: string): TaskStatus | undefined {
    // Check if id is a column id
    if (id.startsWith('column-')) {
      return id.replace('column-', '') as TaskStatus;
    }
    // Otherwise find which column the task is in
    const task = tasks.find((t) => t.id === id);
    return task?.status;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      setOverColumn(null);
      return;
    }

    // Set over column for visual feedback
    setOverColumn(overContainer);

    // Move the task to the new column
    setTasks((prev) =>
      prev.map((task) =>
        task.id === active.id ? { ...task, status: overContainer } : task
      )
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setOverColumn(null);

    if (!over) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string);

    if (!activeContainer || !overContainer) return;

    // If same container, we may want to reorder (but for now, just finalize the move)
    if (activeContainer === overContainer) return;

    // Task was already moved in onDragOver, nothing more to do
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task as unknown as Record<string, unknown>);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-220px)] scrollbar-thin">
        {statuses.map((status) => {
          const config = statusConfig[status];
          const columnTasks = tasks.filter((task) => task.status === status);

          return (
            <DroppableKanbanColumn
              key={status}
              status={status}
              tasks={columnTasks}
              isOver={overColumn === status}
            >
              <SortableContext
                items={columnTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <AnimatePresence>
                  {columnTasks.map((task) => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      onClick={() => handleTaskClick(task)}
                    />
                  ))}
                </AnimatePresence>
              </SortableContext>

              {/* Add task button with dashed border */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full p-3 text-xs text-muted-foreground hover:text-foreground border-2 border-dashed border-muted-foreground/20 hover:border-[oklch(0.55_0.15_160)]/40 hover:bg-[oklch(0.55_0.15_160)]/5 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                {t.tasks.addTask}
              </motion.button>
            </DroppableKanbanColumn>
          );
        })}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className="w-[280px] sm:w-[300px] rotate-2 opacity-90 shadow-2xl">
            <TaskCardContent task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// ── List View ────────────────────────────────────────────────────────────────

function SortHeader({ field, label, currentField, currentDir, onSort }: { field: SortField; label: string; currentField: SortField; currentDir: SortDirection; onSort: (f: SortField) => void }) {
  return (
    <button
      onClick={() => onSort(field)}
      className={cn(
        'flex items-center gap-1 hover:text-foreground transition-colors',
        currentField === field ? 'text-foreground' : 'text-muted-foreground'
      )}
    >
      <span className="text-xs font-semibold">{label}</span>
      {currentField === field ? (
        currentDir === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
      ) : (
        <SortAsc className="h-3 w-3 opacity-30" />
      )}
    </button>
  );
}

function ListView() {
  const { setSelectedTask } = useAppStore();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const sl: Record<TaskStatus, string> = { todo: t.tasks.todo, in_progress: t.tasks.inProgress, review: t.tasks.inReview, done: t.tasks.done };
  const pl: Record<TaskPriority, string> = { urgent: t.tasks.urgent, high: t.tasks.high, medium: t.tasks.medium, low: t.tasks.low };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filteredAndSortedTasks = useMemo(() => {
    let result = mockTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (filterPriority !== 'all') {
      result = result.filter((task) => task.priority === filterPriority);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'title':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'priority':
          cmp = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'dueDate':
          cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
        case 'project':
          cmp = getProjectName(a.projectId).localeCompare(getProjectName(b.projectId));
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [searchQuery, sortField, sortDir, filterPriority]);

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.tasks.searchTasks}
            className="pl-9 h-9 bg-muted/30 border-transparent focus:border-[oklch(0.55_0.15_160)]/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'h-8 text-xs gap-1.5',
              filterPriority !== 'all' && 'bg-[oklch(0.55_0.15_160)]/10 border-[oklch(0.55_0.15_160)]/30 text-[oklch(0.55_0.15_160)]'
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {t.tasks.filter}
          </Button>
          <div className="flex items-center gap-1">
            {(['all', 'urgent', 'high', 'medium', 'low'] as const).map((p) => (
              <Button
                key={p}
                variant="ghost"
                size="sm"
                onClick={() => setFilterPriority(p)}
                className={cn(
                  'h-7 text-[10px] px-2 rounded-md',
                  filterPriority === p
                    ? 'bg-[oklch(0.55_0.15_160)]/10 text-[oklch(0.55_0.15_160)] font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {p === 'all' ? t.projects.all : pl[p as TaskPriority]}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden shadow-sm">
        {/* Header row */}
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-4 py-2.5 bg-muted/50 border-b">
          <span className="w-6"></span>
          <SortHeader field="title" label={t.tasks.task} currentField={sortField} currentDir={sortDir} onSort={handleSort} />
          <span className="hidden sm:block w-24"><SortHeader field="project" label={t.tasks.project} currentField={sortField} currentDir={sortDir} onSort={handleSort} /></span>
          <span className="hidden md:block w-20"><SortHeader field="priority" label={t.tasks.priority} currentField={sortField} currentDir={sortDir} onSort={handleSort} /></span>
          <span className="hidden md:block w-24"><SortHeader field="assignee" label={t.tasks.assignee} currentField={sortField} currentDir={sortDir} onSort={handleSort} /></span>
          <span className="w-20"><SortHeader field="dueDate" label={t.tasks.dueDate} currentField={sortField} currentDir={sortDir} onSort={handleSort} /></span>
        </div>

        {/* Rows */}
        <div>
          {filteredAndSortedTasks.map((task, idx) => {
            const status = statusConfig[task.status];
            const priority = priorityConfig[task.priority];
            const overdue = isOverdue(task.dueDate, task.status);

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.02 }}
                onClick={() => setSelectedTask(task as unknown as Record<string, unknown>)}
                className={cn(
                  'grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors cursor-pointer',
                  idx % 2 === 1 && 'bg-muted/10'
                )}
              >
                <Checkbox className="h-4 w-4" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', priority.dotColor)} />
                    <p className="text-sm font-medium truncate">{task.title}</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md', status.bg, status.color)}>
                      {status.icon}
                      {sl[task.status]}
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 w-24">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getProjectColor(task.projectId) }}
                  />
                  <span className="text-xs truncate text-muted-foreground">{getProjectName(task.projectId)}</span>
                </div>
                <div className="hidden md:block w-20">
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] px-1.5 py-0 font-medium gap-0.5', priority.bg, priority.color)}
                  >
                    {priority.icon}
                    {pl[task.priority]}
                  </Badge>
                </div>
                <div className="hidden md:flex items-center gap-1.5 w-24">
                  <Avatar className="h-5 w-5 ring-1 ring-background">
                    <AvatarFallback className="text-[7px] bg-muted font-medium">
                      {getUserInitials(task.assigneeId)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs truncate text-muted-foreground">{getUserName(task.assigneeId)}</span>
                </div>
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs w-20 font-medium',
                    overdue ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'
                  )}
                >
                  {overdue ? <AlertTriangle className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── My Tasks View ────────────────────────────────────────────────────────────

function MyTasksView() {
  const { setSelectedTask } = useAppStore();
  const { t } = useTranslation();
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set());
  const myTasks = mockTasks.filter((task) => task.assigneeId === 'u-1');

  // Group by project
  const grouped = useMemo(() => {
    const map = new Map<string, Task[]>();
    myTasks.forEach((task) => {
      const pid = task.projectId;
      if (!map.has(pid)) map.set(pid, []);
      map.get(pid)!.push(task);
    });
    return map;
  }, [myTasks]);

  const toggleCollapse = (pid: string) => {
    setCollapsedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid);
      else next.add(pid);
      return next;
    });
  };

  const totalTasks = myTasks.length;
  const doneTasks = myTasks.filter((t) => t.status === 'done').length;
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const sl: Record<TaskStatus, string> = { todo: t.tasks.todo, in_progress: t.tasks.inProgress, review: t.tasks.inReview, done: t.tasks.done };
  const pl: Record<TaskPriority, string> = { urgent: t.tasks.urgent, high: t.tasks.high, medium: t.tasks.medium, low: t.tasks.low };

  return (
    <div className="space-y-4">
      {/* Progress summary */}
      <Card className="bg-gradient-to-r from-[oklch(0.55_0.15_160)]/5 to-[oklch(0.55_0.15_160)]/10 border-[oklch(0.55_0.15_160)]/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[oklch(0.55_0.15_160)]" />
              <span className="text-sm font-semibold">{t.tasks.assignedToYou}</span>
            </div>
            <span className="text-xs font-bold text-[oklch(0.55_0.15_160)]">
              {doneTasks}/{totalTasks} {t.tasks.tasksCompleted}
            </span>
          </div>
          <div className="h-2 w-full bg-[oklch(0.55_0.15_160)]/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-[oklch(0.6_0.15_160)] to-[oklch(0.5_0.15_160)]"
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-muted-foreground">{progressPct}% {t.tasks.tasksCompleted}</span>
            <div className="flex items-center gap-3">
              {(['todo', 'in_progress', 'review', 'done'] as TaskStatus[]).map((s) => {
                const count = myTasks.filter((t) => t.status === s).length;
                if (count === 0) return null;
                const cfg = statusConfig[s];
                return (
                  <span key={s} className={cn('text-[10px] font-medium flex items-center gap-1', cfg.color)}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dotColor)} />
                    {count} {sl[s]}
                  </span>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grouped tasks */}
      <div className="space-y-3">
        {Array.from(grouped.entries()).map(([projectId, tasks]) => {
          const collapsed = collapsedProjects.has(projectId);
          const projectColor = getProjectColor(projectId);
          const projectName = getProjectName(projectId);
          const projectDone = tasks.filter((t) => t.status === 'done').length;

          return (
            <div key={projectId} className="rounded-xl border overflow-hidden">
              {/* Project header */}
              <button
                onClick={() => toggleCollapse(projectId)}
                className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {collapsed ? (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: projectColor }}
                  />
                  <span className="text-sm font-semibold">{projectName}</span>
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                    {projectDone}/{tasks.length}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${tasks.length > 0 ? (projectDone / tasks.length) * 100 : 0}%`,
                        backgroundColor: projectColor,
                      }}
                    />
                  </div>
                </div>
              </button>

              {/* Tasks */}
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="divide-y">
                      {tasks.map((task) => {
                        const priority = priorityConfig[task.priority];
                        const status = statusConfig[task.status];
                        const overdue = isOverdue(task.dueDate, task.status);
                        const isDone = task.status === 'done';

                        return (
                          <div
                            key={task.id}
                            onClick={() => setSelectedTask(task as unknown as Record<string, unknown>)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors cursor-pointer"
                          >
                            <Checkbox
                              checked={isDone}
                              className={cn(
                                'h-4 w-4',
                                isDone && 'data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500'
                              )}
                            />
                            <div
                              className={cn(
                                'w-1 h-8 rounded-full flex-shrink-0',
                                priority.strip.replace('border-l-', 'bg-')
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <p className={cn('text-sm font-medium truncate', isDone && 'line-through text-muted-foreground')}>
                                {task.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md', status.bg, status.color)}>
                                  {status.icon}
                                  {sl[task.status]}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={cn('text-[10px] px-1.5 py-0 font-medium gap-0.5 h-4', priority.bg, priority.color)}
                                >
                                  {pl[task.priority]}
                                </Badge>
                              </div>
                            </div>
                            <div
                              className={cn(
                                'flex items-center gap-1 text-[10px] font-medium flex-shrink-0',
                                overdue ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'
                              )}
                            >
                              {overdue ? <AlertTriangle className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Tasks View ──────────────────────────────────────────────────────────

export function TasksView() {
  const { taskViewMode, setTaskViewMode } = useAppStore();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t.tasks.title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            <span className="font-semibold text-foreground">{mockTasks.length}</span> {t.dashboard.tasks} · <span className="font-semibold text-emerald-600 dark:text-emerald-400">{mockTasks.filter((task) => task.status === 'done').length}</span> {t.tasks.tasksCompleted}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Tabs value={taskViewMode} onValueChange={(v) => setTaskViewMode(v as typeof taskViewMode)}>
            <TabsList className="h-8 bg-muted/50 p-0.5">
              <TabsTrigger
                value="kanban"
                className={cn(
                  'text-xs px-2.5 h-7 rounded-md gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm',
                )}
              >
                <Columns3 className="h-3.5 w-3.5" /> {t.tasks.kanban}
              </TabsTrigger>
              <TabsTrigger
                value="list"
                className="text-xs px-2.5 h-7 rounded-md gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <List className="h-3.5 w-3.5" /> {t.tasks.list}
              </TabsTrigger>
              <TabsTrigger
                value="my_tasks"
                className="text-xs px-2.5 h-7 rounded-md gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <User className="h-3.5 w-3.5" /> {t.tasks.myTasks}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterOpen(!filterOpen)}
            className={cn(
              'h-8 text-xs gap-1.5',
              filterOpen && 'bg-[oklch(0.55_0.15_160)]/10 border-[oklch(0.55_0.15_160)]/30 text-[oklch(0.55_0.15_160)]'
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            {t.tasks.filter}
          </Button>

          <Button
            size="sm"
            className="h-8 gap-1.5 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.48_0.15_160)] hover:from-[oklch(0.48_0.15_160)] hover:to-[oklch(0.42_0.15_160)] text-white shadow-sm shadow-[oklch(0.55_0.15_160)]/20"
          >
            <Plus className="h-3.5 w-3.5" /> {t.tasks.newTask}
          </Button>
        </div>
      </div>

      {/* Filter bar (collapsible) */}
      <AnimatePresence>
        {filterOpen && taskViewMode === 'kanban' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.tasks.searchTasks}
                  className="pl-9 h-8 bg-background border-transparent text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Views */}
      <AnimatePresence mode="wait">
        {taskViewMode === 'kanban' && <KanbanView key="kanban" />}
        {taskViewMode === 'list' && <ListView key="list" />}
        {taskViewMode === 'my_tasks' && <MyTasksView key="my_tasks" />}
      </AnimatePresence>
    </div>
  );
}
