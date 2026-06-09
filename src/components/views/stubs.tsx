'use client';

import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  LucideIcon,
} from 'lucide-react';

function StubView({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="border-border/50 shadow-lg overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.65_0.16_160)]" />
          <CardContent className="flex flex-col items-center gap-4 py-12 px-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[oklch(0.55_0.15_160/0.15)] to-[oklch(0.55_0.15_160/0.05)] border border-[oklch(0.55_0.15_160/0.2)]"
            >
              <Icon className="h-8 w-8 text-[oklch(0.55_0.15_160)]" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="text-center"
            >
              <h2 className="text-xl font-bold tracking-tight text-foreground">{label}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t.common.loading}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.2 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[oklch(0.55_0.15_160/0.1)] text-[oklch(0.55_0.15_160)] text-xs font-medium border border-[oklch(0.55_0.15_160/0.15)]"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[oklch(0.55_0.15_160)] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[oklch(0.55_0.15_160)]" />
              </span>
              Coming soon
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// NOTE: SchedulingView, PublishingView, ChannelsView, StatisticsView have been
// replaced by dedicated view components. These stubs are kept for views that
// are still being imported but haven't been fully implemented yet.
