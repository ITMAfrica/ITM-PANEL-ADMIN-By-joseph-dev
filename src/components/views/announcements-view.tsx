'use client';

import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { contentStatusColors, contentStatusLabels } from '@/lib/ui-constants';
import { stripMediaMarkdown } from '@/lib/media-insert';
import { useContent } from '@/hooks/use-content';
import { useUserLookup } from '@/hooks/use-user-lookup';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  ViewShell,
  ViewSubNav,
  ViewTabPanel,
  ViewToolbar,
  ViewSearchInput,
  BrandPrimaryButton,
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
import type { Announcement } from '@/lib/types';

const urgencyColors: Record<string, { bg: string; text: string; border: string }> = {
  info: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
  warning: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20' },
  critical: { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-500/20' },
};

const statusTabs = ['all', 'draft', 'review', 'published'] as const;
type StatusTab = typeof statusTabs[number];

export function AnnouncementsView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const openPublicationComposer = useAppStore((s) => s.openPublicationComposer);
  const setSelectedContent = useAppStore((s) => s.setSelectedContent);
  const { data: tenantAnnouncements = [] } = useContent({ tenantId: activeTenantId, type: 'announcement' });
  const announcements = tenantAnnouncements as Announcement[];
  const { getUserName } = useUserLookup(activeTenantId);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<StatusTab>('all');
  const [selectedAll, setSelectedAll] = useState(false);

  const filteredAnnouncements = useMemo(() => {
    let result = announcements;
    if (activeStatus !== 'all') {
      result = result.filter((an) => an.status === activeStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (an) =>
          an.title.toLowerCase().includes(q) ||
          an.excerpt.toLowerCase().includes(q) ||
          getUserName(an.authorId).toLowerCase().includes(q)
      );
    }
    return result;
  }, [announcements, activeStatus, searchQuery, getUserName]);

  const statusLabel = (status: string) => {
    const locale = useAppStore.getState().locale as 'fr' | 'en';
    return contentStatusLabels[locale]?.[status] || status;
  };

  const getStatusTabLabel = (tab: StatusTab): string => {
    if (tab === 'all') return t.announcements.all;
    return statusLabel(tab);
  };

  const getUrgencyLabel = (urgency: string): string => {
    switch (urgency) {
      case 'info': return t.announcements.info;
      case 'warning': return t.announcements.warning;
      case 'critical': return t.announcements.critical;
      default: return urgency;
    }
  };

  const getTargetAudienceLabel = (audience: string): string => {
    switch (audience) {
      case 'all': return t.announcements.allUsers;
      case 'tenant': return t.announcements.specificTenant;
      case 'role': return t.announcements.specificRole;
      default: return audience;
    }
  };

  const navTabs = useMemo(
    () => statusTabs.map((tab) => ({ id: tab, label: getStatusTabLabel(tab) })),
    [t]
  );

  return (
    <ViewShell>
      <ViewSubNav tabs={navTabs} activeTab={activeStatus} onTabChange={setActiveStatus} />
      <ViewTabPanel>
        <ViewToolbar
          actions={
            <BrandPrimaryButton onClick={() => openPublicationComposer({ type: 'announcement' })}>
              <Plus className="h-4 w-4" />
              {t.announcements.newAnnouncement}
            </BrandPrimaryButton>
          }
        >
          <ViewSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t.announcements.search}
          />
        </ViewToolbar>

        <ViewDataTable>
          <ViewDataTableHeader>
            <ViewDataTableCheckboxHead checked={selectedAll} onCheckedChange={setSelectedAll} />
            <ViewDataTableHead>{t.editorialCalendar.columns.content}</ViewDataTableHead>
            <ViewDataTableHead className="hidden sm:table-cell">
              {t.announcements.urgency}
            </ViewDataTableHead>
            <ViewDataTableHead className="hidden md:table-cell">
              {t.announcements.targetAudience}
            </ViewDataTableHead>
            <ViewDataTableHead className="hidden lg:table-cell">
              {t.announcements.acknowledged}
            </ViewDataTableHead>
            <ViewDataTableHead>{t.editorialCalendar.columns.status}</ViewDataTableHead>
          </ViewDataTableHeader>
          <ViewDataTableBody>
            {filteredAnnouncements.length === 0 ? (
              <ViewDataTableEmpty
                colSpan={6}
                message={t.announcements.noResults}
                illustrationId="flash-news"
              />
            ) : (
              filteredAnnouncements.map((announcement) => {
                const statusColor = contentStatusColors[announcement.status];
                const urgencyColor = urgencyColors[announcement.urgency];
                const ackPercent = announcement.totalRecipients > 0
                  ? Math.round((announcement.acknowledgedCount / announcement.totalRecipients) * 100)
                  : 0;
                return (
                  <ViewDataTableRow
                    key={announcement.id}
                    onClick={() =>
                      setSelectedContent(announcement as unknown as Record<string, unknown>)
                    }
                  >
                    <ViewDataTableCheckboxCell />
                    <ViewDataTableCell>
                      <p className="font-medium text-[#1D141F] truncate">{announcement.title}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {stripMediaMarkdown(announcement.excerpt) || '—'}
                      </p>
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden sm:table-cell">
                      <ViewStatusText
                        label={getUrgencyLabel(announcement.urgency)}
                        className={cn(
                          urgencyColor.bg,
                          urgencyColor.text,
                          urgencyColor.border
                        )}
                      />
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden md:table-cell text-muted-foreground">
                      {getTargetAudienceLabel(announcement.targetAudience)}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden lg:table-cell text-muted-foreground">
                      {announcement.totalRecipients > 0
                        ? `${announcement.acknowledgedCount}/${announcement.totalRecipients} (${ackPercent}%)`
                        : '—'}
                    </ViewDataTableCell>
                    <ViewDataTableCell>
                      <ViewStatusText
                        label={statusLabel(announcement.status)}
                        className={cn(
                          statusColor.bg,
                          statusColor.text,
                          statusColor.border
                        )}
                      />
                    </ViewDataTableCell>
                  </ViewDataTableRow>
                );
              })
            )}
          </ViewDataTableBody>
        </ViewDataTable>
      </ViewTabPanel>
    </ViewShell>
  );
}
