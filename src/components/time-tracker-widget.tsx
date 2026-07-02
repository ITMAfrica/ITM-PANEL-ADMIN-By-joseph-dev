'use client';

import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { Play, Pause, Square, Timer } from 'lucide-react';

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function TimeTrackerWidget() {
  const { t } = useTranslation();
  const timeTracker = useAppStore((s) => s.timeTracker);
  const startTracking = useAppStore((s) => s.startTracking);
  const stopTracking = useAppStore((s) => s.stopTracking);
  const pauseTracking = useAppStore((s) => s.pauseTracking);
  const resumeTracking = useAppStore((s) => s.resumeTracking);
  const tickTimer = useAppStore((s) => s.tickTimer);

  // Tick every second when tracking
  useEffect(() => {
    if (!timeTracker.isTracking || timeTracker.isPaused) return;
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [timeTracker.isTracking, timeTracker.isPaused, tickTimer]);

  const handleStartTimer = () => {
    startTracking('', t.timeTracker.noActiveTimer, '#3b82f6');
  };

  const recentEntries = timeTracker.timeEntries.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }}
    >
      <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow duration-300">
        {/* Teal gradient header */}
        <div className="bg-gradient-to-r from-[oklch(0.55_0.18_250)] to-[oklch(0.45_0.18_250)] px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            <h3 className="text-sm font-semibold">{t.timeTracker.title}</h3>
          </div>
        </div>

        <CardContent className="p-4 space-y-4">
          {/* Active Timer Display */}
          {timeTracker.isTracking ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: timeTracker.activeProjectColor || '#3b82f6' }}
                    />
                    <span className="text-sm font-medium truncate max-w-[200px]">
                      {timeTracker.activeTaskName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pl-4.5">
                    <span
                      className={`text-2xl font-mono font-bold tabular-nums ${
                        timeTracker.isPaused ? 'text-amber-500' : 'text-[oklch(0.55_0.18_250)]'
                      }`}
                    >
                      {formatTime(timeTracker.elapsedSeconds)}
                    </span>
                    {timeTracker.isPaused && (
                      <span className="text-xs font-medium text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                        {t.timeTracker.paused}
                      </span>
                    )}
                    {!timeTracker.isPaused && (
                      <span className="text-xs font-medium text-[oklch(0.55_0.18_250)] bg-[oklch(0.55_0.18_250/0.1)] px-1.5 py-0.5 rounded-full">
                        {t.timeTracker.tracking}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center gap-2">
                {timeTracker.isPaused ? (
                  <Button
                    onClick={resumeTracking}
                    size="sm"
                    className="h-8 gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs"
                  >
                    <Play className="h-3.5 w-3.5" />
                    {t.timeTracker.resume}
                  </Button>
                ) : (
                  <Button
                    onClick={pauseTracking}
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5 border-amber-500/30 text-amber-600 hover:bg-amber-500/10 text-xs"
                  >
                    <Pause className="h-3.5 w-3.5" />
                    {t.timeTracker.pause}
                  </Button>
                )}
                <Button
                  onClick={stopTracking}
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 border-rose-500/30 text-rose-600 hover:bg-rose-500/10 text-xs"
                >
                  <Square className="h-3.5 w-3.5" />
                  {t.timeTracker.stop}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">{t.timeTracker.noActiveTimer}</div>
              </div>
              <Button
                onClick={handleStartTimer}
                size="sm"
                className="h-8 gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs"
              >
                <Play className="h-3.5 w-3.5" />
                {t.timeTracker.startTimer}
              </Button>
            </div>
          )}

          {/* Today's Summary */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="space-y-0.5">
              <p className="text-sm text-muted-foreground">{t.timeTracker.todayTotal}</p>
              <p className="text-sm font-semibold text-[oklch(0.55_0.18_250)]">
                {formatDuration(timeTracker.todayTotal)}
              </p>
            </div>
            <div className="text-right space-y-0.5">
              <p className="text-sm text-muted-foreground">{t.timeTracker.tasksWorked}</p>
              <p className="text-sm font-semibold">{timeTracker.todayTasksCount}</p>
            </div>
          </div>

          {/* Recent Time Entries */}
          {recentEntries.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {t.timeTracker.recentEntries}
              </p>
              {recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between py-1.5 group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: entry.projectColor }}
                    />
                    <span className="text-xs truncate max-w-[180px] group-hover:text-foreground transition-colors">
                      {entry.taskName}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground tabular-nums">
                    {formatDuration(entry.duration)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
