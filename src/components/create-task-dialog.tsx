'use client';

import { useState, useMemo, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { mockProjects, mockUsers } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Sparkles,
  Type,
  FileText,
  CircleDot,
  Flag,
  FolderKanban,
  UserCircle,
  CalendarDays,
  Tag,
  ListChecks,
  Plus,
  X,
  ChevronDown,
} from 'lucide-react';
import type { DateRange } from 'react-day-picker';

const TITLE_MAX_LENGTH = 120;

const statusOptions = [
  { value: 'todo', labelKey: 'todo' as const, color: 'bg-slate-400' },
  { value: 'in_progress', labelKey: 'inProgress' as const, color: 'bg-amber-500' },
  { value: 'review', labelKey: 'inReview' as const, color: 'bg-cyan-500' },
  { value: 'done', labelKey: 'done' as const, color: 'bg-emerald-500' },
];

const priorityOptions = [
  { value: 'urgent', labelKey: 'urgent' as const, color: 'bg-rose-500', border: 'border-l-rose-500' },
  { value: 'high', labelKey: 'high' as const, color: 'bg-amber-500', border: 'border-l-amber-500' },
  { value: 'medium', labelKey: 'medium' as const, color: 'bg-cyan-500', border: 'border-l-cyan-500' },
  { value: 'low', labelKey: 'low' as const, color: 'bg-emerald-500', border: 'border-l-emerald-500' },
];

interface Subtask {
  id: string;
  title: string;
}

