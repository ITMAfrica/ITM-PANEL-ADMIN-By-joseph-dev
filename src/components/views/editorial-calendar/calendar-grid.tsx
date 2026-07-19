import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Gem,
  ImageIcon,
  Mail,
  Globe,
  Building2,
  Share2,
  Bell,
  MessageSquare,
  Layers,
} from 'lucide-react';
import {
  addWeeks,
  eachDayOfInterval,
  endOfDay,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  isWeekend,
  startOfDay,
  startOfWeek,
  subWeeks,
} from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { useCalendarEvents, useUpdateContent } from '@/hooks/use-content';
import { useDistributionChannels } from '@/hooks/use-distribution-channels';
import { CreatePublicationMenu } from '@/components/publication-composer/create-publication-menu';
import type { CalendarEvent, ContentItem, DistributionChannel } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  ViewContentSurface,
  ViewOutlineButton,
  ViewSubNav,
  ViewTabPanel,
  ViewToolbar,
  brandColors,
} from '@/components/view-layout';
import {
  CalendarEventBlock,
  CalendarNowLine,
  CalendarSlot,
  EditorialClockTrailing,
} from './calendar-components';
import {
  type ChannelFilter,
  type EditorialTab,
  type MediaFilter,
  CALENDAR_SCROLL_MAX_HEIGHT,
  GRID_LINE,
  GRID_TINT,
  HOUR_END,
  HOUR_START,
  ROW_HEIGHT,
  WEEKEND_TINT,
  buildSlotDate,
  formatDayHeader,
  formatWeekRange,
  getContentChannelIds,
  getEventHour,
  matchesMediaFilter,
} from './types';

const CHANNEL_TYPE_ICON: Record<
  DistributionChannel['type'],
  { Icon: typeof Mail; className: string }
> = {
  email: { Icon: Mail, className: 'h-3.5 w-3.5 text-[#1D141F]' },
  web: { Icon: Globe, className: 'h-3.5 w-3.5 text-[#1D141F]' },
  intranet: { Icon: Building2, className: 'h-3.5 w-3.5 text-[#1D141F]' },
  social: { Icon: Share2, className: 'h-3.5 w-3.5 text-[#1D141F]' },
  push: { Icon: Bell, className: 'h-3.5 w-3.5 text-[#1D141F]' },
  sms: { Icon: MessageSquare, className: 'h-3.5 w-3.5 text-[#1D141F]' },
};

