import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  ViewDataTable,
  ViewDataTableBody,
  ViewDataTableCheckboxCell,
  ViewDataTableCheckboxHead,
  ViewDataTableEmpty,
  ViewDataTableHead,
  ViewDataTableHeader,
  ViewDataTableRow,
  ViewDataTableCell,
} from '@/components/view-data-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import {
  useContent,
  useDeleteContent,
  useUpdateContent,
} from '@/hooks/use-content';
import { useDistributionChannels } from '@/hooks/use-distribution-channels';
import { CreatePublicationMenu } from '@/components/publication-composer/create-publication-menu';
import { NewsletterEmbedDialog } from '@/components/newsletter-embed-dialog';
import type { ContentItem, ContentStatus, ContentType } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { contentStatusColors, contentStatusLabels } from '@/lib/ui-constants';
import { cn } from '@/lib/utils';
import {
  ViewOutlineButton,
  ViewSearchInput,
  ViewTabPanel,
  ViewToolbar,
} from '@/components/view-layout';
import {
  type DateRangeFilter,
  LIST_PAGE_SIZE,
  formatWeekRange,
  getChannelNames,
  getContentChannelIds,
  getContentDate,
  isWithinDateRange,
} from './types';

export function PublicationToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateRange,
  onDateRangeChange,
  selectedCount,
  onBulkAction,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: ContentStatus | 'all';
  onStatusFilterChange: (value: ContentStatus | 'all') => void;
  dateRange: DateRangeFilter;
  onDateRangeChange: (range: DateRangeFilter) => void;
  selectedCount: number;
  onBulkAction: (action: 'delete' | 'archive') => void;
}) {
  const { t, locale } = useTranslation();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const dateLocale = locale === 'fr' ? fr : enUS;

  const dateRangeLabel = useMemo(() => {
    if (dateRange.from && dateRange.to) {
      return formatWeekRange(locale, dateRange.from, dateRange.to);
    }
    if (dateRange.from) {
      return format(dateRange.from, 'd MMM yyyy', { locale: dateLocale });
    }
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 29);
    return formatWeekRange(locale, start, end);
  }, [dateRange, locale, dateLocale]);

  const handleBulkSelect = (value: string) => {
    if (value === 'delete' || value === 'archive') {
      onBulkAction(value);
    }
  };

  return (
    <ViewToolbar
      actions={
        <>
          <Select
            value=""
            onValueChange={handleBulkSelect}
            disabled={selectedCount === 0}
          >
            <SelectTrigger className="h-9 w-auto min-w-[140px] border-[#E8ECEF] bg-[#F5F7F9] text-sm">
              <SelectValue
                placeholder={
                  selectedCount > 0
                    ? `${t.editorialCalendar.bulkActions} (${selectedCount})`
                    : t.editorialCalendar.bulkActions
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="delete">{t.editorialCalendar.deleteSelected}</SelectItem>
              <SelectItem value="archive">{t.editorialCalendar.archiveSelected}</SelectItem>
            </SelectContent>
          </Select>
          <NewsletterEmbedDialog />
          <CreatePublicationMenu />
        </>
      }
    >
      <ViewSearchInput
        value={search}
        onChange={onSearchChange}
        placeholder={t.editorialCalendar.search}
        className="min-w-[160px] max-w-xs"
      />
      <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as ContentStatus | 'all')}>
        <SelectTrigger className="h-9 w-auto min-w-[130px] border-[#E8ECEF] bg-white text-sm">
          <SelectValue placeholder={t.editorialCalendar.allStatuses} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.editorialCalendar.allStatuses}</SelectItem>
          {(['draft', 'review', 'approved', 'scheduled', 'published', 'archived'] as ContentStatus[]).map(
            (status) => (
              <SelectItem key={status} value={status}>
                {contentStatusLabels[locale as 'fr' | 'en']?.[status] || status}
              </SelectItem>
            )
          )}
        </SelectContent>
      </Select>
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <ViewOutlineButton icon={<Calendar className="h-4 w-4 text-muted-foreground" />}>
            <span className="hidden sm:inline">{dateRangeLabel}</span>
          </ViewOutlineButton>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarPicker
            mode="range"
            selected={{ from: dateRange.from, to: dateRange.to }}
            onSelect={(range) => {
              onDateRangeChange({ from: range?.from, to: range?.to });
            }}
            locale={dateLocale}
            numberOfMonths={2}
          />
          {(dateRange.from || dateRange.to) && (
            <div className="border-t border-[#E8ECEF] p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  onDateRangeChange({});
                  setCalendarOpen(false);
                }}
              >
                {locale === 'fr' ? 'Effacer' : 'Clear'}
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </ViewToolbar>
  );
}

