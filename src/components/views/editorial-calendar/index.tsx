'use client';

import { Suspense, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { safeReplace } from '@/lib/safe-navigate';
import { ChannelsPanel } from '@/components/views/channels-panel';
import { SchedulingQueuePanel } from '@/components/views/scheduling-queue-panel';
import { UpgradePlanBanner } from '@/components/upgrade-plan-banner';
import type { ContentType } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { ViewPlaceholderPanel, ViewShell, ViewTabPanel } from '@/components/view-layout';
import { CalendarTabContent, EditorialSubNav } from './calendar-grid';
import { ListTabContent } from './publication-list';
import { ArchivedPublicationsTab, LibraryPublicationsTab } from './tabs';
import { type EditorialTab, isEditorialTab } from './types';

export function EditorialCalendarView() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <EditorialCalendarViewContent />
    </Suspense>
  );
}

function EditorialCalendarViewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const tabParam = searchParams.get('tab');
  const activeTab: EditorialTab = isEditorialTab(tabParam) ? tabParam : 'calendar';
  const typeParam = searchParams.get('type');
  const filterParam = searchParams.get('filter');
  const contentTypes: ContentType[] = [
    'newsletter',
    'article',
    'announcement',
    'communique',
    'campaign',
  ];
  const typeFilter: ContentType | undefined =
    typeParam && contentTypes.includes(typeParam as ContentType)
      ? (typeParam as ContentType)
      : filterParam === 'campaigns'
        ? 'campaign'
        : undefined;

  const setActiveTab = useCallback(
    (tab: EditorialTab) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', tab);
      safeReplace(router, `/editorial-calendar?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      const type = searchParams.get('composerType');
      const store = useAppStore.getState();
      store.openPublicationComposer(
        type === 'newsletter' ||
          type === 'article' ||
          type === 'announcement' ||
          type === 'communique' ||
          type === 'social'
          ? { type }
          : undefined
      );
      const params = new URLSearchParams(searchParams.toString());
      params.delete('create');
      params.delete('composerType');
      safeReplace(router, `/editorial-calendar?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, router]);

  return (
    <ViewShell>
      <UpgradePlanBanner variant="editorialCalendar" />
      <EditorialSubNav activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'list' && <ListTabContent typeFilter={typeFilter} />}
      {activeTab === 'calendar' && <CalendarTabContent />}
      {activeTab === 'queue' && <SchedulingQueuePanel />}
      {activeTab === 'channels' && <ChannelsPanel />}
      {activeTab === 'library' && <LibraryPublicationsTab />}
      {activeTab === 'autoLists' && (
        <ViewTabPanel>
          <ViewPlaceholderPanel
            title={t.editorialCalendar.comingSoon}
            description={t.editorialCalendar.placeholderAutoLists}
            series2Id="journey-map"
          />
        </ViewTabPanel>
      )}
      {activeTab === 'deleted' && <ArchivedPublicationsTab />}
    </ViewShell>
  );
}
