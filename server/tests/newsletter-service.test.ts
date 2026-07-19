import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  resolveRecipients,
  computeRates,
  buildDispatchItems,
} from '../services/newsletter.service';

interface FakeSubscriber {
  id: string;
  email: string;
  status: 'subscribed' | 'unsubscribed';
  channelId: string;
}

describe('resolveRecipients', () => {
  const subs: FakeSubscriber[] = [
    { id: 's1', email: 'a@b.com', status: 'subscribed', channelId: 'c1' },
    { id: 's2', email: 'c@d.com', status: 'subscribed', channelId: 'c1' },
    { id: 's3', email: 'e@f.com', status: 'unsubscribed', channelId: 'c1' },
    { id: 's4', email: 'g@h.com', status: 'subscribed', channelId: 'c2' },
  ];

  it('returns only subscribed subscribers for the given channels', () => {
    const result = resolveRecipients(['c1'], subs as never);
    assert.deepEqual(result.map((s) => s.id).sort(), ['s1', 's2']);
  });

  it('dedupes subscribers present in multiple channels', () => {
    const shared = { id: 's9', email: 'z@z.com', status: 'subscribed', channelId: 'c1' };
    const result = resolveRecipients(
      ['c1', 'c2'],
      [...subs, shared, { ...shared, channelId: 'c2' }] as never
    );
    const ids = result.map((s) => s.id);
    assert.equal(ids.filter((id) => id === 's9').length, 1);
  });

  it('returns empty when no channels match', () => {
    assert.equal(resolveRecipients(['cX'], subs as never).length, 0);
  });
});

describe('computeRates', () => {
  it('computes recipientCount, openRate and clickRate', () => {
    const sends = [
      { status: 'opened' },
      { status: 'opened' },
      { status: 'sent' },
      { status: 'clicked' },
    ] as never;
    const rates = computeRates(sends);
    assert.equal(rates.recipientCount, 4);
    assert.equal(rates.openRate, 75);
    assert.equal(rates.clickRate, 25);
  });

  it('handles zero recipients without division by zero', () => {
    const rates = computeRates([]);
    assert.equal(rates.recipientCount, 0);
    assert.equal(rates.openRate, 0);
    assert.equal(rates.clickRate, 0);
  });
});

describe('buildDispatchItems', () => {
  it('selects newsletters scheduled at/before now with scheduled/approved/published status', () => {
    const now = new Date('2026-07-09T12:00:00Z');
    const contents = [
      { id: 'n1', type: 'newsletter', status: 'scheduled', scheduledAt: '2026-07-09T11:00:00Z', metadata: { channelIds: ['c1'], emailSubject: 'Obj' } },
      { id: 'n2', type: 'newsletter', status: 'approved', scheduledAt: '2026-07-09T12:00:00Z', metadata: { channelIds: ['c1'] } },
      { id: 'n3', type: 'newsletter', status: 'scheduled', scheduledAt: '2026-07-10T12:00:00Z', metadata: { channelIds: ['c1'] } },
      { id: 'n4', type: 'article', status: 'scheduled', scheduledAt: '2026-07-09T11:00:00Z', metadata: { channelIds: ['c1'] } },
      { id: 'n5', type: 'newsletter', status: 'published', scheduledAt: '2026-07-09T11:00:00Z', metadata: { channelIds: ['c1'] } },
      { id: 'n6', type: 'newsletter', status: 'published', scheduledAt: '2026-07-10T12:00:00Z', metadata: { channelIds: ['c1'] } },
    ] as never;
    const items = buildDispatchItems(contents, now);
    assert.deepEqual(items.map((i) => i.id).sort(), ['n1', 'n2', 'n5']);
  });
});
