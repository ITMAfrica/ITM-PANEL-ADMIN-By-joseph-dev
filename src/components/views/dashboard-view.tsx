'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useDashboardSummary } from '@/hooks/use-dashboard-summary';
import { useUserLookup } from '@/hooks/use-user-lookup';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { ViewShell, ViewTabPanel } from '@/components/view-layout';
import { DashboardMetricsGrid } from '@/components/dashboard-metrics-grid';

const EMPTY_APPROVAL: {
  id: string;
  type: string;
  title: string;
  authorId: string;
  updatedAt: string;
}[] = [];

function getRelativeTime(dateStr: string, locale: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (locale === 'fr') {
    if (diffMins < 1) return "à l'instant";
    if (diffMins < 60) return `il y a ${diffMins}m`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays < 7) return `il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
  }
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function DashboardView() {
  const { t, locale } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const { data: summary } = useDashboardSummary(activeTenantId);
  const approvalItems = summary?.approvalQueue ?? EMPTY_APPROVAL;
  const { getUserName, getUserInitials } = useUserLookup(activeTenantId);

  return (
    <ViewShell>
      <ViewTabPanel>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-5"
        >
          <DashboardMetricsGrid />

          {approvalItems.length > 0 && (
            <Card className="overflow-hidden dark-card-glow border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      {t.dashboard.approvalQueue}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {t.dashboard.approvalQueueDesc}
                    </p>
                  </div>
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
                    {approvalItems.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {approvalItems.map((contentItem) => (
                      <div
                        key={contentItem.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{contentItem.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="h-4 w-4">
                              <AvatarFallback className="text-xs bg-muted">
                                {getUserInitials(contentItem.authorId)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                              {getUserName(contentItem.authorId)}
                            </span>
                            <span className="text-sm text-muted-foreground/60">·</span>
                            <span className="text-sm text-muted-foreground/60">
                              {getRelativeTime(contentItem.updatedAt, locale)}
                            </span>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {approvalItems.length === 0 && (
            <Card className="overflow-hidden dark-card-glow border">
              <CardContent className="flex flex-col items-center justify-center py-8 gap-2">
                <p className="text-sm font-medium text-foreground">{t.dashboard.allClear}</p>
                <p className="text-xs text-muted-foreground">{t.dashboard.allClearDesc}</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </ViewTabPanel>
    </ViewShell>
  );
}
