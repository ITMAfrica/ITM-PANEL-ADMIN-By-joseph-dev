import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildRangeBuckets,
  buildWeekBuckets,
  countDatesPerBucket,
  isInWeekRange,
  resolveGranularity,
  resolveTrendWindow,
  zipSeries,
} from '../services/analytics-trends.service';
import { analyticsTrendsQuerySchema } from '../lib/schemas';
import { CONTENT_EVENT_TYPES } from '../lib/analytics-events';

describe('buildWeekBuckets', () => {
  it('builds oldest-to-newest labeled weeks ending at current week', () => {
    const now = new Date('2026-07-15T12:00:00');
    const buckets = buildWeekBuckets(4, now);

    assert.equal(buckets.length, 4);
    assert.equal(buckets[0].name, 'S01');
    assert.equal(buckets[3].name, 'S04');
    assert.ok(buckets[0].start.getTime() < buckets[3].start.getTime());
    assert.equal(buckets[3].start.getDay(), 1);
    assert.ok(buckets[3].start.getTime() <= now.getTime());
    assert.ok(buckets[3].end.getTime() > now.getTime());

    for (const bucket of buckets) {
      assert.equal(
        (bucket.end.getTime() - bucket.start.getTime()) / (24 * 60 * 60 * 1000),
        7
      );
    }
  });

  it('clamps weeks between 1 and 52', () => {
    assert.equal(buildWeekBuckets(0).length, 1);
    assert.equal(buildWeekBuckets(100).length, 52);
  });
});

describe('resolveGranularity / buildRangeBuckets', () => {
  it('picks day / week / month from range length', () => {
    assert.equal(
      resolveGranularity(new Date('2026-07-01'), new Date('2026-07-07')),
      'day'
    );
    assert.equal(
      resolveGranularity(new Date('2026-06-16'), new Date('2026-07-15')),
      'week'
    );
    assert.equal(
      resolveGranularity(new Date('2025-07-15'), new Date('2026-07-15')),
      'month'
    );
  });

  it('builds day labels for a short range', () => {
    const buckets = buildRangeBuckets(
      new Date('2026-07-13'),
      new Date('2026-07-15'),
      'day',
      'fr-FR'
    );
    assert.equal(buckets.length, 3);
    assert.ok(buckets[0].name.length > 0);
    assert.notEqual(buckets[0].name.startsWith('S0'), true);
  });

  it('builds month labels for a long range', () => {
    const buckets = buildRangeBuckets(
      new Date('2026-01-01'),
      new Date('2026-03-31'),
      'month',
      'fr-FR'
    );
    assert.equal(buckets.length, 3);
    assert.ok(!buckets[0].name.startsWith('S'));
  });
});

describe('resolveTrendWindow', () => {
  it('prefers from/to calendar window over weeks', () => {
    const window = resolveTrendWindow({
      weeks: 12,
      from: new Date('2026-06-16'),
      to: new Date('2026-07-15'),
      locale: 'fr',
    });
    assert.equal(window.granularity, 'week');
    assert.ok(window.buckets.length >= 4);
    assert.ok(!window.buckets[0].name.startsWith('S0'));
  });

  it('falls back to indexed Sxx weeks when no from/to', () => {
    const window = resolveTrendWindow({ weeks: 4, now: new Date('2026-07-15T12:00:00') });
    assert.equal(window.granularity, 'week');
    assert.equal(window.buckets[0].name, 'S01');
  });
});

describe('isInWeekRange / countDatesPerBucket', () => {
  it('counts inclusive start and exclusive end', () => {
    const buckets = buildWeekBuckets(2, new Date('2026-07-15T12:00:00Z'));
    const older = buckets[0];
    const newer = buckets[1];

    assert.equal(isInWeekRange(older.start, older.start, older.end), true);
    assert.equal(isInWeekRange(older.end, older.start, older.end), false);

    const counts = countDatesPerBucket(
      [older.start, newer.start, null, 'invalid-date'],
      buckets
    );
    assert.deepEqual(counts, [1, 1]);
  });
});

describe('zipSeries', () => {
  it('pairs primary/secondary counts with bucket names', () => {
    const buckets = buildWeekBuckets(2, new Date('2026-07-15T12:00:00Z'));
    const series = zipSeries(buckets, [3, 5], [1, 0]);
    assert.deepEqual(series, [
      { name: 'S01', primary: 3, secondary: 1 },
      { name: 'S02', primary: 5, secondary: 0 },
    ]);
  });
});

describe('analyticsTrendsQuerySchema', () => {
  it('applies defaults', () => {
    const parsed = analyticsTrendsQuerySchema.safeParse({});
    assert.equal(parsed.success, true);
    if (!parsed.success) return;
    assert.equal(parsed.data.resource, 'all');
    assert.equal(parsed.data.mode, 'volume');
    assert.equal(parsed.data.weeks, 12);
  });

  it('accepts from/to ISO strings', () => {
    const parsed = analyticsTrendsQuerySchema.safeParse({
      from: '2026-06-16T00:00:00.000Z',
      to: '2026-07-15T23:59:59.999Z',
      mode: 'volume',
      locale: 'fr',
    });
    assert.equal(parsed.success, true);
    if (!parsed.success) return;
    assert.ok(parsed.data.from instanceof Date);
    assert.ok(parsed.data.to instanceof Date);
  });

  it('rejects invalid mode/resource', () => {
    assert.equal(
      analyticsTrendsQuerySchema.safeParse({ mode: 'foo' }).success,
      false
    );
    assert.equal(
      analyticsTrendsQuerySchema.safeParse({ resource: 'posts' }).success,
      false
    );
  });
});

describe('CONTENT_EVENT_TYPES', () => {
  it('exposes stable event type strings for future wiring', () => {
    assert.equal(CONTENT_EVENT_TYPES.view, 'view');
    assert.equal(CONTENT_EVENT_TYPES.click, 'click');
    assert.equal(CONTENT_EVENT_TYPES.acknowledge, 'acknowledge');
  });
});
