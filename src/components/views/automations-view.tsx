'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
} from 'lucide-react';
import { mockAutomations } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

export function AutomationsView() {
  const [automations, setAutomations] = useState(mockAutomations);

  const toggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const enabledCount = automations.filter((a) => a.enabled).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Automations</h2>
          <p className="text-sm text-muted-foreground">
            {automations.length} automations · {enabledCount} active
          </p>
        </div>
        <Button className="bg-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.48_0.15_160)]" size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> Create Automation
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[oklch(0.55_0.15_160/0.1)]">
              <Zap className="h-4 w-4 text-[oklch(0.55_0.15_160)]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Automations</p>
              <p className="text-lg font-bold">{automations.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10">
              <Play className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-lg font-bold">{enabledCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10">
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Runs</p>
              <p className="text-lg font-bold">
                {automations.reduce((acc, a) => acc + a.runCount, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automation Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {automations.map((automation) => (
          <motion.div key={automation.id} variants={item}>
            <Card className={cn('transition-all', !automation.enabled && 'opacity-60')}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={cn(
                      'p-2.5 rounded-xl flex-shrink-0',
                      automation.enabled ? 'bg-[oklch(0.55_0.15_160/0.1)]' : 'bg-muted'
                    )}>
                      <Zap className={cn(
                        'h-5 w-5',
                        automation.enabled ? 'text-[oklch(0.55_0.15_160)]' : 'text-muted-foreground'
                      )} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold">{automation.name}</h3>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px]',
                            automation.enabled
                              ? 'border-emerald-200 text-emerald-600'
                              : 'border-slate-200 text-slate-500'
                          )}
                        >
                          {automation.enabled ? 'Active' : 'Disabled'}
                        </Badge>
                      </div>

                      {/* Trigger → Action */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 text-xs">
                          <Play className="h-3 w-3" />
                          {automation.trigger}
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 text-xs">
                          <Zap className="h-3 w-3" />
                          {automation.action}
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Ran {automation.runCount} times
                        </span>
                        {automation.lastRun && (
                          <span className="text-[10px] text-muted-foreground">
                            Last: {new Date(automation.lastRun).toLocaleDateString('en-US', {
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
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Switch
                      checked={automation.enabled}
                      onCheckedChange={() => toggleAutomation(automation.id)}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Play className="h-4 w-4 mr-2" /> Run Now
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
