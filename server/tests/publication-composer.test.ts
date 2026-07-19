import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

// ── isCmsType : séparation UI CMS vs social ──────────────────────────────
import { isCmsType } from '../../src/lib/publication-composer';

describe('isCmsType (composer UI logic)', () => {
  it('treats newsletter as CMS type', () => {
    assert.equal(isCmsType('newsletter'), true);
  });

  it('treats article as CMS type', () => {
    assert.equal(isCmsType('article'), true);
  });

  it('treats announcement as CMS type', () => {
    assert.equal(isCmsType('announcement'), true);
  });

  it('treats social as NON-CMS type (current: blocks submission)', () => {
    assert.equal(isCmsType('social'), false);
  });
});

// ── contentCreateSchema : validation serveur (la porte réelle pour social) ─
import {
  contentCreateSchema,
  hasNewsletterChannelIds,
  newsletterStatusRequiresChannels,
} from '../lib/schemas';

describe('contentCreateSchema (server validation)', () => {
  const base = { title: 'Titre requis', status: 'draft' };

  it('PASS: accepts newsletter', () => {
    const r = contentCreateSchema.safeParse({ ...base, type: 'newsletter' });
    assert.equal(r.success, true);
  });

  it('PASS: accepts article', () => {
    const r = contentCreateSchema.safeParse({ ...base, type: 'article' });
    assert.equal(r.success, true);
  });

  it('PASS: accepts announcement', () => {
    const r = contentCreateSchema.safeParse({ ...base, type: 'announcement' });
    assert.equal(r.success, false === false ? true : true);
    const res = contentCreateSchema.safeParse({ ...base, type: 'announcement' });
    assert.equal(res.success, true);
  });

  // TDD RED: ce test échoue tant que le backend n'inclut pas 'social'.
  it('RED: should accept social (currently rejected by schema)', () => {
    const r = contentCreateSchema.safeParse({ ...base, type: 'social' });
    assert.equal(r.success, true);
  });

  it('PASS: newsletter draft without channels', () => {
    const r = contentCreateSchema.safeParse({
      type: 'newsletter',
      title: 'Draft NL',
      status: 'draft',
      metadata: { channelIds: [] },
    });
    assert.equal(r.success, true);
  });

  it('PASS: newsletter published with channels', () => {
    const r = contentCreateSchema.safeParse({
      type: 'newsletter',
      title: 'Send NL',
      status: 'published',
      metadata: { channelIds: ['chan-1'], emailSubject: 'ITM Newsletter' },
    });
    assert.equal(r.success, true);
  });

  it('FAIL: newsletter published without channels', () => {
    const r = contentCreateSchema.safeParse({
      type: 'newsletter',
      title: 'Send NL',
      status: 'published',
      metadata: { channelIds: [] },
    });
    assert.equal(r.success, false);
  });

  it('FAIL: newsletter scheduled without channels', () => {
    const r = contentCreateSchema.safeParse({
      type: 'newsletter',
      title: 'Scheduled NL',
      status: 'scheduled',
    });
    assert.equal(r.success, false);
  });

  it('FAIL: newsletter published without emailSubject', () => {
    const r = contentCreateSchema.safeParse({
      type: 'newsletter',
      title: 'Send NL',
      status: 'published',
      metadata: { channelIds: ['chan-1'], emailSubject: '   ' },
    });
    assert.equal(r.success, false);
  });

  it('PASS: newsletter published with channels and emailSubject', () => {
    const r = contentCreateSchema.safeParse({
      type: 'newsletter',
      title: 'Send NL',
      status: 'published',
      metadata: {
        channelIds: ['chan-1'],
        emailSubject: 'ITM HR Academy — Rejoignez la communauté',
      },
    });
    assert.equal(r.success, true);
  });
});

describe('newsletter channel helpers', () => {
  it('requires channels for published and scheduled', () => {
    assert.equal(newsletterStatusRequiresChannels('published'), true);
    assert.equal(newsletterStatusRequiresChannels('scheduled'), true);
    assert.equal(newsletterStatusRequiresChannels('draft'), false);
  });

  it('detects non-empty channelIds', () => {
    assert.equal(hasNewsletterChannelIds({ channelIds: ['a'] }), true);
    assert.equal(hasNewsletterChannelIds({ channelIds: [] }), false);
    assert.equal(hasNewsletterChannelIds({}), false);
  });
});
