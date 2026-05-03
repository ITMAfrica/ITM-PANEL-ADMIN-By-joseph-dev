'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
  Activity,
  ChevronRight,
} from 'lucide-react';
import { mockAutomations } from '@/lib/mock-data';
import { useTranslation } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ─── Animation ───────────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ─── Main Component ──────────────────────────────────────────────────────────
export function AutomationsView() {
  const { t } = useTranslation();
  const [automations, setAutomations] = useState(mockAutomations);

  const toggleAutomation = useCallback((id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  }, []);

  const enabledCount = automations.filter((a) => a.enabled).length;
  const totalRuns = automations.reduce((acc, a) => acc + a.runCount, 0);

  const statCards = [
    {
      title: t.automations.totalAutomations,
      value: automations.length,
      icon: Zap,
      gradient: 'from-teal-500/10 via-teal-500/5 to-transparent',
      iconBg: 'bg-teal-500/15 border-teal-500/15',
      iconColor: 'text-teal-600',
      borderAccent: 'border-teal-500/20',
    },
    {
      title: t.automations.active,
      value: enabledCount,
      icon: Play,
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-500/15 border-emerald-500/15',
      iconColor: 'text-emerald-600',
      borderAccent: 'border-emerald-500/20',
    },
    {
      title: t.automations.totalRuns,
      value: totalRuns,
      icon: Clock,
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      iconBg: 'bg-amber-500/15 border-amber-500/15',
      iconColor: 'text-amber-600',
      borderAccent: 'border-amber-500/20',
    },
  ];

  return (
    <div className="space-y-5">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t.automations.title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {automations.length} {t.automations.title.toLowerCase()} · {enabledCount} {t.automations.active.toLowerCase()}
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.50_0.15_165)] hover:from-[oklch(0.50_0.15_160)] hover:to-[oklch(0.45_0.15_165)] shadow-sm shadow-[oklch(0.55_0.15_160/0.2)] text-white"
        >
          <Plus className="h-4 w-4" /> {t.automations.createAutomation}
        </Button>
      </div>

      {/* ─── Stats Header Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat, i) => {
          const IconComp = stat.icon;
          return (
            <motion.div key={i} variants={item}>
              <Card className={`relative overflow-hidden border ${stat.borderAccent} shadow-sm hover:shadow-md transition-shadow duration-300 group`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
                <CardContent className="relative p-4 flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${stat.iconBg}`}>
                    <IconComp className={`h-4 w-4 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{stat.title}</p>
                    <p className="text-xl font-extrabold tracking-tight">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Automation Cards ────────────────────────────────────────────── */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        <AnimatePresence mode="popLayout">
          {automations.map((automation, idx) => (
            <motion.div
              key={automation.id}
              variants={item}
              layout
              className="relative"
            >
              <Card
                className={cn(
                  'overflow-hidden transition-all duration-300 hover:shadow-md border-border/60',
                  !automation.enabled && 'opacity-70'
                )}
              >
                {/* Colored left border */}
                <div
                  className={cn(
                    'absolute left-0 top-0 bottom-0 w-1 transition-colors duration-300',
                    automation.enabled
                      ? 'bg-gradient-to-b from-[oklch(0.55_0.15_160)] to-[oklch(0.55_0.15_160)/0.5]'
                      : 'bg-slate-300'
                  )}
                />

                <CardContent className="p-5 pl-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Automation Icon */}
                      <div
                        className={cn(
                          'p-2.5 rounded-xl flex-shrink-0 border transition-colors duration-300',
                          automation.enabled
                            ? 'bg-[oklch(0.55_0.15_160/0.1)] border-[oklch(0.55_0.15_160/0.15)]'
                            : 'bg-muted border-border'
                        )}
                      >
                        <Zap
                          className={cn(
                            'h-5 w-5 transition-colors duration-300',
                            automation.enabled ? 'text-[oklch(0.55_0.15_160)]' : 'text-muted-foreground'
                          )}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Name + Status Badge */}
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="text-sm font-semibold">{automation.name}</h3>
                          <Badge
                            className={cn(
                              'text-[10px] px-2 py-0 h-4 font-semibold border-0 gap-1',
                              automation.enabled
                                ? 'bg-emerald-500/10 text-emerald-700'
                                : 'bg-slate-500/10 text-slate-500'
                            )}
                          >
                            <div className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              automation.enabled ? 'bg-emerald-500' : 'bg-slate-400'
                            )} />
                            {automation.enabled ? t.automations.activeLabel : t.automations.disabled}
                          </Badge>
                        </div>

                        {/* Trigger → Action Flow */}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/15 text-amber-700 text-xs font-medium">
                            <Play className="h-3 w-3" />
                            {automation.trigger}
                          </div>
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3 + idx * 0.05 }}
                          >
                            <ArrowRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                          </motion.div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/15 text-cyan-700 text-xs font-medium">
                            <Zap className="h-3 w-3" />
                            {automation.action}
                          </div>
                        </div>

                        {/* Meta info */}
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                            <Activity className="h-3 w-3" />
                            {t.automations.ran} {automation.runCount} {t.automations.times}
                          </span>
                          {automation.lastRun && (
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                              <Clock className="h-3 w-3" />
                              {t.automations.last}: {new Date(automation.lastRun).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Switch
                        checked={automation.enabled}
                        onCheckedChange={() => toggleAutomation(automation.id)}
                        className={cn(
                          automation.enabled
                            ? 'data-[state=checked]:bg-[oklch(0.55_0.15_160)]'
                            : ''
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
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
