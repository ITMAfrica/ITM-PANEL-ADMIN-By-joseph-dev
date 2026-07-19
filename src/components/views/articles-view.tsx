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
import type { Article } from '@/lib/types';

const statusTabs = ['all', 'draft', 'review', 'approved', 'scheduled', 'published'] as const;
type StatusTab = typeof statusTabs[number];

export function ArticlesView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const openPublicationComposer = useAppStore((s) => s.openPublicationComposer);
  const setSelectedContent = useAppStore((s) => s.setSelectedContent);
  const { data: tenantArticles = [] } = useContent({ tenantId: activeTenantId, type: 'article' });
  const articles = tenantArticles as Article[];
  const { getUserName } = useUserLookup(activeTenantId);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<StatusTab>('all');
  const [selectedAll, setSelectedAll] = useState(false);

  const filteredArticles = useMemo(() => {
    let result = articles;
    if (activeStatus !== 'all') {
      result = result.filter((ar) => ar.status === activeStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (ar) =>
          ar.title.toLowerCase().includes(q) ||
          ar.excerpt.toLowerCase().includes(q) ||
          getUserName(ar.authorId).toLowerCase().includes(q)
      );
    }
    return result;
  }, [articles, activeStatus, searchQuery, getUserName]);

  const statusLabel = (status: string) => {
    const locale = useAppStore.getState().locale as 'fr' | 'en';
    return contentStatusLabels[locale]?.[status] || status;
  };

  const getStatusTabLabel = (tab: StatusTab): string => {
    if (tab === 'all') return t.articles.all;
    return statusLabel(tab);
  };

  const navTabs = useMemo(
    () => statusTabs.map((tab) => ({ id: tab, label: getStatusTabLabel(tab) })),
    [t]
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
        <ViewToolbar
          actions={
            <BrandPrimaryButton onClick={() => openPublicationComposer({ type: 'article' })}>
              <Plus className="h-4 w-4" />
              {t.articles.newArticle}
            </BrandPrimaryButton>
          }
        >
          <ViewSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t.articles.search}
          />
        </ViewToolbar>

        <ViewDataTable>
          <ViewDataTableHeader>
            <ViewDataTableCheckboxHead checked={selectedAll} onCheckedChange={setSelectedAll} />
            <ViewDataTableHead>{t.editorialCalendar.columns.content}</ViewDataTableHead>
            <ViewDataTableHead className="hidden sm:table-cell">
              {t.articles.category}
            </ViewDataTableHead>
            <ViewDataTableHead className="hidden md:table-cell">
              {t.articles.author}
            </ViewDataTableHead>
            <ViewDataTableHead className="hidden lg:table-cell">
              {t.articles.readingTime}
            </ViewDataTableHead>
            <ViewDataTableHead className="hidden sm:table-cell">
              {t.editorialCalendar.columns.date}
            </ViewDataTableHead>
            <ViewDataTableHead>{t.editorialCalendar.columns.status}</ViewDataTableHead>
          </ViewDataTableHeader>
          <ViewDataTableBody>
            {filteredArticles.length === 0 ? (
              <ViewDataTableEmpty
                colSpan={7}
                message={t.articles.noResults}
                illustrationId="compose-article"
              />
            ) : (
              filteredArticles.map((article) => {
                const statusColor = contentStatusColors[article.status];
                return (
                  <ViewDataTableRow
                    key={article.id}
                    onClick={() =>
                      setSelectedContent(article as unknown as Record<string, unknown>)
                    }
                  >
                    <ViewDataTableCheckboxCell />
                    <ViewDataTableCell>
                      <p className="font-medium text-[#1D141F] truncate">{article.title}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {stripMediaMarkdown(article.excerpt) || '—'}
                      </p>
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden sm:table-cell text-muted-foreground">
                      {article.category}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden md:table-cell text-muted-foreground">
                      {getUserName(article.authorId)}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden lg:table-cell text-muted-foreground">
                      {article.readingTime} min
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden sm:table-cell text-muted-foreground text-xs">
                      {article.publishedAt
                        ? formatDate(article.publishedAt)
                        : formatDate(article.updatedAt)}
                    </ViewDataTableCell>
                    <ViewDataTableCell>
                      <ViewStatusText
                        label={statusLabel(article.status)}
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
