'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Zap,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  Play,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  Bell,
  Tag,
  UserPlus,
  CalendarClock,
  MessageSquare,
  Mail,
  LayoutList,
  ArrowRightLeft,
} from 'lucide-react';
import { useAutomations } from '@/hooks/use-automations';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ViewShell,
  ViewSubNav,
  ViewTabPanel,
  ViewToolbar,
  BrandPrimaryButton,
  ViewStatGrid,
  ViewStatCard,
} from '@/components/view-layout';
import {
  ViewDataTable,
  ViewDataTableHeader,
  ViewDataTableHead,
  ViewDataTableCheckboxHead,
  ViewDataTableBody,
  ViewDataTableRow,
  ViewDataTableCell,
  ViewDataTableCheckboxCell,
  ViewDataTableEmpty,
  ViewStatusText,
} from '@/components/view-data-table';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const EMPTY_ARRAY: import('@/lib/types').Automation[] = [];

const automationTemplates = [
  {
    id: 'tpl-1',
    nameKey: 'autoAssignByPriority' as const,
    descKey: 'autoAssignByPriorityDesc' as const,
    trigger: 'autoAssignByPriority' as const,
    action: 'actionAssignMember' as const,
  },
  {
    id: 'tpl-2',
    nameKey: 'sendDeadlineReminders' as const,
    descKey: 'sendDeadlineRemindersDesc' as const,
    trigger: 'triggerDeadlineApproaching' as const,
    action: 'actionSendNotification' as const,
  },
  {
    id: 'tpl-3',
    nameKey: 'moveCompletedToDone' as const,
    descKey: 'moveCompletedToDoneDesc' as const,
    trigger: 'triggerStatusChanged' as const,
    action: 'actionMoveContent' as const,
  },
  {
    id: 'tpl-4',
    nameKey: 'notifyOnStatusChange' as const,
    descKey: 'notifyOnStatusChangeDesc' as const,
    trigger: 'triggerStatusChanged' as const,
    action: 'actionSendNotification' as const,
  },
  {
    id: 'tpl-5',
    nameKey: 'weeklyProgressReport' as const,
    descKey: 'weeklyProgressReportDesc' as const,
    trigger: 'triggerDeadlineApproaching' as const,
    action: 'actionSendEmail' as const,
  },
  {
    id: 'tpl-6',
    nameKey: 'autoCreateRecurringTasks' as const,
    descKey: 'autoCreateRecurringTasksDesc' as const,
    trigger: 'triggerContentCreated' as const,
    action: 'actionAddTag' as const,
  },
];

const executionHistory = [
  { id: 'eh-1', name: 'Auto-assign urgent tasks', timestamp: '2025-01-20T08:00:00Z', status: 'success', duration: '1.2s' },
  { id: 'eh-2', name: 'Deadline reminder', timestamp: '2025-01-20T09:00:00Z', status: 'success', duration: '0.8s' },
  { id: 'eh-3', name: 'Welcome new members', timestamp: '2025-01-19T14:00:00Z', status: 'failed', duration: '3.1s' },
  { id: 'eh-4', name: 'Sprint report generation', timestamp: '2025-01-17T17:00:00Z', status: 'success', duration: '5.4s' },
  { id: 'eh-5', name: 'Auto-assign urgent tasks', timestamp: '2025-01-17T08:00:00Z', status: 'success', duration: '1.1s' },
  { id: 'eh-6', name: 'Deadline reminder', timestamp: '2025-01-17T09:00:00Z', status: 'success', duration: '0.9s' },
  { id: 'eh-7', name: 'Welcome new members', timestamp: '2025-01-16T10:00:00Z', status: 'success', duration: '2.0s' },
  { id: 'eh-8', name: 'Sprint report generation', timestamp: '2025-01-10T17:00:00Z', status: 'failed', duration: '8.2s' },
];

const enabledStatus = 'bg-blue-500/10 text-blue-700 border-blue-500/20';
const disabledStatus = 'bg-slate-500/10 text-slate-500 border-slate-500/20';

function CreateAutomationDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const [trigger, setTrigger] = useState('');
  const [action, setAction] = useState('');
  const [condition, setCondition] = useState('');

  const triggerOptions = [
    { value: 'triggerContentCreated', icon: Plus, label: t.automations.triggerContentCreated },
    { value: 'triggerStatusChanged', icon: ArrowRightLeft, label: t.automations.triggerStatusChanged },
    { value: 'triggerDeadlineApproaching', icon: CalendarClock, label: t.automations.triggerDeadlineApproaching },
    { value: 'triggerCommentAdded', icon: MessageSquare, label: t.automations.triggerCommentAdded },
  ];

  const actionOptions = [
    { value: 'actionSendNotification', icon: Bell, label: t.automations.actionSendNotification },
    { value: 'actionMoveContent', icon: ArrowRight, label: t.automations.actionMoveContent },
    { value: 'actionAssignMember', icon: UserPlus, label: t.automations.actionAssignMember },
    { value: 'actionAddTag', icon: Tag, label: t.automations.actionAddTag },
    { value: 'actionSendEmail', icon: Mail, label: t.automations.actionSendEmail },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[oklch(0.55_0.18_250)]/10 border border-[oklch(0.55_0.18_250)]/20">
              <Zap className="h-4 w-4 text-[oklch(0.55_0.18_250)]" />
            </div>
            {t.automations.createNewAutomation}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Play className="h-3 w-3" /> {t.automations.trigger}
            </label>
            <Select value={trigger} onValueChange={setTrigger}>
              <SelectTrigger className="h-9 text-xs bg-muted/30 border-transparent focus:border-[oklch(0.55_0.18_250/0.3)]">
                <SelectValue placeholder={t.automations.selectTrigger} />
              </SelectTrigger>
              <SelectContent>
                {triggerOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="flex items-center gap-2">
                      <opt.icon className="h-3.5 w-3.5" /> {opt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="h-5 w-5 text-muted-foreground/40" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-3 w-3" /> {t.automations.action}
            </label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="h-9 text-xs bg-muted/30 border-transparent focus:border-[oklch(0.55_0.18_250/0.3)]">
                <SelectValue placeholder={t.automations.selectAction} />
              </SelectTrigger>
              <SelectContent>
                {actionOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="flex items-center gap-2">
                      <opt.icon className="h-3.5 w-3.5" /> {opt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <LayoutList className="h-3 w-3" /> {t.automations.condition}
            </label>
            <Input
              placeholder={t.automations.addCondition}
              className="h-9 text-xs bg-muted/30 border-transparent focus:border-[oklch(0.55_0.18_250/0.3)]"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>{t.common.cancel}</Button>
          <Button
            size="sm"
            className="gap-1.5 bg-gradient-to-r from-[oklch(0.55_0.18_250)] to-[oklch(0.50_0.18_250)] text-white shadow-sm"
            disabled={!trigger || !action}
          >
            <Sparkles className="h-3.5 w-3.5" /> {t.common.create}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AutomationsView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const { data: fetchedAutomations = EMPTY_ARRAY } = useAutomations(activeTenantId);
  const [automations, setAutomations] = useState(fetchedAutomations);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedAll, setSelectedAll] = useState(false);

  useEffect(() => {
    setAutomations(fetchedAutomations);
  }, [fetchedAutomations]);

  const toggleAutomation = useCallback((id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  }, []);

  const enabledCount = automations.filter((a) => a.enabled).length;
  const runsThisWeek = 23;
  const timeSaved = 12.5;

  const formatLastRun = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ViewShell>
      <ViewSubNav
        tabs={[{ id: 'automations' as const, label: t.automations.title, icon: <Zap className="h-3.5 w-3.5" /> }]}
        activeTab="automations"
        onTabChange={() => {}}
      />
      <ViewTabPanel>
        <ViewStatGrid cols={4}>
          <ViewStatCard label={t.automations.totalAutomations} value={automations.length} />
          <ViewStatCard label={t.automations.active} value={enabledCount} />
          <ViewStatCard label={t.automations.runsThisWeek} value={runsThisWeek} />
          <ViewStatCard label={t.automations.timeSaved} value={`${timeSaved}${t.automations.hours}`} />
        </ViewStatGrid>

        <ViewToolbar
          actions={
            <BrandPrimaryButton onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4" /> {t.automations.createAutomation}
            </BrandPrimaryButton>
          }
        />

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">{t.automations.title}</h3>
          <ViewDataTable>
            <ViewDataTableHeader>
              <ViewDataTableCheckboxHead checked={selectedAll} onCheckedChange={setSelectedAll} />
              <ViewDataTableHead>{t.editorialCalendar.columns.content}</ViewDataTableHead>
              <ViewDataTableHead className="hidden md:table-cell">{t.automations.trigger}</ViewDataTableHead>
              <ViewDataTableHead className="hidden md:table-cell">{t.automations.action}</ViewDataTableHead>
              <ViewDataTableHead className="hidden lg:table-cell">{t.automations.ran}</ViewDataTableHead>
              <ViewDataTableHead className="hidden sm:table-cell">{t.automations.last}</ViewDataTableHead>
              <ViewDataTableHead>{t.editorialCalendar.columns.status}</ViewDataTableHead>
              <ViewDataTableHead className="w-24" />
            </ViewDataTableHeader>
            <ViewDataTableBody>
              {automations.length === 0 ? (
                <ViewDataTableEmpty
                  colSpan={8}
                  message={t.automations.title}
                  series2Id="automation-gears"
                />
              ) : (
                automations.map((automation) => (
                  <ViewDataTableRow
                    key={automation.id}
                    className={cn(!automation.enabled && 'opacity-70')}
                  >
                    <ViewDataTableCheckboxCell />
                    <ViewDataTableCell>
                      <p className="font-medium text-[#1D141F] truncate">{automation.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5 md:hidden">
                        {automation.trigger} → {automation.action}
                      </p>
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden md:table-cell text-muted-foreground text-xs">
                      {automation.trigger}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden md:table-cell text-muted-foreground text-xs">
                      {automation.action}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden lg:table-cell text-muted-foreground">
                      {automation.runCount} {t.automations.times}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden sm:table-cell text-muted-foreground text-xs">
                      {formatLastRun(automation.lastRun)}
                    </ViewDataTableCell>
                    <ViewDataTableCell>
                      <ViewStatusText
                        label={automation.enabled ? t.automations.activeLabel : t.automations.disabled}
                        className={automation.enabled ? enabledStatus : disabledStatus}
                      />
                    </ViewDataTableCell>
                    <ViewDataTableCell>
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={automation.enabled}
                          onCheckedChange={() => toggleAutomation(automation.id)}
                          className={cn(
                            automation.enabled ? 'data-[state=checked]:bg-[oklch(0.55_0.18_250)]' : ''
                          )}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem className="gap-2">
                              <Pencil className="h-4 w-4" /> {t.automations.edit}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Copy className="h-4 w-4" /> {t.automations.duplicate}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Play className="h-4 w-4" /> {t.automations.runNow}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive gap-2">
                              <Trash2 className="h-4 w-4" /> {t.automations.delete}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </ViewDataTableCell>
                  </ViewDataTableRow>
                ))
              )}
            </ViewDataTableBody>
          </ViewDataTable>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[oklch(0.55_0.18_250)]" />
            {t.automations.browseTemplates}
          </h3>
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {automationTemplates.map((tpl) => (
                <motion.div key={tpl.id} variants={item}>
                  <Card className="group hover:shadow-md transition-all duration-300 overflow-hidden">
                    <CardContent className="p-3 sm:p-4">
                      <div className="mb-3">
                        <h4 className="text-xs font-semibold">{t.automations[tpl.nameKey]}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{t.automations[tpl.descKey]}</p>
                      </div>

                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/5 border border-amber-500/10 text-xs font-medium text-amber-700">
                          <Play className="h-2.5 w-2.5" />
                          {t.automations[tpl.trigger]}
                        </div>
                        <ArrowRight className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-cyan-500/5 border border-cyan-500/10 text-xs font-medium text-cyan-700">
                          <Zap className="h-2.5 w-2.5" />
                          {t.automations[tpl.action]}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-7 text-xs gap-1.5 hover:border-[oklch(0.55_0.18_250/0.3)] hover:text-[oklch(0.55_0.18_250)]"
                      >
                        <Sparkles className="h-3 w-3" /> {t.automations.useTemplate}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-[oklch(0.55_0.18_250)]" />
            {t.automations.executionHistory}
          </h3>
          <Card className="overflow-hidden">
            <div className="divide-y">
              {executionHistory.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors"
                >
                  <div className={cn(
                    'p-1 rounded-md shrink-0',
                    entry.status === 'success' ? 'bg-blue-500/10' : 'bg-rose-500/10'
                  )}>
                    {entry.status === 'success'
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                      : <XCircle className="h-3.5 w-3.5 text-rose-600" />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs px-2 py-0 h-4 font-semibold border-0 gap-1 shrink-0',
                      entry.status === 'success'
                        ? 'bg-blue-500/10 text-blue-700'
                        : 'bg-rose-500/10 text-rose-700'
                    )}
                  >
                    {entry.status === 'success' ? t.automations.success : t.automations.failed}
                  </Badge>

                  <span className="text-xs text-muted-foreground font-mono shrink-0 w-12 text-right">
                    {entry.duration}
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        <CreateAutomationDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
      </ViewTabPanel>
    </ViewShell>
  );
}
