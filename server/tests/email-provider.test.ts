import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import { ConsoleEmailProvider, getEmailProvider } from '../lib/email/provider';

describe('ConsoleEmailProvider', () => {
  it('returns an id and records the sent message', async () => {
    const provider = new ConsoleEmailProvider();
    const result = await provider.send({
      to: 'a@b.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
      meta: { sendId: 'send-1' },
    });

    assert.ok(result.id);
    assert.equal(provider.sent.length, 1);
    assert.equal(provider.sent[0].to, 'a@b.com');
    assert.equal(provider.sent[0].subject, 'Hello');
    assert.equal(provider.sent[0].meta.sendId, 'send-1');
  });

  it('returns a distinct id per message', async () => {
    const provider = new ConsoleEmailProvider();
    const a = await provider.send({ to: 'a@b.com', subject: 's', html: 'h' });
    const b = await provider.send({ to: 'c@d.com', subject: 's', html: 'h' });
    assert.notEqual(a.id, b.id);
  });
});

describe('getEmailProvider', () => {
  const previous = process.env.EMAIL_PROVIDER;

  it('returns ConsoleEmailProvider by default', () => {
    delete process.env.EMAIL_PROVIDER;
    assert.ok(getEmailProvider() instanceof ConsoleEmailProvider);
  });

  it('returns ConsoleEmailProvider when EMAIL_PROVIDER=console', () => {
    process.env.EMAIL_PROVIDER = 'console';
    assert.ok(getEmailProvider() instanceof ConsoleEmailProvider);
  });

  after(() => {
    if (previous === undefined) delete process.env.EMAIL_PROVIDER;
    else process.env.EMAIL_PROVIDER = previous;
  });
});
