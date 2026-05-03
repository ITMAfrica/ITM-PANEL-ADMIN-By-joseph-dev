'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  X,
  Calendar,
  Clock,
  MessageSquare,
  Pencil,
  Trash2,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  AlertCircle,
  Send,
  Flame,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  GitBranch,
  UserPlus,
  CalendarClock,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Task, TaskStatus, TaskPriority } from '@/lib/types';
import { mockProjects, mockUsers } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const statusConfig: Record<TaskStatus, { label: string; color: string; icon: React.ReactNode; bg: string }> = {
  todo: { label: 'To Do', color: 'text-slate-500', icon: <Circle className="h-4 w-4" />, bg: 'bg-slate-500/10' },
  in_progress: { label: 'In Progress', color: 'text-cyan-500', icon: <Clock className="h-4 w-4" />, bg: 'bg-cyan-500/10' },
  review: { label: 'In Review', color: 'text-amber-500', icon: <AlertCircle className="h-4 w-4" />, bg: 'bg-amber-500/10' },
  done: { label: 'Done', color: 'text-emerald-500', icon: <CheckCircle2 className="h-4 w-4" />, bg: 'bg-emerald-500/10' },
};

const priorityConfig: Record<TaskPriority, { label: string; color: string; bg: string; icon: React.ReactNode; solidBg: string }> = {
  urgent: { label: 'Urgent', color: 'text-rose-600', bg: 'bg-rose-500/10 border-rose-200', icon: <Flame className="h-3.5 w-3.5" />, solidBg: 'bg-rose-500 text-white' },
  high: { label: 'High', color: 'text-amber-600', bg: 'bg-amber-500/10 border-amber-200', icon: <ArrowUp className="h-3.5 w-3.5" />, solidBg: 'bg-amber-500 text-white' },
  medium: { label: 'Medium', color: 'text-cyan-600', bg: 'bg-cyan-500/10 border-cyan-200', icon: <ArrowRight className="h-3.5 w-3.5" />, solidBg: 'bg-cyan-500 text-white' },
  low: { label: 'Low', color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-200', icon: <ArrowDown className="h-3.5 w-3.5" />, solidBg: 'bg-emerald-500 text-white' },
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

interface MockComment {
  id: string;
  userId: string;
  text: string;
  time: string;
}

const mockComments: MockComment[] = [
  { id: 'c1', userId: 'u-2', text: 'Looks great! Just a few tweaks on the responsive breakpoints.', time: '2h ago' },
  { id: 'c2', userId: 'u-3', text: 'I can help with the API integration part when you\'re ready.', time: '5h ago' },
  { id: 'c3', userId: 'u-6', text: 'Should we schedule a quick review meeting for this?', time: '1d ago' },
];

interface ActivityLogEntry {
  id: string;
  icon: React.ReactNode;
  text: string;
  time: string;
}

const mockActivityLog: ActivityLogEntry[] = [
  { id: 'al1', icon: <GitBranch className="h-3 w-3" />, text: 'Status changed from To Do to In Progress', time: '2h ago' },
  { id: 'al2', icon: <UserPlus className="h-3 w-3" />, text: 'Assigned to Sarah Chen', time: '5h ago' },
  { id: 'al3', icon: <CalendarClock className="h-3 w-3" />, text: 'Due date set to Jan 25', time: '1d ago' },
];

export function TaskDetailDrawer() {
  const { taskDetailOpen, setTaskDetailOpen, selectedTask, updateTaskStatus } = useAppStore();
  const { t } = useTranslation();
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<MockComment[]>(mockComments);

  if (!selectedTask) return null;

  const task = selectedTask as Task;
  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];
  const subtaskDone = task.subtasks.filter((s) => s.completed).length;
  const subtaskTotal = task.subtasks.length;
  const subtaskPercent = subtaskTotal > 0 ? Math.round((subtaskDone / subtaskTotal) * 100) : 0;

  const handleStatusChange = (newStatus: TaskStatus) => {
    const oldLabel = statusConfig[task.status].label;
    const newLabel = statusConfig[newStatus].label;
    updateTaskStatus(task.id, newStatus);
    toast.success(t.taskDetail.statusChanged.replace('{from}', oldLabel).replace('{to}', newLabel));
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment: MockComment = {
      id: `c-new-${Date.now()}`,
      userId: 'u-1',
      text: commentText.trim(),
      time: t.activity.justNow,
    };
    setComments([newComment, ...comments]);
    setCommentText('');
    toast.success(t.taskDetail.commentAdded);
  };

  const handleDelete = () => {
    toast.success(t.taskDetail.taskDeleted);
    setTaskDetailOpen(false);
  };

  return (
    <Sheet open={taskDetailOpen} onOpenChange={setTaskDetailOpen}>
      <SheetContent className="w-full sm:max-w-[480px] p-0 gap-0 overflow-y-auto">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Priority Badge - Prominent */}
              <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                <Badge className={cn('text-xs px-2.5 py-1 gap-1.5 font-semibold border-0', priority.solidBg)}>
                  {priority.icon}
                  {priority.label}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Badge
                      variant="outline"
                      className={cn('text-[10px] px-2 py-0.5 cursor-pointer hover:bg-muted/50 transition-colors', status.bg, status.color)}
                    >
                      {status.icon}
                      <span className="ml-1">{status.label}</span>
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44">
                    {(Object.keys(statusConfig) as TaskStatus[]).map((key) => {
                      const cfg = statusConfig[key];
                      return (
                        <DropdownMenuItem
                          key={key}
                          onClick={() => handleStatusChange(key)}
                          className={cn('gap-2', task.status === key && 'bg-muted')}
                        >
                          <span className={cfg.color}>{cfg.icon}</span>
                          <span className="text-sm">{cfg.label}</span>
                          {task.status === key && <CheckCircle2 className="h-3.5 w-3.5 ml-auto text-emerald-500" />}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <SheetTitle className="text-lg leading-tight">{task.title}</SheetTitle>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem className="gap-2" onClick={() => toast.info(t.taskDetail.editMode)}>
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="text-sm">{t.common.edit}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" className="gap-2" onClick={handleDelete}>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="text-sm">{t.common.delete}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTaskDetailOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t.taskDetail.description}</h4>
            <p className="text-sm text-foreground/80 leading-relaxed">{task.description}</p>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t.taskDetail.assignee}</h4>
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-[9px] bg-muted">{getUserInitials(task.assigneeId)}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{getUserName(task.assigneeId)}</span>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t.taskDetail.project}</h4>
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: getProjectColor(task.projectId) }}
                />
                <span className="text-sm">{getProjectName(task.projectId)}</span>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t.taskDetail.dueDate}</h4>
              <div className="flex items-center gap-1.5 text-sm">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {new Date(task.dueDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t.taskDetail.created}</h4>
              <div className="flex items-center gap-1.5 text-sm">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {new Date(task.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>

          <Separator />

          {/* Tags */}
          {task.tags.length > 0 && (
            <>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t.taskDetail.tags}</h4>
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs px-2.5 py-0.5">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Subtasks with animated progress bar */}
          {subtaskTotal > 0 && (
            <>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t.taskDetail.subtasks} ({subtaskDone}/{subtaskTotal})
                  </h4>
                  <span className="text-xs font-medium">{subtaskPercent}%</span>
                </div>
                {/* Animated Progress Bar */}
                <div className="h-2 bg-muted rounded-full mb-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${subtaskPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={cn(
                      'h-full rounded-full',
                      subtaskPercent === 100
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                        : subtaskPercent >= 50
                          ? 'bg-gradient-to-r from-cyan-400 to-teal-500'
                          : 'bg-gradient-to-r from-amber-400 to-amber-500'
                    )}
                  />
                </div>
                <div className="space-y-2">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox checked={subtask.completed} className="h-4 w-4" />
                      <span className={cn('text-sm', subtask.completed && 'line-through text-muted-foreground')}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Activity Log */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {t.taskDetail.activityLog}
            </h4>
            <div className="relative pl-5">
              {/* Timeline line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
              <div className="space-y-3">
                {mockActivityLog.map((entry) => (
                  <div key={entry.id} className="relative flex items-start gap-3">
                    <div className="absolute left-[-13px] top-1.5 w-3 h-3 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        {entry.icon}
                        <span className="text-xs">{entry.text}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground/60">{entry.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Comments */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" /> {t.taskDetail.comments}
            </h4>

            {/* Comment input */}
            <div className="flex items-start gap-2 mb-4">
              <Avatar className="h-7 w-7 mt-0.5">
                <AvatarFallback className="text-[9px] bg-teal-500 text-white">AT</AvatarFallback>
              </Avatar>
              <div className="flex-1 relative">
                <Input
                  placeholder={t.taskDetail.addComment}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="h-9 pr-10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-teal-500 hover:text-teal-600"
                  disabled={!commentText.trim()}
                  onClick={handleAddComment}
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Comments list */}
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-2.5"
                  >
                    <Avatar className="h-7 w-7 mt-0.5">
                      <AvatarFallback className="text-[9px] bg-muted">{getUserInitials(comment.userId)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold">{getUserName(comment.userId)}</span>
                        <span className="text-[10px] text-muted-foreground">{comment.time}</span>
                      </div>
                      <p className="text-sm text-foreground/80">{comment.text}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
