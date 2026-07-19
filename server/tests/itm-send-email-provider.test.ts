import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import { ItmSendEmailProvider } from '../lib/email/itm-send-email.provider';

describe('ItmSendEmailProvider', () => {
  const previousUrl = process.env.ITM_SEND_EMAIL_URL;
  const previousFrom = process.env.EMAIL_FROM;

  after(() => {
    if (previousUrl === undefined) delete process.env.ITM_SEND_EMAIL_URL;
    else process.env.ITM_SEND_EMAIL_URL = previousUrl;
    if (previousFrom === undefined) delete process.env.EMAIL_FROM;
    else process.env.EMAIL_FROM = previousFrom;
  });

  it('posts to /api/send-text/talentPro with email, subject and stripped text', async () => {
    const calls: unknown[] = [];
    const provider = new ItmSendEmailProvider({
      baseUrl: 'http://localhost:5001',
      from: 'newsletter@itm.example',
      fetchImpl: async (url: string, init: { method: string; body: string }) => {
        calls.push({ url, init });
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      },
    });

    const result = await provider.send({
      to: 'Josephbasix@gmail.com',
      subject: 'Newsletter',
      html: '<h1>Bonjour</h1><p>Contenu <a href="https://x.com">lien</a></p>',
      meta: { sendId: 'send-1' },
    });

    assert.ok(result.id);
    assert.equal(calls.length, 1);
    const { url, init } = calls[0] as { url: string; init: { body: string } };
    assert.equal(url, 'http://localhost:5001/api/send-text/talentPro');
    const payload = JSON.parse(init.body);
    assert.equal(payload.email, 'Josephbasix@gmail.com');
    assert.equal(payload.subject, 'Newsletter');
    assert.match(payload.text, /Bonjour/);
    assert.match(payload.text, /Contenu/);
    assert.ok(!payload.text.includes('<h1>'));
  });

  it('falls back to EMAIL_FROM when no from is provided', () => {
    process.env.EMAIL_FROM = 'default@itm.example';
    const provider = new ItmSendEmailProvider({ baseUrl: 'http://localhost:5001' });
    assert.equal(provider.from, 'default@itm.example');
  });
});
