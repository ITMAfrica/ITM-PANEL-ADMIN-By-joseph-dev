import { db } from '../lib/prisma';
import { CONTENT_EVENT_TYPES } from '../lib/analytics-events';

export const TREND_MODES = ['volume', 'reach', 'engagement', 'quality'] as const;
export const TREND_RESOURCES = [
  'all',
  'newsletters',
  'articles',
  'announcements',
  'campaigns',
] as const;
export const TREND_GRANULARITIES = ['day', 'week', 'month'] as const;

export type TrendMode = (typeof TREND_MODES)[number];
export type TrendResource = (typeof TREND_RESOURCES)[number];
export type TrendGranularity = (typeof TREND_GRANULARITIES)[number];

export type TrendSeriesPoint = {
  name: string;
  primary: number;
  secondary: number;
};

export type AnalyticsTrendsResult = {
  resource: TrendResource;
  mode: TrendMode;
  weeks: number;
  granularity: TrendGranularity;
  from: string;
  to: string;
  available: boolean;
  unavailableReason?: string;
  keys: { primary: string; secondary: string };
  series: TrendSeriesPoint[];
  source: 'content' | 'content_event' | 'newsletter_send' | 'campaign' | 'none';
};

export type TrendBucket = {
  name: string;
  start: Date;
  end: Date;
};

export type TrendWindow = {
  buckets: TrendBucket[];
  granularity: TrendGranularity;
  from: Date;
  to: Date;
};

type ContentTypeFilter = 'newsletter' | 'article' | 'announcement' | null;

const RESOURCE_TO_CONTENT_TYPE: Record<TrendResource, ContentTypeFilter> = {
  all: null,
  newsletters: 'newsletter',
  articles: 'article',
  announcements: 'announcement',
  campaigns: null,
};

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function startOfMonth(date: Date): Date {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
}

export function calendarDaysBetween(from: Date, to: Date): number {
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000)) + 1;
}

/** Auto granularity: short ranges → days, medium → weeks, long → months. */
export function resolveGranularity(from: Date, to: Date): TrendGranularity {
  const days = calendarDaysBetween(from, to);
  if (days <= 14) return 'day';
  if (days <= 92) return 'week';
  return 'month';
}

function formatDayLabel(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}

function formatMonthLabel(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, { month: 'short', year: '2-digit' });
}

function formatWeekLabel(weekStart: Date, locale: string): string {
  return formatDayLabel(weekStart, locale);
}

