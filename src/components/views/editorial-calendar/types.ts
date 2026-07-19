import { endOfDay, format, startOfDay } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import type { ContentItem } from '@/lib/types';

export type EditorialTab =
  | 'calendar'
  | 'list'
  | 'queue'
  | 'channels'
  | 'library'
  | 'autoLists'
  | 'deleted';

export const EDITORIAL_TABS: EditorialTab[] = [
  'calendar',
  'list',
  'queue',
  'channels',
  'library',
  'autoLists',
  'deleted',
];

export function isEditorialTab(value: string | null): value is EditorialTab {
  return value !== null && EDITORIAL_TABS.includes(value as EditorialTab);
}

export const LIST_PAGE_SIZE = 25;

export type DateRangeFilter = { from?: Date; to?: Date };
export type MediaFilter = 'all' | 'image' | 'video';
export type ChannelFilter = 'all' | string;

export function getChannelNames(
  channelIds: string[],
  channels: { id: string; name: string }[]
): string {
  const names = channelIds
    .map((id) => channels.find((c) => c.id === id)?.name)
    .filter(Boolean);
  return names.length > 0 ? names.join(', ') : '—';
}

export function getContentChannelIds(content: ContentItem): string[] {
  return 'channelIds' in content &&
    Array.isArray((content as { channelIds?: string[] }).channelIds)
    ? (content as { channelIds: string[] }).channelIds
    : [];
}

export function getContentDate(item: ContentItem): string {
  return item.scheduledAt || item.publishedAt || item.createdAt;
}

export function isWithinDateRange(dateStr: string, range: DateRangeFilter): boolean {
  if (!range.from && !range.to) return true;
  const date = new Date(dateStr);
  if (range.from && date < startOfDay(range.from)) return false;
  if (range.to && date > endOfDay(range.to)) return false;
  return true;
}

export function matchesMediaFilter(content: ContentItem, filter: MediaFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'image') return Boolean(content.featuredImage);
  if (filter === 'video') {
    const excerpt = content.excerpt || '';
    return /\.(mp4|webm|mov)/i.test(excerpt) || excerpt.includes('![');
  }
  return true;
}

export const GRID_TINT = '#EEF4F8';
export const WEEKEND_TINT = '#E4EBF0';
export const GRID_LINE = '#D4DEE6';
export const HOUR_START = 0;
export const HOUR_END = 23;
export const ROW_HEIGHT = 56;
export const CALENDAR_SCROLL_MAX_HEIGHT = 'calc(100vh - 16rem)';

export function formatWeekRange(locale: string, start: Date, end: Date): string {
  const dateLocale = locale === 'fr' ? fr : enUS;
  const startLabel = format(start, 'd MMMM yyyy', { locale: dateLocale });
  const endLabel = format(end, 'd MMMM yyyy', { locale: dateLocale });
  return `${startLabel} - ${endLabel}`;
}

export function formatDayHeader(locale: string, date: Date): string {
  const dateLocale = locale === 'fr' ? fr : enUS;
  return format(date, 'EEEE d', { locale: dateLocale });
}

export function getEventHour(dateStr: string): number {
  const d = new Date(dateStr);
  return d.getHours() + d.getMinutes() / 60;
}

export function buildSlotDate(day: Date, hour: number): Date {
  const scheduledAt = new Date(day);
  scheduledAt.setHours(hour, 0, 0, 0);
  return scheduledAt;
}