export function CreateTaskDialog() {
  const { createTaskDialogOpen, setCreateTaskDialogOpen } = useAppStore();
  const { t } = useTranslation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [projectId, setProjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [titleError, setTitleError] = useState('');

  const selectedPriority = priorityOptions.find((p) => p.value === priority);

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setStatus('todo');
    setPriority('medium');
    setProjectId('');
    setAssigneeId('');
    setDueDate(undefined);
    setTagInput('');
    setTags([]);
    setSubtasks([]);
    setNewSubtask('');
    setTitleError('');
  }, []);

  const handleOpenChange = (open: boolean) => {
    setCreateTaskDialogOpen(open);
    if (!open) resetForm();
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 8) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addSubtask = () => {
    const trimmed = newSubtask.trim();
    if (trimmed && subtasks.length < 10) {
      setSubtasks([...subtasks, { id: `st-${Date.now()}`, title: trimmed }]);
      setNewSubtask('');
    }
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleSubtaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubtask();
    }
  };

  const validate = (): boolean => {
    if (!title.trim()) {
      setTitleError(t.createTask.titleRequired);
      return false;
    }
    setTitleError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // In a real app, this would call the API
    console.log('Creating task:', {
      title,
      description,
      status,
      priority,
      projectId,
      assigneeId,
      dueDate: dueDate?.toISOString(),
      tags,
      subtasks: subtasks.map((s) => ({ ...s, completed: false })),
    });
    toast.success(t.toast.taskCreated);
    setCreateTaskDialogOpen(false);
    resetForm();
  };

  const selectedProject = mockProjects.find((p) => p.id === projectId);
  const selectedAssignee = mockUsers.find((u) => u.id === assigneeId);

  return (
    <Dialog open={createTaskDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[580px] p-0 gap-0 overflow-hidden"
        showCloseButton={false}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {/* Gradient Header */}
          <div className="relative px-6 pt-6 pb-4 bg-gradient-to-r from-[oklch(0.55_0.15_160/0.08)] via-[oklch(0.55_0.15_160/0.04)] to-transparent border-b">
            {/* Decorative sparkle */}
            <div className="absolute top-3 right-4 text-[oklch(0.55_0.15_160/0.15)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2.5 text-lg">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-[oklch(0.55_0.15_160)] to-[oklch(0.48_0.12_160)] text-white shadow-sm">
                  <CheckSquare className="h-4 w-4" />
                </div>
                <span className="bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.45_0.12_160)] bg-clip-text text-transparent font-bold">
                  {t.createTask.title}
                </span>
              </DialogTitle>
              <DialogDescription className="sr-only">
                {t.createTask.title}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Form Content with Priority Border */}
          <div
            className={cn(
              'border-l-[3px] transition-colors duration-300',
              selectedPriority?.border || 'border-l-cyan-500'
            )}
          >
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Task Title */}
              <div className="space-y-2">
                <Label htmlFor="task-title" className="text-sm font-medium flex items-center gap-1.5">
                  <Type className="h-3.5 w-3.5 text-muted-foreground" />
                  {t.createTask.taskTitle} <span className="text-destructive text-xs">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="task-title"
                    placeholder={t.createTask.taskTitlePlaceholder}
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value.slice(0, TITLE_MAX_LENGTH));
                      if (titleError) setTitleError('');
                    }}
                    className={cn(
                      'h-10 pr-16',
                      titleError
                        ? 'border-destructive focus-visible:ring-destructive/30'
                        : 'focus-visible:ring-[oklch(0.55_0.15_160/0.3)]'
                    )}
                    autoFocus
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground tabular-nums">
                    {title.length}/{TITLE_MAX_LENGTH}
                  </span>
                </div>
                <AnimatePresence>
                  {titleError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs text-destructive"
                    >
                      {titleError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="task-desc" className="text-sm font-medium flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  {t.createTask.description}
                  <span className="text-[10px] text-muted-foreground/60 ml-1">({t.createTask.markdownHint})</span>
                </Label>
                <Textarea
                  id="task-desc"
                  placeholder={t.createTask.descriptionPlaceholder}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[80px] resize-none focus-visible:ring-[oklch(0.55_0.15_160/0.3)]"
                />
              </div>

              {/* Status & Priority row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <CircleDot className="h-3.5 w-3.5 text-muted-foreground" />
                    {t.createTask.status} <span className="text-destructive text-xs">*</span>
                  </Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-10 focus:ring-[oklch(0.55_0.15_160/0.3)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="flex items-center gap-2">
                            <span className={cn('w-2 h-2 rounded-full', opt.color)} />
                            {t.tasks[opt.labelKey]}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                    {t.createTask.priority}
                  </Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="h-10 focus:ring-[oklch(0.55_0.15_160/0.3)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="flex items-center gap-2">
                            <span className={cn('w-2 h-2 rounded-full', opt.color)} />
                            {t.tasks[opt.labelKey]}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Project & Assignee row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
                    {t.createTask.project}
                  </Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger className="h-10 focus:ring-[oklch(0.55_0.15_160/0.3)]">
                      <SelectValue placeholder={t.createTask.selectProject}>
                        {selectedProject ? (
                          <span className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: selectedProject.color }}
                            />
                            <span className="truncate">{selectedProject.name}</span>
                          </span>
                        ) : t.createTask.selectProject}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {mockProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <span className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: project.color }}
                            />
                            <span className="truncate">{project.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <UserCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    {t.createTask.assignee}
                  </Label>
                  <Select value={assigneeId} onValueChange={setAssigneeId}>
                    <SelectTrigger className="h-10 focus:ring-[oklch(0.55_0.15_160/0.3)]">
                      <SelectValue placeholder={t.createTask.unassigned}>
                        {selectedAssignee ? (
                          <span className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.55_0.15_160)] to-[oklch(0.48_0.12_160)] text-white text-[10px] font-medium shrink-0">
                              {selectedAssignee.name.split(' ').map((n) => n[0]).join('')}
                            </span>
                            <span className="truncate">{selectedAssignee.name}</span>
                          </span>
                        ) : t.createTask.unassigned}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <span className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.55_0.15_160)] to-[oklch(0.48_0.12_160)] text-white text-[10px] font-medium shrink-0">
                              {user.name.split(' ').map((n) => n[0]).join('')}
                            </span>
                            <span className="truncate">{user.name}</span>
                            <span className={cn(
                              'w-1.5 h-1.5 rounded-full ml-auto shrink-0',
                              user.status === 'online' ? 'bg-emerald-500' :
                              user.status === 'away' ? 'bg-amber-500' :
                              user.status === 'busy' ? 'bg-rose-500' : 'bg-muted-foreground/40'
                            )} />
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                  {t.createTask.dueDate}
                </Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'h-10 w-full justify-start text-left font-normal focus:ring-[oklch(0.55_0.15_160/0.3)]',
                        !dueDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {dueDate
                        ? dueDate.toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : t.createTask.selectDate}
                      <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={(date: Date | undefined) => {
                        setDueDate(date);
                        setCalendarOpen(false);
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="task-tags" className="text-sm font-medium flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  {t.createTask.tags}
                </Label>
                <div className="flex flex-wrap items-center gap-1.5 rounded-md border bg-transparent px-3 py-2 text-sm focus-within:ring-[oklch(0.55_0.15_160/0.3)] focus-within:border-[oklch(0.55_0.15_160/0.5)] min-h-[40px]">
                  <AnimatePresence>
                    {tags.map((tag) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.55_0.15_160/0.1)] text-[oklch(0.55_0.15_160)] px-2.5 py-0.5 text-xs font-medium"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  <input
                    id="task-tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={tags.length === 0 ? t.createTask.tagsPlaceholder : ''}
                    className="flex-1 min-w-[80px] bg-transparent outline-none placeholder:text-muted-foreground/60 text-sm"
                  />
                </div>
              </div>

              {/* Subtasks */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <ListChecks className="h-3.5 w-3.5 text-muted-foreground" />
                  {t.createTask.subtasks}
                  {subtasks.length > 0 && (
                    <span className="text-[10px] text-muted-foreground/60 ml-1">
                      ({subtasks.length})
                    </span>
                  )}
                </Label>
                <AnimatePresence>
                  {subtasks.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1.5 overflow-hidden"
                    >
                      {subtasks.map((subtask, index) => (
                        <motion.div
                          key={subtask.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.15, delay: index * 0.03 }}
                          className="flex items-center gap-2 group"
                        >
                          <div className="h-4 w-4 rounded border border-muted-foreground/30 shrink-0" />
                          <span className="text-sm flex-1 truncate">{subtask.title}</span>
                          <button
                            type="button"
                            onClick={() => removeSubtask(subtask.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-center gap-2">
                  <Input
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={handleSubtaskKeyDown}
                    placeholder={t.createTask.subtaskPlaceholder}
                    className="h-9 text-sm focus-visible:ring-[oklch(0.55_0.15_160/0.3)]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSubtask}
                    disabled={!newSubtask.trim()}
                    className="h-9 px-3 shrink-0 hover:border-[oklch(0.55_0.15_160/0.3)] hover:text-[oklch(0.55_0.15_160)]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleOpenChange(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t.createTask.cancel}
                </Button>
                <Button
                  type="submit"
                  disabled={!title.trim()}
                  className="bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.48_0.12_160)] hover:from-[oklch(0.50_0.15_160)] hover:to-[oklch(0.44_0.12_160)] text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:shadow-none"
                >
                  <CheckSquare className="h-4 w-4 mr-1.5" />
                  {t.createTask.create}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
