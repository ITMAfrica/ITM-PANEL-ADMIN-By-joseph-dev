'use client';

import { useState, useMemo, useCallback, useEffect, useRef, memo } from 'react';
import { Button } from '@/components/ui/button';
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
} from '@/components/view-data-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Gem,
  ImageIcon,
  MoreHorizontal,
  Plus,
} from 'lucide-react';
import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  isWeekend,
  startOfWeek,
  subWeeks,
} from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useCalendarEvents } from '@/hooks/use-content';
import { useUserLookup } from '@/hooks/use-user-lookup';
import type { CalendarEvent, ContentItem } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { contentStatusColors, contentStatusLabels } from '@/lib/ui-constants';
import { cn } from '@/lib/utils';
import { formatContentPreview } from '@/lib/media-insert';
import {
  ViewShell,
  ViewSubNav,
  ViewTabPanel,
  ViewToolbar,
  ViewSearchInput,
  BrandPrimaryButton,
  ViewOutlineButton,
  ViewContentSurface,
  ViewPlaceholderPanel,
  brandColors,
} from '@/components/view-layout';

type EditorialTab = 'calendar' | 'list' | 'library' | 'autoLists' | 'deleted';

const GRID_TINT = '#EEF4F8';
const WEEKEND_TINT = '#E4EBF0';
const GRID_LINE = '#D4DEE6';
const HOUR_START = 0;
const HOUR_END = 23;
const ROW_HEIGHT = 56;
const CALENDAR_SCROLL_MAX_HEIGHT = 'calc(100vh - 16rem)';

function formatWeekRange(locale: string, start: Date, end: Date): string {
  const dateLocale = locale === 'fr' ? fr : enUS;
  const startLabel = format(start, 'd MMMM yyyy', { locale: dateLocale });
  const endLabel = format(end, 'd MMMM yyyy', { locale: dateLocale });
  return `${startLabel} - ${endLabel}`;
}

function formatDayHeader(locale: string, date: Date): string {
  const dateLocale = locale === 'fr' ? fr : enUS;
  return format(date, 'EEEE d', { locale: dateLocale });
}

function getEventHour(dateStr: string): number {
  const d = new Date(dateStr);
  return d.getHours() + d.getMinutes() / 60;
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function useLiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function buildSlotDate(day: Date, hour: number): Date {
  const scheduledAt = new Date(day);
  scheduledAt.setHours(hour, 0, 0, 0);
  return scheduledAt;
}

const EditorialClockTrailing = memo(function EditorialClockTrailing({ locale }: { locale: string }) {
  const { t } = useTranslation();
  const now = useLiveClock();
  const timeLabel = now.toLocaleTimeString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hidden sm:inline-flex items-center gap-1.5 shrink-0 pb-3 text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
        >
          {timeLabel} - {t.editorialCalendar.timezone}
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>{t.editorialCalendar.timezone}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

const CalendarSlot = memo(function CalendarSlot({
  day,
  hour,
  locale,
  isLastHour,
  createLabel,
  onSlotClick,
}: {
  day: Date;
  hour: number;
  locale: string;
  isLastHour: boolean;
  createLabel: string;
  onSlotClick: (day: Date, hour: number) => void;
}) {
  const slotDate = buildSlotDate(day, hour);
  const slotLabel = format(
    slotDate,
    locale === 'fr' ? "EEEE d MMMM 'à' HH:mm" : "EEEE, MMMM d 'at' HH:mm",
    { locale: locale === 'fr' ? fr : enUS }
  );

  const handleClick = useCallback(() => onSlotClick(day, hour), [onSlotClick, day, hour]);
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSlotClick(day, hour);
      }
    },
    [onSlotClick, day, hour]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        !isLastHour && 'border-b',
        'cursor-pointer transition-colors hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1D141F]/25'
      )}
      style={{ height: ROW_HEIGHT, borderColor: GRID_LINE }}
      aria-label={`${createLabel} — ${slotLabel}`}
    />
  );
});