export function PublicationListTable({
  search,
  typeFilter,
  statusFilter,
  dateRange,
  selectedIds,
  onSelectedIdsChange,
  page,
  onPageChange,
}: {
  search: string;
  typeFilter?: ContentType;
  statusFilter: ContentStatus | 'all';
  dateRange: DateRangeFilter;
  selectedIds: Set<string>;
  onSelectedIdsChange: (ids: Set<string>) => void;
  page: number;
  onPageChange: (page: number) => void;
}) {
  const { t, locale } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const setSelectedContent = useAppStore((s) => s.setSelectedContent);
  const setContentDetailOpen = useAppStore((s) => s.setContentDetailOpen);
  const { data: allContent = [] } = useContent({
    tenantId: activeTenantId,
    type: typeFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const { data: distributionChannels = [] } = useDistributionChannels(activeTenantId);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allContent.filter((item) => {
      if (query) {
        const matchesSearch =
          item.title.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      const dateStr = getContentDate(item);
      if (!isWithinDateRange(dateStr, dateRange)) return false;
      return true;
    });
  }, [allContent, search, dateRange]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / LIST_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const rows = useMemo(() => {
    const start = currentPage * LIST_PAGE_SIZE;
    return filteredRows.slice(start, start + LIST_PAGE_SIZE);
  }, [filteredRows, currentPage]);

  const selectedAll = rows.length > 0 && rows.every((row) => selectedIds.has(row.id));

  const toggleAll = (checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      rows.forEach((row) => next.add(row.id));
    } else {
      rows.forEach((row) => next.delete(row.id));
    }
    onSelectedIdsChange(next);
  };

  const toggleRow = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    onSelectedIdsChange(next);
  };

  const statusLabel = (status: string) => {
    const loc = locale as 'fr' | 'en';
    return contentStatusLabels[loc]?.[status] || status;
  };

  const openContent = (content: ContentItem) => {
    setSelectedContent(content as unknown as Record<string, unknown>);
    setContentDetailOpen(true);
  };

  return (
    <>
      <ViewDataTable transparent={false}>
        <ViewDataTableHeader>
          <ViewDataTableCheckboxHead checked={selectedAll} onCheckedChange={toggleAll} />
          <ViewDataTableHead>{t.editorialCalendar.columns.date}</ViewDataTableHead>
          <ViewDataTableHead>{t.editorialCalendar.columns.content}</ViewDataTableHead>
          <ViewDataTableHead>{t.editorialCalendar.columns.networks}</ViewDataTableHead>
          <ViewDataTableHead>{t.editorialCalendar.columns.status}</ViewDataTableHead>
        </ViewDataTableHeader>
        <ViewDataTableBody>
          {rows.length === 0 ? (
            <ViewDataTableEmpty
              colSpan={5}
              message={t.editorialCalendar.noData}
              series2Id="calendar-theater"
            />
          ) : (
            rows.map((row) => {
              const statusColor =
                contentStatusColors[row.status] || contentStatusColors.draft;
              const dateStr = getContentDate(row);
              const channelLabel = getChannelNames(
                getContentChannelIds(row),
                distributionChannels
              );
              return (
                <ViewDataTableRow key={row.id} onClick={() => openContent(row)}>
                  <ViewDataTableCheckboxCell
                    checked={selectedIds.has(row.id)}
                    onCheckedChange={(checked) => toggleRow(row.id, checked)}
                  />
                  <ViewDataTableCell className="text-xs text-muted-foreground">
                    {dateStr
                      ? new Date(dateStr).toLocaleDateString(
                          locale === 'fr' ? 'fr-FR' : 'en-US',
                          { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
                        )
                      : '—'}
                  </ViewDataTableCell>
                  <ViewDataTableCell>
                    <p className="font-medium truncate">{row.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{row.type}</p>
                  </ViewDataTableCell>
                  <ViewDataTableCell className="text-xs text-muted-foreground">
                    {channelLabel}
                  </ViewDataTableCell>
                  <ViewDataTableCell>
                    <span
                      className={cn(
                        'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium',
                        statusColor.bg,
                        statusColor.text,
                        statusColor.border
                      )}
                    >
                      {statusLabel(row.status)}
                    </span>
                  </ViewDataTableCell>
                </ViewDataTableRow>
              );
            })
          )}
        </ViewDataTableBody>
      </ViewDataTable>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {t.editorialCalendar.page} {currentPage + 1} {t.editorialCalendar.of} {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => onPageChange(currentPage - 1)}
            >
              {t.editorialCalendar.previous}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => onPageChange(currentPage + 1)}
            >
              {t.editorialCalendar.next}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export function ListTabContent({ typeFilter }: { typeFilter?: ContentType }) {
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState<DateRangeFilter>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const deleteContent = useDeleteContent();
  const updateContent = useUpdateContent();

  const handleBulkAction = useCallback(
    async (action: 'delete' | 'archive') => {
      const ids = Array.from(selectedIds);
      if (ids.length === 0) return;
      if (action === 'delete') {
        await Promise.all(ids.map((id) => deleteContent.mutateAsync(id)));
      } else {
        await Promise.all(
          ids.map((id) => updateContent.mutateAsync({ id, data: { status: 'archived' } }))
        );
      }
      setSelectedIds(new Set());
    },
    [selectedIds, deleteContent, updateContent]
  );

  useEffect(() => {
    setPage(0);
    setSelectedIds(new Set());
  }, [search, statusFilter, dateRange, typeFilter, activeTenantId]);

  return (
    <ViewTabPanel>
      <PublicationToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        selectedCount={selectedIds.size}
        onBulkAction={handleBulkAction}
      />
      <PublicationListTable
        search={search}
        typeFilter={typeFilter}
        statusFilter={statusFilter}
        dateRange={dateRange}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        page={page}
        onPageChange={setPage}
      />
    </ViewTabPanel>
  );
}
