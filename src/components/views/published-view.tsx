'use client';

import { useState, useMemo } from 'react';
import { CheckCircle, SortAsc } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { useContent } from '@/hooks/use-content';
import { stripMediaMarkdown } from '@/lib/media-insert';
import { useUserLookup } from '@/hooks/use-user-lookup';
import type { ContentItem, Article, Announcement, Newsletter } from '@/lib/types';
import {
  ViewShell,
  ViewSubNav,
  ViewTabPanel,
  ViewToolbar,
  ViewSearchInput,
  ViewOutlineButton,
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
} from '@/components/view-data-table';

type CombinedContent = ContentItem & { contentType: 'newsletter' | 'article' | 'announcement' };
type PublishedTab = 'published';

function getEngagementRate(content: CombinedContent): number {
  if (content.type === 'newsletter') {
    const nl = content as unknown as Newsletter;
    return nl.openRate ?? 0;
  }
  if (content.type === 'article') {
    const article = content as unknown as Article;
    return article.viewCount > 0
      ? Math.round(
          ((article.likeCount + article.commentCount + article.shareCount) / article.viewCount) * 100
        )
      : 0;
  }
  if (content.type === 'announcement') {
    const ann = content as unknown as Announcement;
    return ann.totalRecipients > 0
      ? Math.round((ann.acknowledgedCount / ann.totalRecipients) * 100)
      : 0;
  }
  return 0;
}

export function PublishedView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const locale = useAppStore((s) => s.locale);
  const setSelectedContent = useAppStore((s) => s.setSelectedContent);
  const { data: publishedItems = [] } = useContent({ tenantId: activeTenantId, status: 'published' });
  const { getUserName } = useUserLookup(activeTenantId);

  const [activeTab] = useState<PublishedTab>('published');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'engagement'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  const published: CombinedContent[] = useMemo(
    () =>
      publishedItems.map((item) => ({
        ...item,
        contentType: item.type as CombinedContent['contentType'],
      })),
    [publishedItems]
  );

  const filtered = useMemo(() => {
    let result = published;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) => c.title.toLowerCase().includes(q) || c.excerpt.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'date') {
        const aDate = a.publishedAt || a.updatedAt;
        const bDate = b.publishedAt || b.updatedAt;
        cmp = new Date(bDate).getTime() - new Date(aDate).getTime();
      } else if (sortBy === 'views') {
        cmp = b.viewCount - a.viewCount;
      } else {
        cmp = getEngagementRate(b) - getEngagementRate(a);
      }
      return sortAsc ? -cmp : cmp;
    });

    return result;
  }, [published, search, sortBy, sortAsc]);

  const tabs = [
    { id: 'published' as const, label: t.published.title, icon: <CheckCircle className="h-3.5 w-3.5" /> },
  ];

  const cycleSort = () => {
    setSortBy(sortBy === 'date' ? 'views' : sortBy === 'views' ? 'engagement' : 'date');
    setSortAsc(!sortAsc);
  };

  const sortLabel =
    sortBy === 'date'
      ? t.published.publishedDate
      : sortBy === 'views'
        ? t.published.viewCount
        : t.published.engagement;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <ViewShell>
      <ViewSubNav tabs={tabs} activeTab={activeTab} onTabChange={() => {}} />
      <ViewTabPanel>
        <ResourceAnalyticsPanel resourceId="published-content" />

        <ViewToolbar>
          <ViewSearchInput value={search} onChange={setSearch} placeholder={t.published.search} />
          <ViewOutlineButton icon={<SortAsc className="h-3.5 w-3.5" />} onClick={cycleSort}>
            {sortLabel}
          </ViewOutlineButton>
        </ViewToolbar>

        <ViewDataTable>
          <ViewDataTableHeader>
            <ViewDataTableHead>{t.editorialCalendar.columns.content}</ViewDataTableHead>
            <ViewDataTableHead className="hidden sm:table-cell">
              {t.published.publishedDate}
            </ViewDataTableHead>
            <ViewDataTableHead>{t.published.viewCount}</ViewDataTableHead>
            <ViewDataTableHead className="hidden md:table-cell">
              {t.published.engagement}
            </ViewDataTableHead>
            <ViewDataTableHead className="hidden lg:table-cell">
              {t.newsletters.author}
            </ViewDataTableHead>
          </ViewDataTableHeader>
          <ViewDataTableBody>
            {filtered.length === 0 ? (
              <ViewDataTableEmpty colSpan={5} message={t.published.noResults} />
            ) : (
              filtered.map((content) => {
                const engagement = getEngagementRate(content);
                return (
                  <ViewDataTableRow
                    key={content.id}
                    onClick={() =>
                      setSelectedContent(content as unknown as Record<string, unknown>)
                    }
                  >
                    <ViewDataTableCell>
                      <p className="font-medium text-[#1D141F] truncate">{content.title}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{stripMediaMarkdown(content.excerpt) || '—'}</p>
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden sm:table-cell text-muted-foreground text-xs">
                      {formatDate(content.publishedAt || content.updatedAt)}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="text-muted-foreground">
                      {content.viewCount.toLocaleString()}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden md:table-cell text-muted-foreground">
                      {engagement > 0 ? `${engagement}%` : '—'}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden lg:table-cell text-muted-foreground">
                      {getUserName(content.authorId)}
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
