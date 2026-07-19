import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { subscriberCreateSchema } from '../lib/schemas';

describe('subscriberCreateSchema', () => {
  it('accepts a valid subscriber payload', () => {
    const r = subscriberCreateSchema.safeParse({
      email: 'reader@example.com',
      name: 'Jane',
      channelId: 'chan-1',
    });
    assert.equal(r.success, true);
  });

  it('rejects an invalid email', () => {
    const r = subscriberCreateSchema.safeParse({
      email: 'not-an-email',
      channelId: 'chan-1',
    });
    assert.equal(r.success, false);
  });

  it('rejects a missing channelId', () => {
    const r = subscriberCreateSchema.safeParse({ email: 'reader@example.com' });
    assert.equal(r.success, false);
  });

  it('accepts a payload without optional name', () => {
    const r = subscriberCreateSchema.safeParse({
      email: 'reader@example.com',
      channelId: 'chan-1',
    });
    assert.equal(r.success, true);
  });
});
