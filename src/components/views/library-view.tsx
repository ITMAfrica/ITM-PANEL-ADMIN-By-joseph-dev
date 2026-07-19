'use client';

import { useState, useMemo } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileText, Filter, SortAsc, Tag, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { contentStatusColors, contentStatusLabels } from '@/lib/ui-constants';
import { stripMediaMarkdown } from '@/lib/media-insert';
import { useContent } from '@/hooks/use-content';
import { useUserLookup } from '@/hooks/use-user-lookup';
import { cn } from '@/lib/utils';
import type { ContentItem } from '@/lib/types';
import {
  ViewShell,
  ViewSubNav,
  ViewTabPanel,
  ViewToolbar,
  ViewSearchInput,
  ViewOutlineButton,
  BrandPrimaryButton,
  ViewFilterRow,
  FilterChip,
} from '@/components/view-layout';
import { UpgradePlanBanner } from '@/components/upgrade-plan-banner';
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

type ContentTypeTab = 'all' | 'newsletter' | 'article' | 'announcement';

export function LibraryView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const locale = useAppStore((s) => s.locale);
  const setSelectedContent = useAppStore((s) => s.setSelectedContent);
  const { data: contentItems = [] } = useContent({ tenantId: activeTenantId });
  const { getUserName } = useUserLookup(activeTenantId);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'status'>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedAll, setSelectedAll] = useState(false);

  const allContent: CombinedContent[] = useMemo(
    () =>
      contentItems.map((item) => ({
        ...item,
        contentType: item.type as CombinedContent['contentType'],
      })),
    [contentItems]
  );

  const filtered = useMemo(() => {
    let result = allContent;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.excerpt.toLowerCase().includes(q) ||
          c.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter((c) => c.contentType === typeFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'date') {
        cmp = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else if (sortBy === 'title') {
        cmp = a.title.localeCompare(b.title);
      } else {
        cmp = a.status.localeCompare(b.status);
      }
      return sortAsc ? -cmp : cmp;
    });

    return result;
  }, [allContent, search, typeFilter, statusFilter, sortBy, sortAsc]);

  const hasActiveFilters = search || typeFilter !== 'all' || statusFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  const statusLabels = contentStatusLabels[locale] || contentStatusLabels.fr;

  const typeNavLabels: Record<Exclude<ContentTypeTab, 'all'>, string> = {
    newsletter: t.nav.newsletters,
    article: t.nav.articles,
    announcement: t.nav.announcements,
  };

  const getTypeFilterLabel = () => {
    if (typeFilter === 'all') return null;
    return typeNavLabels[typeFilter as Exclude<ContentTypeTab, 'all'>] || typeFilter;
  };

  const getStatusFilterLabel = () => {
    if (statusFilter === 'all') return null;
    return statusLabels[statusFilter] || statusFilter;
  };

  const typeFilterLabel = getTypeFilterLabel();
  const statusFilterLabel = getStatusFilterLabel();

  const typeTabs = [
    { id: 'all' as const, label: t.library.allContent },
    { id: 'newsletter' as const, label: t.nav.newsletters },
    { id: 'article' as const, label: t.nav.articles },
    { id: 'announcement' as const, label: t.nav.announcements },
  ];

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const getTypeLabel = (type: CombinedContent['contentType']) => typeNavLabels[type] || type;

  return (
    <ViewShell>
      <UpgradePlanBanner variant="library" />
      <ViewSubNav
        tabs={typeTabs}
        activeTab={typeFilter as ContentTypeTab}
        onTabChange={setTypeFilter}
      />
      <ViewTabPanel>
        <ViewToolbar
          actions={
            <BrandPrimaryButton className="gap-1.5">
              <FileText className="h-4 w-4" />
              {t.common.create}
            </BrandPrimaryButton>
          }
        >
          <ViewSearchInput value={search} onChange={setSearch} placeholder={t.library.search} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ViewOutlineButton
                icon={<Tag className="h-4 w-4" />}
                className={statusFilter !== 'all' ? 'border-[#1D141F]/20 bg-[#F8FAFB]' : undefined}
              >
                <span className="max-w-[80px] truncate hidden sm:inline">
                  {statusFilter === 'all'
                    ? t.newsletters.status
                    : statusLabels[statusFilter] || statusFilter}
                </span>
              </ViewOutlineButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                {t.library.allContent}
              </DropdownMenuItem>
              {Object.entries(statusLabels).map(([key, label]) => (
                <DropdownMenuItem key={key} onClick={() => setStatusFilter(key)}>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ViewOutlineButton icon={<SortAsc className="h-4 w-4" />}>
                <span className="max-w-[80px] truncate hidden sm:inline">
                  {sortBy === 'date'
                    ? t.newsletters.lastModified
                    : sortBy === 'title'
                      ? 'Titre'
                      : t.newsletters.status}
                </span>
              </ViewOutlineButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSortBy('date');
                  setSortAsc(!sortAsc);
                }}
              >
                {t.newsletters.lastModified}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSortBy('title');
                  setSortAsc(!sortAsc);
                }}
              >
                Titre
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSortBy('status');
                  setSortAsc(!sortAsc);
                }}
              >
                {t.newsletters.status}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ViewOutlineButton icon={<Filter className="h-4 w-4" />} />
        </ViewToolbar>

        {hasActiveFilters && (
          <ViewFilterRow>
            {search && (
              <FilterChip active onClick={() => setSearch('')}>
                « {search} »
                <X className="h-3 w-3 ml-1 inline" />
              </FilterChip>
            )}
            {typeFilterLabel && (
              <FilterChip active onClick={() => setTypeFilter('all')}>
                {typeFilterLabel}
                <X className="h-3 w-3 ml-1 inline" />
              </FilterChip>
            )}
            {statusFilterLabel && (
              <FilterChip active onClick={() => setStatusFilter('all')}>
                {statusFilterLabel}
                <X className="h-3 w-3 ml-1 inline" />
              </FilterChip>
            )}
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-1"
            >
              {t.common.cancel}
            </button>
          </ViewFilterRow>
        )}

        <ViewDataTable>
          <ViewDataTableHeader>
            <ViewDataTableCheckboxHead checked={selectedAll} onCheckedChange={setSelectedAll} />
            <ViewDataTableHead>{t.editorialCalendar.columns.content}</ViewDataTableHead>
            <ViewDataTableHead className="hidden sm:table-cell">
              {t.createContent.contentType}
            </ViewDataTableHead>
            <ViewDataTableHead>{t.editorialCalendar.columns.status}</ViewDataTableHead>
            <ViewDataTableHead className="hidden md:table-cell">
              {t.newsletters.author}
            </ViewDataTableHead>
            <ViewDataTableHead className="hidden lg:table-cell">
              {t.newsletters.lastModified}
            </ViewDataTableHead>
            <ViewDataTableHead className="hidden xl:table-cell">
              {t.createContent.tags}
            </ViewDataTableHead>
          </ViewDataTableHeader>
          <ViewDataTableBody>
            {filtered.length === 0 ? (
              <ViewDataTableEmpty
                colSpan={7}
                message={t.library.noResults}
                illustrationId="library"
              />
            ) : (
              filtered.map((content) => {
                const statusColor = contentStatusColors[content.status] || contentStatusColors.draft;
                return (
                  <ViewDataTableRow
                    key={content.id}
                    onClick={() =>
                      setSelectedContent(content as unknown as Record<string, unknown>)
                    }
                  >
                    <ViewDataTableCheckboxCell />
                    <ViewDataTableCell>
                      <p className="font-medium text-[#1D141F] truncate">{content.title}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {stripMediaMarkdown(content.excerpt) || '—'}
                      </p>
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden sm:table-cell text-muted-foreground">
                      {getTypeLabel(content.contentType)}
                    </ViewDataTableCell>
                    <ViewDataTableCell>
                      <ViewStatusText
                        label={statusLabels[content.status] || content.status}
                        className={cn(statusColor.bg, statusColor.text, statusColor.border)}
                      />
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden md:table-cell text-muted-foreground">
                      {getUserName(content.authorId)}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                      {formatDate(content.updatedAt)}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden xl:table-cell text-muted-foreground text-xs">
                      {content.tags.length > 0 ? content.tags.join(', ') : '—'}
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