export function EditorialSubNav({
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
    { id: 'queue' as const, label: t.editorialCalendar.tabs.queue },
    { id: 'channels' as const, label: t.editorialCalendar.tabs.channels },
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

export function CalendarToolbar({
  weekStart,
  onPreviousWeek,
  onNextWeek,
  onWeekSelect,
  mediaFilter,
  onMediaFilterChange,
  channelFilter,
  onChannelFilterChange,
  channels,
}: {
  weekStart: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onWeekSelect: (date: Date) => void;
  mediaFilter: MediaFilter;
  onMediaFilterChange: (value: MediaFilter) => void;
  channelFilter: ChannelFilter;
  onChannelFilterChange: (value: ChannelFilter) => void;
  channels: Pick<DistributionChannel, 'id' | 'name' | 'type'>[];
}) {
  const { t, locale } = useTranslation();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const dateLocale = locale === 'fr' ? fr : enUS;
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekRangeLabel = formatWeekRange(locale, weekStart, weekEnd);
  const weekDays = useMemo(
    () => eachDayOfInterval({ start: weekStart, end: weekEnd }),
    [weekStart, weekEnd]
  );

  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      if (!date) return;
      onWeekSelect(date);
      setCalendarOpen(false);
    },
    [onWeekSelect]
  );

  return (
    <ViewToolbar
      actions={
        <CreatePublicationMenu
          initialChannelIds={channelFilter === 'all' ? undefined : [channelFilter]}
        />
      }
    >
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
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-9 min-w-[180px] items-center justify-center gap-2 border-x border-[#E8ECEF] px-3 text-sm text-[#1D141F] transition-colors hover:bg-[#F5F7F9] sm:min-w-[240px]"
              aria-label={locale === 'fr' ? 'Choisir une semaine' : 'Choose a week'}
            >
              <Calendar className="h-4 w-4 shrink-0 text-[#8B939E]" />
              <span className="truncate capitalize">{weekRangeLabel}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <CalendarPicker
              mode="single"
              selected={weekStart}
              defaultMonth={weekStart}
              onSelect={handleDateSelect}
              locale={dateLocale}
              weekStartsOn={1}
              modifiers={{ inCurrentWeek: weekDays }}
              modifiersClassNames={{ inCurrentWeek: 'bg-[#EEF4F8] rounded-md' }}
            />
          </PopoverContent>
        </Popover>
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
      <Select value={channelFilter} onValueChange={onChannelFilterChange}>
        <SelectTrigger className="h-9 w-auto min-w-[160px] gap-2 border-[#E8ECEF] bg-white text-sm">
          <SelectValue placeholder={t.editorialCalendar.allChannels} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <span className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-[#1D141F]" />
              {t.editorialCalendar.allChannels}
            </span>
          </SelectItem>
          {channels.map((ch) => {
            const config = CHANNEL_TYPE_ICON[ch.type] ?? CHANNEL_TYPE_ICON.email;
            const { Icon, className } = config;
            return (
              <SelectItem key={ch.id} value={ch.id}>
                <span className="flex items-center gap-2">
                  <Icon className={className} />
                  {ch.name}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <Select value={mediaFilter} onValueChange={(v) => onMediaFilterChange(v as MediaFilter)}>
        <SelectTrigger className="h-9 w-9 justify-center border-[#E8ECEF] bg-white px-0 [&>svg:last-child]:hidden">
          <ImageIcon className="h-4 w-4 text-[#1D141F]" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.editorialCalendar.allMedia}</SelectItem>
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

export function WeeklyCalendarGrid({
  weekStart,
  events,
  contentById,
  locale,
  mediaFilter,
  channelFilter,
}: {
  weekStart: Date;
  events: CalendarEvent[];
  contentById: Map<string, ContentItem>;
  locale: string;
  mediaFilter: MediaFilter;
  channelFilter: ChannelFilter;
}) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const openPublicationComposer = useAppStore((s) => s.openPublicationComposer);
  const updateContent = useUpdateContent();
  const createLabel = t.editorialCalendar.createPublication;
  const [draggingContentId, setDraggingContentId] = useState<string | null>(null);

  const handleSlotClick = useCallback(
    (day: Date, hour: number) => {
      if (draggingContentId) return;
      openPublicationComposer({
        type: 'article',
        scheduledAt: buildSlotDate(day, hour),
        initialChannelIds: channelFilter === 'all' ? undefined : [channelFilter],
      });
    },
    [openPublicationComposer, draggingContentId, channelFilter]
  );

  const handleSlotDrop = useCallback(
    (day: Date, hour: number) => {
      if (!draggingContentId) return;
      const scheduledAt = buildSlotDate(day, hour);
      updateContent.mutate({
        id: draggingContentId,
        data: { scheduledAt: scheduledAt.toISOString() },
      });
      setDraggingContentId(null);
    },
    [draggingContentId, updateContent]
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
    return events.filter((ev) => {
      const eventDate = new Date(ev.date);
      if (!weekDays.some((day) => isSameDay(eventDate, day))) return false;
      const content = ev.contentId ? contentById.get(ev.contentId) : undefined;
      if (!content) return true;
      if (!matchesMediaFilter(content, mediaFilter)) return false;
      if (channelFilter !== 'all') {
        const channelIds = getContentChannelIds(content);
        if (!channelIds.includes(channelFilter)) return false;
      }
      return true;
    });
  }, [events, weekDays, contentById, mediaFilter, channelFilter]);

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
                          onSlotDrop={draggingContentId ? handleSlotDrop : undefined}
                          isDragTarget={Boolean(draggingContentId)}
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
                            onDragStart={setDraggingContentId}
                            onDragEnd={() => setDraggingContentId(null)}
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

export function CalendarTabContent() {
  const { locale } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');
  const { data: tenantEvents = [], scheduled = [], published = [] } = useCalendarEvents(activeTenantId);
  const { data: distributionChannels = [] } = useDistributionChannels(activeTenantId);

  const weekEnd = useMemo(() => endOfWeek(weekStart, { weekStartsOn: 1 }), [weekStart]);

  const visiblePublished = useMemo(() => {
    return published.filter((item) => {
      if (!item.publishedAt) return false;
      const date = new Date(item.publishedAt);
      return date >= startOfDay(weekStart) && date <= endOfDay(weekEnd);
    });
  }, [published, weekStart, weekEnd]);

  const contentById = useMemo(() => {
    const map = new Map<string, ContentItem>();
    [...scheduled, ...visiblePublished].forEach((item) => map.set(item.id, item));
    return map;
  }, [scheduled, visiblePublished]);

  const visibleEvents = useMemo(() => {
    const publishedIds = new Set(visiblePublished.map((item) => item.id));
    return tenantEvents.filter((ev) => {
      if (ev.status === 'published' && ev.contentId) {
        return publishedIds.has(ev.contentId);
      }
      return true;
    });
  }, [tenantEvents, visiblePublished]);

  const goToPreviousWeek = useCallback(() => {
    setWeekStart((current) => subWeeks(current, 1));
  }, []);
  const goToNextWeek = useCallback(() => {
    setWeekStart((current) => addWeeks(current, 1));
  }, []);
  const goToWeek = useCallback((date: Date) => {
    setWeekStart(startOfWeek(date, { weekStartsOn: 1 }));
  }, []);

  return (
    <ViewTabPanel>
      <CalendarToolbar
        weekStart={weekStart}
        onPreviousWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
        onWeekSelect={goToWeek}
        mediaFilter={mediaFilter}
        onMediaFilterChange={setMediaFilter}
        channelFilter={channelFilter}
        onChannelFilterChange={setChannelFilter}
        channels={distributionChannels}
      />
      <WeeklyCalendarGrid
        weekStart={weekStart}
        events={visibleEvents}
        contentById={contentById}
        locale={locale}
        mediaFilter={mediaFilter}
        channelFilter={channelFilter}
      />
    </ViewTabPanel>
  );
}