const CalendarNowLine = memo(function CalendarNowLine({ weekDays }: { weekDays: Date[] }) {
  const now = useLiveClock();
  const showNowLine = weekDays.some((day) => isToday(day));
  const currentTimeTop = useMemo(() => {
    const currentHour = now.getHours() + now.getMinutes() / 60;
    return currentHour * ROW_HEIGHT;
  }, [now]);

  if (!showNowLine) return null;

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-20 flex items-center"
      style={{ top: currentTimeTop }}
    >
      <div
        className="h-0 w-0 border-y-[5px] border-l-8 border-y-transparent"
        style={{ borderLeftColor: brandColors.dark }}
      />
      <div className="h-px flex-1" style={{ backgroundColor: brandColors.dark }} />
    </div>
  );
});

function EditorialSubNav({
  activeTab,
  onTabChange,
}: {
  activeTab: EditorialTab;
  onTabChange: (tab: EditorialTab) => void;
}) {
  const { t, locale } = useTranslation();

  const tabs = [
    { id: 'calendar' as const, label: t.editorialCalendar.tabs.calendar },
    { id: 'list' as const, label: t.editorialCalendar.tabs.list },
    { id: 'library' as const, label: t.editorialCalendar.tabs.library },
    { id: 'autoLists' as const, label: t.editorialCalendar.tabs.autoLists },
    { id: 'deleted' as const, label: t.editorialCalendar.tabs.deleted },
  ];

  return (
    <ViewSubNav
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      trailing={<EditorialClockTrailing locale={locale} />}
    />
  );
}

function PublicationToolbar({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
}) {
  const { t, locale } = useTranslation();
  const openPublicationComposer = useAppStore((s) => s.openPublicationComposer);

  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 29);
    return formatWeekRange(locale, start, end);
  }, [locale]);

  return (
    <ViewToolbar
      actions={
        <>
          <Select>
            <SelectTrigger className="h-9 w-auto min-w-[140px] border-[#E8ECEF] bg-[#F5F7F9] text-sm">
              <SelectValue placeholder={t.editorialCalendar.bulkActions} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="delete">{locale === 'fr' ? 'Supprimer' : 'Delete'}</SelectItem>
              <SelectItem value="archive">{locale === 'fr' ? 'Archiver' : 'Archive'}</SelectItem>
            </SelectContent>
          </Select>
          <BrandPrimaryButton onClick={() => openPublicationComposer({ type: 'article' })}>
            <Plus className="h-4 w-4" />
            {t.editorialCalendar.createPublication}
          </BrandPrimaryButton>
        </>
      }
    >
      <ViewSearchInput
        value={search}
        onChange={onSearchChange}
        placeholder={t.editorialCalendar.search}
        className="min-w-[160px] max-w-xs"
      />
      <ViewOutlineButton icon={<Calendar className="h-4 w-4 text-muted-foreground" />}>
        <span className="hidden sm:inline">{dateRange}</span>
      </ViewOutlineButton>
      <ViewOutlineButton icon={<Filter className="h-4 w-4" />} />
      <ViewOutlineButton icon={<MoreHorizontal className="h-4 w-4" />} />
    </ViewToolbar>
  );
}

