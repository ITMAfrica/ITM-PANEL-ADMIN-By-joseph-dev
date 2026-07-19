'use client';

import { useMemo } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { contentStatusColors, contentStatusLabels } from '@/lib/ui-constants';
import { useContent, useUpdateContent } from '@/hooks/use-content';
import { useDistributionChannels } from '@/hooks/use-distribution-channels';
import { useUserLookup } from '@/hooks/use-user-lookup';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import type { ContentItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ViewTabPanel } from '@/components/view-layout';
import { CreatePublicationMenu } from '@/components/publication-composer/create-publication-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
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

function formatCountdown(
  targetDate: string,
  locale: 'fr' | 'en',
  nowLabel: string
): string {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return nowLabel;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return locale === 'fr' ? `${days}j ${hours}h` : `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getChannelNames(
  channelIds: string[],
  channels: { id: string; name: string }[]
): string[] {
  return channelIds.map((id) => channels.find((c) => c.id === id)?.name || id);
}

function getContentChannelIds(content: ContentItem): string[] {
  return 'channelIds' in content &&
    Array.isArray((content as { channelIds?: string[] }).channelIds)
    ? (content as { channelIds: string[] }).channelIds
    : [];
}

export function SchedulingQueuePanel() {
  const { t, locale } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const setSelectedContent = useAppStore((s) => s.setSelectedContent);
  const setContentDetailOpen = useAppStore((s) => s.setContentDetailOpen);
  const { data: scheduledItems = [] } = useContent({
    tenantId: activeTenantId,
    status: 'scheduled',
  });
  const { data: distributionChannels = [] } = useDistributionChannels(activeTenantId);
  const { getUserName } = useUserLookup(activeTenantId);
  const updateContent = useUpdateContent();

  const scheduledContent = useMemo(() => {
    return [...scheduledItems].sort((a, b) => {
      const dateA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Infinity;
      const dateB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Infinity;
      return dateA - dateB;
    });
  }, [scheduledItems]);

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

  const openContent = (content: ContentItem) => {
    setSelectedContent(content as unknown as Record<string, unknown>);
    setContentDetailOpen(true);
  };

  const cancelSchedule = (content: ContentItem, e: React.MouseEvent) => {
    e.stopPropagation();
    updateContent.mutate({
      id: content.id,
      data: { status: 'draft', scheduledAt: null },
    });
  };

  return (
    <ViewTabPanel>
      <div className="flex justify-end mb-4">
        <CreatePublicationMenu />
      </div>
      <ViewDataTable>
        <ViewDataTableHeader>
          <ViewDataTableHead>{t.editorialCalendar.columns.content}</ViewDataTableHead>
          <ViewDataTableHead className="hidden sm:table-cell">
            {t.editorialCalendar.columns.date}
          </ViewDataTableHead>
          <ViewDataTableHead className="hidden md:table-cell">
            {t.scheduling.countdown}
          </ViewDataTableHead>
          <ViewDataTableHead className="hidden lg:table-cell">
            {t.newsletters.author}
          </ViewDataTableHead>
          <ViewDataTableHead className="hidden lg:table-cell">
            {t.editorialCalendar.columns.networks}
          </ViewDataTableHead>
          <ViewDataTableHead>{t.editorialCalendar.columns.status}</ViewDataTableHead>
          <ViewDataTableHead className="w-12" />
        </ViewDataTableHeader>
        <ViewDataTableBody>
          {scheduledContent.length === 0 ? (
            <ViewDataTableEmpty
              colSpan={7}
              message={t.scheduling.noScheduled}
              illustrationId="schedule-post"
            />
          ) : (
            scheduledContent.map((content) => {
              const channelNames = getChannelNames(
                getContentChannelIds(content),
                distributionChannels
              );
              const statusColor =
                contentStatusColors[content.status] || contentStatusColors.draft;

              return (
                <ViewDataTableRow key={content.id} onClick={() => openContent(content)}>
                  <ViewDataTableCell>
                    <p className="font-medium text-[#1D141F] truncate">{content.title}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">
                      {content.type}
                    </p>
                  </ViewDataTableCell>
                  <ViewDataTableCell className="hidden sm:table-cell text-muted-foreground text-xs">
                    {content.scheduledAt ? formatScheduledDate(content.scheduledAt) : '—'}
                  </ViewDataTableCell>
                  <ViewDataTableCell className="hidden md:table-cell text-amber-600 text-xs font-medium">
                    {content.scheduledAt
                      ? formatCountdown(content.scheduledAt, locale as 'fr' | 'en', t.scheduling.now)
                      : '—'}
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
                  <ViewDataTableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => openContent(content)}>
                          {t.scheduling.openDetail}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-rose-600"
                          onClick={(e) => cancelSchedule(content, e)}
                          disabled={updateContent.isPending}
                        >
                          {t.scheduling.cancelSchedule}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </ViewDataTableCell>
                </ViewDataTableRow>
              );
            })
          )}
        </ViewDataTableBody>
      </ViewDataTable>
    </ViewTabPanel>
  );
}
