import { useCallback, useEffect, useMemo, useState, memo } from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { format, isToday } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { useUserLookup } from '@/hooks/use-user-lookup';
import type { CalendarEvent, ContentItem } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { contentStatusColors, contentStatusLabels } from '@/lib/ui-constants';
import { cn } from '@/lib/utils';
import { formatContentPreview } from '@/lib/media-insert';
import { brandColors } from '@/components/view-layout';
import { publicationTypes } from '@/lib/publication-composer';
import { buildSlotDate, GRID_LINE, ROW_HEIGHT } from './types';

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function useLiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}
export const CalendarSlot = memo(function CalendarSlot({
  day,
  hour,
  locale,
  isLastHour,
  createLabel,
  onSlotClick,
  onSlotDrop,
  isDragTarget,
}: {
  day: Date;
  hour: number;
  locale: string;
  isLastHour: boolean;
  createLabel: string;
  onSlotClick: (day: Date, hour: number) => void;
  onSlotDrop?: (day: Date, hour: number) => void;
  isDragTarget?: boolean;
}) {
  const slotDate = buildSlotDate(day, hour);
  const slotLabel = format(
    slotDate,
    locale === 'fr' ? "EEEE d MMMM 'à' HH:mm" : "EEEE, MMMM d 'at' HH:mm",
    { locale: locale === 'fr' ? fr : enUS }
  );

  const handleClick = useCallback(() => onSlotClick(day, hour), [onSlotClick, day, hour]);
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onSlotDrop?.(day, hour);
    },
    [onSlotDrop, day, hour]
  );
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
      onDragOver={(e) => {
        if (onSlotDrop) e.preventDefault();
      }}
      onDrop={handleDrop}
      className={cn(
        !isLastHour && 'border-b',
        'cursor-pointer transition-colors hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1D141F]/25',
        isDragTarget && 'bg-white/80 ring-1 ring-inset ring-[#1D141F]/15'
      )}
      style={{ height: ROW_HEIGHT, borderColor: GRID_LINE }}
      aria-label={`${createLabel} — ${slotLabel}`}
    />
  );
});

export const CalendarNowLine = memo(function CalendarNowLine({ weekDays }: { weekDays: Date[] }) {
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

export function ScheduledPublicationPreviewPanel({
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

export function CalendarEventBlock({
  event,
  content,
  top,
  isPublished,
  locale,
  onDragStart,
  onDragEnd,
}: {
  event: CalendarEvent;
  content: ContentItem | undefined;
  top: number;
  isPublished: boolean;
  locale: string;
  onDragStart?: (contentId: string) => void;
  onDragEnd?: () => void;
}) {
  const setSelectedContent = useAppStore((s) => s.setSelectedContent);
  const setContentDetailOpen = useAppStore((s) => s.setContentDetailOpen);

  const openContent = useCallback(() => {
    if (!content) return;
    setSelectedContent(content as unknown as Record<string, unknown>);
    setContentDetailOpen(true);
  }, [content, setSelectedContent, setContentDetailOpen]);

  const typeConfig = content
    ? publicationTypes.find((pt) => pt.type === content.type)
    : undefined;
  const TypeIcon = typeConfig?.icon;

  const eventContent = (
    <div className="flex items-start gap-1.5">
      {TypeIcon ? (
        <TypeIcon
          className={cn(
            'mt-0.5 h-3 w-3 shrink-0',
            typeConfig.color,
            isPublished && 'opacity-60'
          )}
          aria-hidden
        />
      ) : null}
      <div className="min-w-0 flex-1">
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
      </div>
    </div>
  );

  const isDraggable = !isPublished && content?.status === 'scheduled';
  const contentId = event.contentId || event.id;

  const eventLabel = `${event.title} — ${format(new Date(event.date), 'HH:mm')}`;
  const blockClass = cn(
    'absolute left-1 right-1 z-10 shadow-sm transition-shadow hover:shadow-md',
    content ? 'cursor-pointer' : 'cursor-default',
    isDraggable && 'cursor-grab active:cursor-grabbing',
    isPublished
      ? 'rounded-md border border-[#D4DEE6] bg-[#EEF2F5]/90 px-2 py-1'
      : 'editorial-rainbow-border'
  );

  const block = (
    <div
      className={blockClass}
      style={{ top: top + 4, minHeight: 40 }}
      aria-label={eventLabel}
      role={content ? 'button' : undefined}
      tabIndex={content ? 0 : undefined}
      draggable={isDraggable}
      onDragStart={(e) => {
        if (!isDraggable || !contentId) return;
        e.dataTransfer.setData('text/plain', contentId);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.(contentId);
      }}
      onDragEnd={() => onDragEnd?.()}
      onClick={(e) => {
        e.stopPropagation();
        openContent();
      }}
      onKeyDown={(e) => {
        if (!content) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          openContent();
        }
      }}
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
