'use client';

import { useState, useMemo } from 'react';
import { FilePen, SortAsc } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { useContent } from '@/hooks/use-content';
import { stripMediaMarkdown } from '@/lib/media-insert';
import { useUserLookup } from '@/hooks/use-user-lookup';
import type { ContentItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  ViewShell,
  ViewSubNav,
  ViewTabPanel,
  ViewToolbar,
  ViewSearchInput,
  ViewOutlineButton,
} from '@/components/view-layout';
import { UpgradePlanBanner } from '@/components/upgrade-plan-banner';
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

type CombinedContent = ContentItem & { contentType: 'newsletter' | 'article' | 'announcement' };
type DraftsTab = 'drafts';

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
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getContentTypeColor(type: string) {
  switch (type) {
    case 'newsletter':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'article':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'announcement':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    default:
      return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
  }
}

export function DraftsView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const locale = useAppStore((s) => s.locale);
  const setSelectedContent = useAppStore((s) => s.setSelectedContent);
  const { data: draftItems = [] } = useContent({ tenantId: activeTenantId, status: 'draft' });
  const { getUserName } = useUserLookup(activeTenantId);

  const [activeTab] = useState<DraftsTab>('drafts');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'modified' | 'title'>('modified');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedAll, setSelectedAll] = useState(false);

  const drafts: CombinedContent[] = useMemo(
    () =>
      draftItems.map((item) => ({
        ...item,
        contentType: item.type as CombinedContent['contentType'],
      })),
    [draftItems]
  );

  const filtered = useMemo(() => {
    let result = drafts;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) => c.title.toLowerCase().includes(q) || c.excerpt.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'modified') {
        cmp = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else {
        cmp = a.title.localeCompare(b.title);
      }
      return sortAsc ? -cmp : cmp;
    });

    return result;
  }, [drafts, search, sortBy, sortAsc]);

  const tabs = [{ id: 'drafts' as const, label: t.drafts.title, icon: <FilePen className="h-3.5 w-3.5" /> }];

  return (
    <ViewShell>
      <UpgradePlanBanner variant="drafts" />
      <ViewSubNav tabs={tabs} activeTab={activeTab} onTabChange={() => {}} />
      <ViewTabPanel>
        <ResourceAnalyticsPanel resourceId="published-content" />

        <ViewToolbar>
          <ViewSearchInput value={search} onChange={setSearch} placeholder={t.drafts.search} />
          <ViewOutlineButton
            icon={<SortAsc className="h-3.5 w-3.5" />}
            onClick={() => {
              setSortBy(sortBy === 'modified' ? 'title' : 'modified');
              setSortAsc(!sortAsc);
            }}
          >
            {sortBy === 'modified' ? t.drafts.lastModified : 'Titre'}
          </ViewOutlineButton>
        </ViewToolbar>

        <ViewDataTable>
          <ViewDataTableHeader>
            <ViewDataTableCheckboxHead checked={selectedAll} onCheckedChange={setSelectedAll} />
            <ViewDataTableHead>{t.editorialCalendar.columns.content}</ViewDataTableHead>
            <ViewDataTableHead className="hidden md:table-cell">
              {locale === 'fr' ? 'Type' : 'Type'}
            </ViewDataTableHead>
            <ViewDataTableHead className="hidden lg:table-cell">
              {t.newsletters.author}
            </ViewDataTableHead>
            <ViewDataTableHead className="hidden sm:table-cell">
              {t.drafts.lastModified}
            </ViewDataTableHead>
          </ViewDataTableHeader>
          <ViewDataTableBody>
            {filtered.length === 0 ? (
              <ViewDataTableEmpty colSpan={5} message={t.drafts.noResults} />
            ) : (
              filtered.map((draft) => {
                const typeColor = getContentTypeColor(draft.contentType);
                return (
                  <ViewDataTableRow
                    key={draft.id}
                    onClick={() =>
                      setSelectedContent(draft as unknown as Record<string, unknown>)
                    }
                  >
                    <ViewDataTableCheckboxCell />
                    <ViewDataTableCell>
                      <p className="font-medium text-[#1D141F] truncate">{draft.title}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{stripMediaMarkdown(draft.excerpt) || '—'}</p>
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden md:table-cell">
                      <ViewStatusText
                        label={t.nav[draft.contentType as keyof typeof t.nav] || draft.contentType}
                        className={cn(typeColor)}
                      />
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden lg:table-cell text-muted-foreground">
                      {getUserName(draft.authorId)}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden sm:table-cell text-muted-foreground text-xs">
                      {getRelativeTime(draft.updatedAt, locale)}
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