/** Indexed week buckets S01…SN — legacy behavior when only `weeks` is provided. */
export function buildWeekBuckets(weeks: number, now = new Date()): TrendBucket[] {
  const safeWeeks = Math.max(1, Math.min(52, Math.floor(weeks)));
  const thisWeekStart = startOfWeek(now);
  const buckets: TrendBucket[] = [];

  for (let i = safeWeeks - 1; i >= 0; i--) {
    const weekStart = new Date(thisWeekStart);
    weekStart.setDate(thisWeekStart.getDate() - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    buckets.push({
      name: `S${String(safeWeeks - i).padStart(2, '0')}`,
      start: weekStart,
      end: weekEnd,
    });
  }

  return buckets;
}

/** Calendar buckets covering [from, to] with day/week/month labels. */
export function buildRangeBuckets(
  from: Date,
  to: Date,
  granularity: TrendGranularity,
  locale = 'fr-FR'
): TrendBucket[] {
  const rangeStart = startOfDay(from);
  const rangeEndExclusive = new Date(endOfDay(to));
  rangeEndExclusive.setMilliseconds(rangeEndExclusive.getMilliseconds() + 1);

  const buckets: TrendBucket[] = [];

  if (granularity === 'day') {
    let cursor = new Date(rangeStart);
    while (cursor < rangeEndExclusive) {
      const start = new Date(cursor);
      const end = new Date(cursor);
      end.setDate(end.getDate() + 1);
      buckets.push({ name: formatDayLabel(start, locale), start, end });
      cursor = end;
    }
    return buckets;
  }

  if (granularity === 'week') {
    let cursor = startOfWeek(rangeStart);
    while (cursor < rangeEndExclusive) {
      const start = new Date(cursor);
      const end = new Date(cursor);
      end.setDate(end.getDate() + 7);
      buckets.push({ name: formatWeekLabel(start, locale), start, end });
      cursor = end;
    }
    return buckets;
  }

  let cursor = startOfMonth(rangeStart);
  while (cursor < rangeEndExclusive) {
    const start = new Date(cursor);
    const end = new Date(cursor);
    end.setMonth(end.getMonth() + 1);
    buckets.push({ name: formatMonthLabel(start, locale), start, end });
    cursor = end;
  }
  return buckets;
}

export function resolveTrendWindow(input: {
  weeks?: number;
  from?: Date;
  to?: Date;
  granularity?: TrendGranularity;
  locale?: string;
  now?: Date;
}): TrendWindow {
  const now = input.now ?? new Date();
  const locale = input.locale === 'en' ? 'en-US' : 'fr-FR';

  if (input.from && input.to) {
    const from = startOfDay(input.from);
    const to = endOfDay(input.to);
    const safeTo = to.getTime() >= from.getTime() ? to : endOfDay(from);
    const granularity = input.granularity ?? resolveGranularity(from, safeTo);
    const buckets = buildRangeBuckets(from, safeTo, granularity, locale);
    return {
      buckets,
      granularity,
      from: buckets[0]?.start ?? from,
      to: safeTo,
    };
  }

  const weeks = Math.max(1, Math.min(52, Math.floor(input.weeks ?? 12)));
  const buckets = buildWeekBuckets(weeks, now);
  return {
    buckets,
    granularity: 'week',
    from: buckets[0]?.start ?? startOfWeek(now),
    to: endOfDay(now),
  };
}

export function isInWeekRange(
  isoOrDate: string | Date | null | undefined,
  start: Date,
  end: Date
): boolean {
  if (!isoOrDate) return false;
  const t = isoOrDate instanceof Date ? isoOrDate.getTime() : new Date(isoOrDate).getTime();
  if (Number.isNaN(t)) return false;
  return t >= start.getTime() && t < end.getTime();
}

export function countDatesPerBucket(
  dates: Array<string | Date | null | undefined>,
  buckets: TrendBucket[]
): number[] {
  return buckets.map(
    (bucket) => dates.filter((d) => isInWeekRange(d, bucket.start, bucket.end)).length
  );
}

export function zipSeries(
  buckets: TrendBucket[],
  primary: number[],
  secondary: number[]
): TrendSeriesPoint[] {
  return buckets.map((bucket, i) => ({
    name: bucket.name,
    primary: primary[i] ?? 0,
    secondary: secondary[i] ?? 0,
  }));
}

function resultBase(
  resource: TrendResource,
  mode: TrendMode,
  window: TrendWindow
): Pick<AnalyticsTrendsResult, 'resource' | 'mode' | 'weeks' | 'granularity' | 'from' | 'to'> {
  return {
    resource,
    mode,
    weeks: window.buckets.length,
    granularity: window.granularity,
    from: window.from.toISOString(),
    to: window.to.toISOString(),
  };
}

function unavailable(
  resource: TrendResource,
  mode: TrendMode,
  window: TrendWindow,
  reason: string
): AnalyticsTrendsResult {
  return {
    ...resultBase(resource, mode, window),
    available: false,
    unavailableReason: reason,
    keys: { primary: 'n/a', secondary: 'n/a' },
    series: zipSeries(
      window.buckets,
      window.buckets.map(() => 0),
      window.buckets.map(() => 0)
    ),
    source: 'none',
  };
}

async function getVolumeTrend(
  tenantId: string,
  resource: TrendResource,
  window: TrendWindow
): Promise<AnalyticsTrendsResult> {
  const { buckets } = window;

  if (resource === 'campaigns') {
    const campaigns = await db.campaign.findMany({
      where: { tenantId },
      select: { createdAt: true, startDate: true, status: true },
    });

    const publishedDates = campaigns
      .filter((c) => c.status === 'active' || c.status === 'completed')
      .map((c) => c.createdAt);
    const scheduledDates = campaigns.map((c) => c.startDate);

    return {
      ...resultBase(resource, 'volume', window),
      available: true,
      keys: { primary: 'published', secondary: 'scheduled' },
      series: zipSeries(
        buckets,
        countDatesPerBucket(publishedDates, buckets),
        countDatesPerBucket(scheduledDates, buckets)
      ),
      source: 'campaign',
    };
  }

  const contentType = RESOURCE_TO_CONTENT_TYPE[resource];
  const contents = await db.content.findMany({
    where: {
      tenantId,
      ...(contentType ? { type: contentType } : {}),
    },
    select: { status: true, publishedAt: true, scheduledAt: true },
  });

  const publishedDates = contents
    .filter((c) => c.status === 'published')
    .map((c) => c.publishedAt);
  const scheduledDates = contents.map((c) => c.scheduledAt);

  return {
    ...resultBase(resource, 'volume', window),
    available: true,
    keys: { primary: 'published', secondary: 'scheduled' },
    series: zipSeries(
      buckets,
      countDatesPerBucket(publishedDates, buckets),
      countDatesPerBucket(scheduledDates, buckets)
    ),
    source: 'content',
  };
}

async function getReachTrend(
  tenantId: string,
  resource: TrendResource,
  window: TrendWindow
): Promise<AnalyticsTrendsResult> {
  if (resource === 'campaigns') {
    return unavailable(
      resource,
      'reach',
      window,
      'Campaign reach time-series is not instrumented yet'
    );
  }

  const { buckets, from } = window;
  const contentType = RESOURCE_TO_CONTENT_TYPE[resource];

  if (resource === 'newsletters') {
    const sends = await db.newsletterSend.findMany({
      where: {
        createdAt: { gte: from },
        content: {
          tenantId,
          type: 'newsletter',
        },
      },
      select: { createdAt: true },
    });

    return {
      ...resultBase(resource, 'reach', window),
      available: true,
      keys: { primary: 'sends', secondary: 'none' },
      series: zipSeries(
        buckets,
        countDatesPerBucket(
          sends.map((s) => s.createdAt),
          buckets
        ),
        buckets.map(() => 0)
      ),
      source: 'newsletter_send',
    };
  }

  const events = await db.contentEvent.findMany({
    where: {
      eventType: CONTENT_EVENT_TYPES.view,
      createdAt: { gte: from },
      content: {
        tenantId,
        ...(contentType ? { type: contentType } : { type: { in: ['article', 'announcement'] } }),
      },
    },
    select: { createdAt: true },
  });

  return {
    ...resultBase(resource, 'reach', window),
    available: true,
    keys: { primary: 'views', secondary: 'none' },
    series: zipSeries(
      buckets,
      countDatesPerBucket(
        events.map((e) => e.createdAt),
        buckets
      ),
      buckets.map(() => 0)
    ),
    source: 'content_event',
  };
}

async function getEngagementTrend(
  tenantId: string,
  resource: TrendResource,
  window: TrendWindow
): Promise<AnalyticsTrendsResult> {
  if (resource === 'campaigns') {
    return unavailable(
      resource,
      'engagement',
      window,
      'Campaign engagement time-series is not instrumented yet'
    );
  }

  const { buckets, from } = window;
  const contentType = RESOURCE_TO_CONTENT_TYPE[resource];

  if (resource === 'newsletters') {
    const sends = await db.newsletterSend.findMany({
      where: {
        content: { tenantId, type: 'newsletter' },
        OR: [{ openedAt: { gte: from } }, { clickedAt: { gte: from } }],
      },
      select: { openedAt: true, clickedAt: true },
    });

    return {
      ...resultBase(resource, 'engagement', window),
      available: true,
      keys: { primary: 'opens', secondary: 'clicks' },
      series: zipSeries(
        buckets,
        countDatesPerBucket(
          sends.map((s) => s.openedAt),
          buckets
        ),
        countDatesPerBucket(
          sends.map((s) => s.clickedAt),
          buckets
        )
      ),
      source: 'newsletter_send',
    };
  }

  if (resource === 'announcements') {
    const [acks, clicks] = await Promise.all([
      db.contentEvent.findMany({
        where: {
          eventType: CONTENT_EVENT_TYPES.acknowledge,
          createdAt: { gte: from },
          content: { tenantId, type: 'announcement' },
        },
        select: { createdAt: true },
      }),
      db.contentEvent.findMany({
        where: {
          eventType: CONTENT_EVENT_TYPES.click,
          createdAt: { gte: from },
          content: { tenantId, type: 'announcement' },
        },
        select: { createdAt: true },
      }),
    ]);

    return {
      ...resultBase(resource, 'engagement', window),
      available: true,
      keys: { primary: 'acknowledges', secondary: 'clicks' },
      series: zipSeries(
        buckets,
        countDatesPerBucket(
          acks.map((e) => e.createdAt),
          buckets
        ),
        countDatesPerBucket(
          clicks.map((e) => e.createdAt),
          buckets
        )
      ),
      source: 'content_event',
    };
  }

  const typeFilter =
    resource === 'articles'
      ? ({ type: 'article' as const })
      : contentType
        ? { type: contentType }
        : { type: { in: ['article', 'announcement'] as const } };

  const [views, clicks] = await Promise.all([
    db.contentEvent.findMany({
      where: {
        eventType: CONTENT_EVENT_TYPES.view,
        createdAt: { gte: from },
        content: { tenantId, ...typeFilter },
      },
      select: { createdAt: true },
    }),
    db.contentEvent.findMany({
      where: {
        eventType: CONTENT_EVENT_TYPES.click,
        createdAt: { gte: from },
        content: { tenantId, ...typeFilter },
      },
      select: { createdAt: true },
    }),
  ]);

  return {
    ...resultBase(resource, 'engagement', window),
    available: true,
    keys: { primary: 'views', secondary: 'clicks' },
    series: zipSeries(
      buckets,
      countDatesPerBucket(
        views.map((e) => e.createdAt),
        buckets
      ),
      countDatesPerBucket(
        clicks.map((e) => e.createdAt),
        buckets
      )
    ),
    source: 'content_event',
  };
}

async function getQualityTrend(
  tenantId: string,
  resource: TrendResource,
  window: TrendWindow
): Promise<AnalyticsTrendsResult> {
  if (resource !== 'newsletters' && resource !== 'all') {
    return unavailable(
      resource,
      'quality',
      window,
      'Quality time-series is only available for newsletters'
    );
  }

  const { buckets, from } = window;

  const sends = await db.newsletterSend.findMany({
    where: {
      createdAt: { gte: from },
      content: { tenantId, type: 'newsletter' },
    },
    select: { createdAt: true, status: true },
  });

  const bouncedDates = sends.filter((s) => s.status === 'bounced').map((s) => s.createdAt);
  const sendDates = sends.map((s) => s.createdAt);

  return {
    ...resultBase(resource, 'quality', window),
    available: true,
    keys: { primary: 'bounces', secondary: 'sends' },
    series: zipSeries(
      buckets,
      countDatesPerBucket(bouncedDates, buckets),
      countDatesPerBucket(sendDates, buckets)
    ),
    source: 'newsletter_send',
  };
}

export async function getAnalyticsTrends(input: {
  tenantId: string;
  resource: TrendResource;
  mode: TrendMode;
  weeks?: number;
  from?: Date;
  to?: Date;
  granularity?: TrendGranularity;
  locale?: string;
  now?: Date;
}): Promise<AnalyticsTrendsResult> {
  const window = resolveTrendWindow({
    weeks: input.weeks,
    from: input.from,
    to: input.to,
    granularity: input.granularity,
    locale: input.locale,
    now: input.now,
  });

  switch (input.mode) {
    case 'volume':
      return getVolumeTrend(input.tenantId, input.resource, window);
    case 'reach':
      return getReachTrend(input.tenantId, input.resource, window);
    case 'engagement':
      return getEngagementTrend(input.tenantId, input.resource, window);
    case 'quality':
      return getQualityTrend(input.tenantId, input.resource, window);
  }
}