function CalendarToolbar({
  search,
  onSearchChange,
  weekStart,
  onPreviousWeek,
  onNextWeek,
  onThisWeek,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  weekStart: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onThisWeek: () => void;
}) {
  const { t, locale } = useTranslation();
  const openPublicationComposer = useAppStore((s) => s.openPublicationComposer);
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekRangeLabel = formatWeekRange(locale, weekStart, weekEnd);

  return (
    <ViewToolbar
      actions={
        <BrandPrimaryButton onClick={() => openPublicationComposer({ type: 'article' })}>
          <Plus className="h-4 w-4" />
          {t.editorialCalendar.createPublication}
        </BrandPrimaryButton>
      }
    >
      <ViewSearchInput
        value={search}
        onChange={onSearchChange}
        placeholder={t.editorialCalendar.search}
      />
      <ViewOutlineButton onClick={onThisWeek}>{t.editorialCalendar.thisWeek}</ViewOutlineButton>
      <div className="flex items-center overflow-hidden rounded-lg border border-[#E8ECEF] bg-white">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-none hover:bg-[#F5F7F9]"
          onClick={onPreviousWeek}
          aria-label={locale === 'fr' ? 'Semaine précédente' : 'Previous week'}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex h-9 min-w-[180px] items-center justify-center gap-2 border-x border-[#E8ECEF] px-3 text-sm text-[#1D141F] sm:min-w-[240px]">
          <Calendar className="h-4 w-4 shrink-0 text-[#8B939E]" />
          <span className="truncate capitalize">{weekRangeLabel}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-none hover:bg-[#F5F7F9]"
          onClick={onNextWeek}
          aria-label={locale === 'fr' ? 'Semaine suivante' : 'Next week'}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <ViewOutlineButton icon={<Filter className="h-4 w-4" />} />
      <ViewOutlineButton icon={<MoreHorizontal className="h-4 w-4" />} />
      <Select>
        <SelectTrigger className="h-9 w-auto min-w-[160px] gap-2 border-[#E8ECEF] bg-white text-sm">
          <FacebookIcon className="h-3.5 w-3.5 text-[#1877F2]" />
          <SelectValue placeholder={t.editorialCalendar.bestTimes} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="morning">{locale === 'fr' ? 'Matin' : 'Morning'}</SelectItem>
          <SelectItem value="afternoon">{locale === 'fr' ? 'Après-midi' : 'Afternoon'}</SelectItem>
          <SelectItem value="evening">{locale === 'fr' ? 'Soir' : 'Evening'}</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="h-9 w-9 justify-center border-[#E8ECEF] bg-white px-0 [&>svg:last-child]:hidden">
          <ImageIcon className="h-4 w-4 text-[#1D141F]" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{locale === 'fr' ? 'Tous les médias' : 'All media'}</SelectItem>
          <SelectItem value="image">{locale === 'fr' ? 'Images' : 'Images'}</SelectItem>
          <SelectItem value="video">{locale === 'fr' ? 'Vidéos' : 'Videos'}</SelectItem>
        </SelectContent>
      </Select>
      <ViewOutlineButton icon={<Gem className="h-3.5 w-3.5 text-[#C9A800]" fill="#E2F343" />}>
        {t.editorialCalendar.generateView}
      </ViewOutlineButton>
    </ViewToolbar>
  );
}

function PublicationListTable({ search }: { search: string }) {
  const { t } = useTranslation();
  const [selectedAll, setSelectedAll] = useState(false);
  const rows = useMemo(() => (search.trim() ? [] : []), [search]);

  return (
    <ViewDataTable transparent={false}>
      <ViewDataTableHeader>
        <ViewDataTableCheckboxHead checked={selectedAll} onCheckedChange={setSelectedAll} />
        <ViewDataTableHead>{t.editorialCalendar.columns.date}</ViewDataTableHead>
        <ViewDataTableHead>{t.editorialCalendar.columns.content}</ViewDataTableHead>
        <ViewDataTableHead>{t.editorialCalendar.columns.networks}</ViewDataTableHead>
        <ViewDataTableHead>{t.editorialCalendar.columns.status}</ViewDataTableHead>
      </ViewDataTableHeader>
      <ViewDataTableBody>
        {rows.length === 0 ? (
          <ViewDataTableEmpty colSpan={5} message={t.editorialCalendar.noData} />
        ) : (
          rows.map((row) => (
            <ViewDataTableRow key={String(row)}>
              <ViewDataTableCheckboxCell />
              <ViewDataTableCell />
              <ViewDataTableCell />
              <ViewDataTableCell />
              <ViewDataTableCell />
            </ViewDataTableRow>
          ))
        )}
      </ViewDataTableBody>
    </ViewDataTable>
  );
}

function ListTabContent() {
  const [search, setSearch] = useState('');
  return (
    <ViewTabPanel>
      <PublicationToolbar search={search} onSearchChange={setSearch} />
      <PublicationListTable search={search} />
    </ViewTabPanel>
  );
}

function ScheduledPublicationPreviewPanel({
  content,
  scheduledDate,
  locale,
}: {
  content: ContentItem;
  scheduledDate: string;
  locale: 'fr' | 'en';
}) {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const { getUserName } = useUserLookup(activeTenantId);
  const statusColor = contentStatusColors[content.status] ?? contentStatusColors.scheduled;
  const statusLabel = contentStatusLabels[locale]?.[content.status] ?? content.status;
  const dateLocale = locale === 'fr' ? fr : enUS;
  const dateLabel = format(
    new Date(scheduledDate),
    locale === 'fr' ? "EEEE d MMMM 'à' HH:mm" : "EEEE, MMMM d 'at' HH:mm",
    { locale: dateLocale }
  );
  const preview = formatContentPreview(content.excerpt);

  return (
    <div className="w-72 overflow-hidden">
      <div className="border-b border-[#E8ECEF] bg-[#F5F7F9] px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8B939E]">
          {t.contentDetail.preview}
        </p>
      </div>
      <div className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-snug text-[#1D141F]">{content.title}</p>
          <span
            className={cn(
              'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium',
              statusColor.bg,
              statusColor.text,
              statusColor.border
            )}
          >
            {statusLabel}
          </span>
        </div>
        <p className="text-xs text-[#8B939E]">{dateLabel}</p>
        <p className="text-xs capitalize text-[#5C6470]">{content.type}</p>
        {preview.text ? (
          <p className="line-clamp-4 whitespace-pre-wrap text-xs leading-relaxed text-[#1D141F]/80">
            {preview.text}
          </p>
        ) : !preview.imageUrl ? (
          <p className="text-xs italic text-[#A8B0BA]">
            {locale === 'fr' ? 'Aucun aperçu disponible' : 'No preview available'}
          </p>
        ) : null}
        {preview.imageUrl ? (
          <div className="overflow-hidden rounded-md border border-[#E8ECEF]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview.imageUrl} alt="" className="max-h-32 w-full object-cover" />
          </div>
        ) : null}
        <p className="text-[10px] text-[#8B939E]">
          {t.contentDetail.author}: {getUserName(content.authorId)}
        </p>
      </div>
    </div>
  );
}

function CalendarEventBlock({
  event,
  content,
  top,
  isPublished,
  locale,
}: {
  event: CalendarEvent;
  content: ContentItem | undefined;
  top: number;
  isPublished: boolean;
  locale: string;
}) {
  const eventContent = (
    <>
      <p
        className={cn(
          'truncate text-xs font-semibold',
          isPublished ? 'text-[#8B939E]' : 'text-[#1D141F]'
        )}
      >
        {event.title}
      </p>
      <p className={cn('text-[10px]', isPublished ? 'text-[#A8B0BA]' : 'text-[#5C6470]')}>
        {format(new Date(event.date), 'HH:mm')}
      </p>
    </>
  );

  const eventLabel = `${event.title} — ${format(new Date(event.date), 'HH:mm')}`;
  const blockClass = cn(
    'absolute left-1 right-1 z-10 cursor-default shadow-sm transition-shadow hover:shadow-md',
    isPublished
      ? 'rounded-md border border-[#D4DEE6] bg-[#EEF2F5]/90 px-2 py-1'
      : 'editorial-rainbow-border'
  );

  const block = (
    <div
      className={blockClass}
      style={{ top: top + 4, minHeight: 40 }}
      aria-label={eventLabel}
      onClick={(e) => e.stopPropagation()}
    >
      {isPublished ? eventContent : (
        <div className="editorial-rainbow-border-inner px-2 py-1">{eventContent}</div>
      )}
    </div>
  );

  if (!content) return <div key={event.id}>{block}</div>;

  return (
    <HoverCard key={event.id} openDelay={150} closeDelay={80}>
      <HoverCardTrigger asChild>{block}</HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-auto border-[#E8ECEF] p-0 shadow-lg"
      >
        <ScheduledPublicationPreviewPanel
          content={content}
          scheduledDate={event.date}
          locale={locale === 'fr' ? 'fr' : 'en'}
        />
      </HoverCardContent>
    </HoverCard>
  );
}

function WeeklyCalendarGrid({
  weekStart,
  events,
  contentById,
  search,
  locale,
}: {
  weekStart: Date;
  events: CalendarEvent[];
  contentById: Map<string, ContentItem>;
  search: string;
  locale: string;
}) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const openPublicationComposer = useAppStore((s) => s.openPublicationComposer);
  const createLabel = t.editorialCalendar.createPublication;

  const handleSlotClick = useCallback(
    (day: Date, hour: number) => {
      openPublicationComposer({ type: 'article', scheduledAt: buildSlotDate(day, hour) });
    },
    [openPublicationComposer]
  );
  const hours = useMemo(
    () => Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i),
    []
  );
  const weekDays = useMemo(
    () =>
      eachDayOfInterval({
        start: weekStart,
        end: endOfWeek(weekStart, { weekStartsOn: 1 }),
      }),
    [weekStart]
  );

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return events.filter((ev) => {
      const eventDate = new Date(ev.date);
      const inWeek = weekDays.some((day) => isSameDay(eventDate, day));
      if (!inWeek) return false;
      if (!query) return true;
      return ev.title.toLowerCase().includes(query);
    });
  }, [events, weekDays, search]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    weekDays.forEach((day) => map.set(format(day, 'yyyy-MM-dd'), []));
    filteredEvents.forEach((ev) => {
      const key = format(new Date(ev.date), 'yyyy-MM-dd');
      const list = map.get(key);
      if (list) list.push(ev);
    });
    return map;
  }, [filteredEvents, weekDays]);

  const showNowLine = weekDays.some((day) => isToday(day));

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !showNowLine) return;
    const currentHour = new Date().getHours() + new Date().getMinutes() / 60;
    const targetTop = currentHour * ROW_HEIGHT - el.clientHeight / 3;
    el.scrollTop = Math.max(0, targetTop);
  }, [weekStart, showNowLine]);

  return (
    <ViewContentSurface large>
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div
            className="sticky top-0 z-20 grid border-b border-[#E8ECEF] bg-white"
            style={{ gridTemplateColumns: '64px repeat(7, minmax(0, 1fr))' }}
          >
            <div className="border-r border-[#E8ECEF] bg-white" />
            {weekDays.map((day) => {
              const today = isToday(day);
              const weekend = isWeekend(day);
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'border-r border-[#E8ECEF] px-2 py-3 text-center last:border-r-0',
                    today && 'rounded-t-lg',
                    !today && weekend && 'bg-[#EEF2F5]'
                  )}
                  style={today ? { backgroundColor: brandColors.dark } : undefined}
                >
                  <span
                    className={cn(
                      'block text-sm font-semibold capitalize',
                      today ? 'text-white' : 'text-[#1D141F]'
                    )}
                  >
                    {formatDayHeader(locale, day)}
                  </span>
                </div>
              );
            })}
          </div>

          <div
            ref={scrollRef}
            className="overflow-y-auto"
            style={{ maxHeight: CALENDAR_SCROLL_MAX_HEIGHT }}
          >
            <div className="relative flex">
              <div className="sticky left-0 z-10 w-16 shrink-0 border-r border-[#E8ECEF] bg-white">
                {hours.map((hour, index) => (
                  <div
                    key={hour}
                    className={cn(
                      'flex items-start justify-end pr-2 pt-1 text-xs text-[#8B939E]',
                      index < hours.length - 1 && 'border-b'
                    )}
                    style={{ height: ROW_HEIGHT, borderColor: GRID_LINE }}
                  >
                    {String(hour).padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              <div
                className="relative grid flex-1"
                style={{
                  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                  height: hours.length * ROW_HEIGHT,
                }}
              >
                {weekDays.map((day) => {
                  const dayKey = format(day, 'yyyy-MM-dd');
                  const dayEvents = eventsByDay.get(dayKey) ?? [];
                  const today = isToday(day);
                  const weekend = isWeekend(day);

                  return (
                    <div
                      key={dayKey}
                      className={cn(
                        'relative border-r last:border-r-0',
                        today && 'border-x border-[#1D141F]/80',
                        !today && weekend && 'bg-[#E4EBF0]'
                      )}
                      style={{
                        backgroundColor: today ? GRID_TINT : weekend ? WEEKEND_TINT : GRID_TINT,
                      }}
                    >
                      {hours.map((hour, index) => (
                        <CalendarSlot
                          key={hour}
                          day={day}
                          hour={hour}
                          locale={locale}
                          isLastHour={index >= hours.length - 1}
                          createLabel={createLabel}
                          onSlotClick={handleSlotClick}
                        />
                      ))}

                      {dayEvents.map((event) => {
                        const eventHour = getEventHour(event.date);
                        if (eventHour < HOUR_START || eventHour >= HOUR_END + 1) return null;
                        const top = eventHour * ROW_HEIGHT;
                        const content = event.contentId ? contentById.get(event.contentId) : undefined;

                        return (
                          <CalendarEventBlock
                            key={event.id}
                            event={event}
                            content={content}
                            top={top}
                            isPublished={event.status === 'published'}
                            locale={locale}
                          />
                        );
                      })}
                    </div>
                  );
                })}

                <CalendarNowLine weekDays={weekDays} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ViewContentSurface>
  );
}

function CalendarTabContent() {
  const { locale } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const [search, setSearch] = useState('');
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const { data: tenantEvents = [], scheduled = [], published = [] } = useCalendarEvents(activeTenantId);

  const contentById = useMemo(() => {
    const map = new Map<string, ContentItem>();
    [...scheduled, ...published].forEach((item) => map.set(item.id, item));
    return map;
  }, [scheduled, published]);

  const goToPreviousWeek = useCallback(() => {
    setWeekStart((current) => subWeeks(current, 1));
  }, []);
  const goToNextWeek = useCallback(() => {
    setWeekStart((current) => addWeeks(current, 1));
  }, []);
  const goToThisWeek = useCallback(() => {
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  }, []);

  return (
    <ViewTabPanel>
      <CalendarToolbar
        search={search}
        onSearchChange={setSearch}
        weekStart={weekStart}
        onPreviousWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
        onThisWeek={goToThisWeek}
      />
      <WeeklyCalendarGrid
        weekStart={weekStart}
        events={tenantEvents}
        contentById={contentById}
        search={search}
        locale={locale}
      />
    </ViewTabPanel>
  );
}

export function EditorialCalendarView() {
  const [activeTab, setActiveTab] = useState<EditorialTab>('calendar');
  const { t } = useTranslation();

  return (
    <ViewShell>
      <EditorialSubNav activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'list' && <ListTabContent />}
      {activeTab === 'calendar' && <CalendarTabContent />}
      {activeTab === 'library' && (
        <ViewTabPanel>
          <ViewPlaceholderPanel
            title={t.editorialCalendar.comingSoon}
            description={t.editorialCalendar.placeholderLibrary}
          />
        </ViewTabPanel>
      )}
      {activeTab === 'autoLists' && (
        <ViewTabPanel>
          <ViewPlaceholderPanel
            title={t.editorialCalendar.comingSoon}
            description={t.editorialCalendar.placeholderAutoLists}
          />
        </ViewTabPanel>
      )}
      {activeTab === 'deleted' && (
        <ViewTabPanel>
          <ViewPlaceholderPanel
            title={t.editorialCalendar.comingSoon}
            description={t.editorialCalendar.placeholderDeleted}
          />
        </ViewTabPanel>
      )}
    </ViewShell>
  );
}
