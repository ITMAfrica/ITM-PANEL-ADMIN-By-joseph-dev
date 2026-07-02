'use client';

import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useContent } from '@/hooks/use-content';
import { useUserLookup } from '@/hooks/use-user-lookup';
import { contentStatusColors, contentStatusLabels } from '@/lib/ui-constants';
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
import { ResourceAnalyticsPanel } from '@/components/resource-analytics';
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
import type { Newsletter } from '@/lib/types';

const statusTabs = ['all', 'draft', 'review', 'approved', 'scheduled', 'published', 'archived'] as const;
type StatusTab = typeof statusTabs[number];

export function NewslettersView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const openPublicationComposer = useAppStore((s) => s.openPublicationComposer);
  const setSelectedContent = useAppStore((s) => s.setSelectedContent);
  const { data: tenantNewsletters = [] } = useContent({
    tenantId: activeTenantId,
    type: 'newsletter',
  });
  const newsletters = tenantNewsletters as Newsletter[];
  const { getUserName } = useUserLookup(activeTenantId);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<StatusTab>('all');
  const [selectedAll, setSelectedAll] = useState(false);

  const filteredNewsletters = useMemo(() => {
    let result = newsletters;
    if (activeStatus !== 'all') {
      result = result.filter((nl) => nl.status === activeStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (nl) =>
          nl.title.toLowerCase().includes(q) ||
          nl.subject.toLowerCase().includes(q) ||
          getUserName(nl.authorId).toLowerCase().includes(q)
      );
    }
    return result;
  }, [newsletters, activeStatus, searchQuery, getUserName]);

  const statusLabel = (status: string) => {
    const locale = useAppStore.getState().locale as 'fr' | 'en';
    return contentStatusLabels[locale]?.[status] || status;
  };

  const getStatusTabLabel = (tab: StatusTab): string => {
    if (tab === 'all') return t.newsletters.all;
    return statusLabel(tab);
  };

  const navTabs = useMemo(
    () => statusTabs.map((tab) => ({ id: tab, label: getStatusTabLabel(tab) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, activeStatus]
  );

  const formatDate = (dateStr: string) => {
    const locale = useAppStore.getState().locale as 'fr' | 'en';
    return new Date(dateStr).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <ViewShell>
      <ViewSubNav tabs={navTabs} activeTab={activeStatus} onTabChange={setActiveStatus} />
      <ViewTabPanel>
        <ResourceAnalyticsPanel resourceId="newsletters" />

        <ViewToolbar
          actions={
            <BrandPrimaryButton onClick={() => openPublicationComposer({ type: 'newsletter' })}>
              <Plus className="h-4 w-4" />
              {t.newsletters.newNewsletter}
            </BrandPrimaryButton>
          }
        >
          <ViewSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t.newsletters.search}
          />
        </ViewToolbar>

        <ViewDataTable>
          <ViewDataTableHeader>
            <ViewDataTableCheckboxHead checked={selectedAll} onCheckedChange={setSelectedAll} />
            <ViewDataTableHead>{t.editorialCalendar.columns.content}</ViewDataTableHead>
            <ViewDataTableHead className="hidden md:table-cell">
              {t.newsletters.recipients}
            </ViewDataTableHead>
            <ViewDataTableHead className="hidden lg:table-cell">
              {t.newsletters.openRate}
            </ViewDataTableHead>
            <ViewDataTableHead className="hidden lg:table-cell">
              {t.newsletters.clickRate}
            </ViewDataTableHead>
            <ViewDataTableHead className="hidden sm:table-cell">
              {t.editorialCalendar.columns.date}
            </ViewDataTableHead>
            <ViewDataTableHead>{t.editorialCalendar.columns.status}</ViewDataTableHead>
          </ViewDataTableHeader>
          <ViewDataTableBody>
            {filteredNewsletters.length === 0 ? (
              <ViewDataTableEmpty colSpan={7} message={t.newsletters.noResults} />
            ) : (
              filteredNewsletters.map((newsletter) => {
                const statusColor = contentStatusColors[newsletter.status];
                return (
                  <ViewDataTableRow
                    key={newsletter.id}
                    onClick={() =>
                      setSelectedContent(newsletter as unknown as Record<string, unknown>)
                    }
                  >
                    <ViewDataTableCheckboxCell />
                    <ViewDataTableCell>
                      <p className="font-medium text-[#1D141F] truncate">{newsletter.title}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {newsletter.subject}
                      </p>
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden md:table-cell text-muted-foreground">
                      {newsletter.recipientCount}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden lg:table-cell text-muted-foreground">
                      {newsletter.openRate > 0 ? `${newsletter.openRate}%` : '—'}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden lg:table-cell text-muted-foreground">
                      {newsletter.clickRate > 0 ? `${newsletter.clickRate}%` : '—'}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden sm:table-cell text-muted-foreground text-xs">
                      {newsletter.scheduledAt
                        ? formatDate(newsletter.scheduledAt)
                        : formatDate(newsletter.updatedAt)}
                    </ViewDataTableCell>
                    <ViewDataTableCell>
                      <ViewStatusText
                        label={statusLabel(newsletter.status)}
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
