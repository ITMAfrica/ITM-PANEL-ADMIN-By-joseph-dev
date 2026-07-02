'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { contentStatusColors, contentStatusLabels } from '@/lib/ui-constants';
import { useContent } from '@/hooks/use-content';
import { useDistributionChannels } from '@/hooks/use-distribution-channels';
import { useUserLookup } from '@/hooks/use-user-lookup';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import type { ContentItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  ViewShell,
  ViewSubNav,
  ViewTabPanel,
  BrandPrimaryButton,
  ViewContentSurface,
  type ViewTab,
} from '@/components/view-layout';
import { ResourceAnalyticsPanel } from '@/components/resource-analytics';
import {
  ViewDataTable,
  ViewDataTableHeader,
  ViewDataTableHead,
  ViewDataTableBody,
  ViewDataTableRow,
  ViewDataTableCell,
  ViewDataTableEmpty,
  ViewStatusText,
} from '@/components/view-data-table';

type SchedulingTab = 'queue' | 'calendar';

function formatCountdown(targetDate: string): string {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return 'Maintenant';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}j ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getChannelNames(channelIds: string[], channels: { id: string; name: string }[]): string[] {
  return channelIds.map((id) => channels.find((c) => c.id === id)?.name || id);
}

export function SchedulingView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const locale = useAppStore((s) => s.locale);
  const openPublicationComposer = useAppStore((s) => s.openPublicationComposer);
  const setSelectedContent = useAppStore((s) => s.setSelectedContent);
  const { data: scheduledItems = [] } = useContent({ tenantId: activeTenantId, status: 'scheduled' });
  const { data: distributionChannels = [] } = useDistributionChannels(activeTenantId);
  const { getUserName } = useUserLookup(activeTenantId);
  const [activeTab, setActiveTab] = useState<SchedulingTab>('queue');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const scheduledContent = useMemo(() => {
    return [...scheduledItems].sort((a, b) => {
      const dateA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Infinity;
      const dateB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Infinity;
      return dateA - dateB;
    });
  }, [scheduledItems]);

  const today = new Date();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const daysInMonth = lastDay.getDate();
  const monthName = firstDay.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });

  const calendarDays = useMemo(() => {
    const days: { date: number; isCurrentMonth: boolean; items: typeof scheduledContent }[] = [];
    const prevLastDay = new Date(year, month, 0).getDate();
    for (let i = startPad - 1; i >= 0; i--) {
      days.push({ date: prevLastDay - i, isCurrentMonth: false, items: [] });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const itemsForDay = scheduledContent.filter((c) => c.scheduledAt?.startsWith(dateStr));
      days.push({ date: d, isCurrentMonth: true, items: itemsForDay });
    }
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: d, isCurrentMonth: false, items: [] });
    }
    return days;
  }, [year, month, startPad, daysInMonth, scheduledContent]);

  const statusLabel = (status: string) => {
    const loc = locale as 'fr' | 'en';
    return contentStatusLabels[loc]?.[status] || status;
  };

  const formatScheduledDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  const tabs: ViewTab<SchedulingTab>[] = [
    { id: 'queue', label: t.scheduling.queue, icon: <Clock className="h-3.5 w-3.5" /> },
    { id: 'calendar', label: t.scheduling.calendar, icon: <CalendarIcon className="h-3.5 w-3.5" /> },
  ];

  return (
    <ViewShell>
      <ViewSubNav
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        trailing={
          <BrandPrimaryButton onClick={() => openPublicationComposer()}>
            <Plus className="h-4 w-4" />
            {t.scheduling.scheduleSend}
          </BrandPrimaryButton>
        }
      />
      <ViewTabPanel>
        <ResourceAnalyticsPanel resourceId="published-content" />

        {activeTab === 'queue' && (
          <ViewDataTable>
            <ViewDataTableHeader>
              <ViewDataTableHead>{t.editorialCalendar.columns.content}</ViewDataTableHead>
              <ViewDataTableHead className="hidden sm:table-cell">
                {t.editorialCalendar.columns.date}
              </ViewDataTableHead>
              <ViewDataTableHead className="hidden md:table-cell">
                {locale === 'fr' ? 'Délai' : 'Countdown'}
              </ViewDataTableHead>
              <ViewDataTableHead className="hidden lg:table-cell">
                {t.newsletters.author}
              </ViewDataTableHead>
              <ViewDataTableHead className="hidden lg:table-cell">
                {t.editorialCalendar.columns.networks}
              </ViewDataTableHead>
              <ViewDataTableHead>{t.editorialCalendar.columns.status}</ViewDataTableHead>
            </ViewDataTableHeader>
            <ViewDataTableBody>
              {scheduledContent.length === 0 ? (
                <ViewDataTableEmpty colSpan={6} message={t.scheduling.noScheduled} />
              ) : (
                scheduledContent.map((content) => {
                  const channelNames =
                    'channelIds' in content
                      ? getChannelNames(
                          (content as ContentItem & { channelIds?: string[] }).channelIds || [],
                          distributionChannels
                        )
                      : [];
                  const statusColor = contentStatusColors[content.status] || contentStatusColors.draft;

                  return (
                    <ViewDataTableRow
                      key={content.id}
                      onClick={() =>
                        setSelectedContent(content as unknown as Record<string, unknown>)
                      }
                    >
                      <ViewDataTableCell>
                        <p className="font-medium text-[#1D141F] truncate">{content.title}</p>
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">{content.type}</p>
                      </ViewDataTableCell>
                      <ViewDataTableCell className="hidden sm:table-cell text-muted-foreground text-xs">
                        {content.scheduledAt ? formatScheduledDate(content.scheduledAt) : '—'}
                      </ViewDataTableCell>
                      <ViewDataTableCell className="hidden md:table-cell text-amber-600 text-xs font-medium">
                        {content.scheduledAt ? formatCountdown(content.scheduledAt) : '—'}
                      </ViewDataTableCell>
                      <ViewDataTableCell className="hidden lg:table-cell text-muted-foreground">
                        {getUserName(content.authorId)}
                      </ViewDataTableCell>
                      <ViewDataTableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                        {channelNames.length > 0 ? channelNames.join(', ') : '—'}
                      </ViewDataTableCell>
                      <ViewDataTableCell>
                        <ViewStatusText
                          label={statusLabel(content.status)}
                          className={cn(statusColor.bg, statusColor.text, statusColor.border)}
                        />
                      </ViewDataTableCell>
                    </ViewDataTableRow>
                  );
                })
              )}
            </ViewDataTableBody>
          </ViewDataTable>
        )}

        {activeTab === 'calendar' && (
          <ViewContentSurface>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-semibold capitalize">{monthName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setCurrentMonth(new Date())}
              >
                {locale === 'fr' ? "Aujourd'hui" : 'Today'}
              </Button>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-7 gap-1 mb-1">
                {(locale === 'fr'
                  ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
                  : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                ).map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  const isToday =
                    day.isCurrentMonth &&
                    day.date === today.getDate() &&
                    month === today.getMonth() &&
                    year === today.getFullYear();
                  return (
                    <div
                      key={idx}
                      className={cn(
                        'min-h-[72px] p-1.5 rounded-lg border text-xs transition-colors',
                        day.isCurrentMonth ? 'bg-background border-border/50' : 'bg-muted/20 border-transparent',
                        isToday && 'border-[oklch(0.55_0.18_250)] ring-1 ring-[oklch(0.55_0.18_250/0.2)]',
                        day.items.length > 0 && day.isCurrentMonth && 'bg-[oklch(0.55_0.18_250/0.02)]'
                      )}
                    >
                      <div
                        className={cn(
                          'flex items-center justify-center w-6 h-6 rounded-full text-sm mb-0.5',
                          isToday
                            ? 'bg-[oklch(0.55_0.18_250)] text-white font-bold'
                            : 'text-muted-foreground font-medium'
                        )}
                      >
                        {day.date}
                      </div>
                      <div className="space-y-0.5 max-h-[48px] overflow-hidden">
                        {day.items.slice(0, 2).map((content) => (
                          <div
                            key={content.id}
                            className="px-1 py-0.5 rounded bg-[oklch(0.55_0.18_250/0.1)] text-[oklch(0.55_0.18_250)] truncate text-xs font-medium"
                          >
                            {content.title}
                          </div>
                        ))}
                        {day.items.length > 2 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{day.items.length - 2}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ViewContentSurface>
        )}
      </ViewTabPanel>
    </ViewShell>
  );
}
