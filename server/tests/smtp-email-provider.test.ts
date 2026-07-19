import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import { SmtpEmailProvider } from '../lib/email/smtp.provider';

describe('SmtpEmailProvider', () => {
  const previous = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM,
    fromName: process.env.EMAIL_FROM_NAME,
  };

  after(() => {
    for (const [k, v] of Object.entries({
      SMTP_HOST: previous.host,
      SMTP_PORT: previous.port,
      SMTP_USER: previous.user,
      SMTP_PASS: previous.pass,
      EMAIL_FROM: previous.from,
      EMAIL_FROM_NAME: previous.fromName,
    })) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  it('sends an HTML email through the injected transporter', async () => {
    delete process.env.EMAIL_FROM_NAME;
    const sent: unknown[] = [];
    const transporter = {
      sendMail: async (msg: Record<string, unknown>) => {
        sent.push(msg);
        return { messageId: 'abc@host' };
      },
    };

    const provider = new SmtpEmailProvider({
      from: 'joseph.ny@basafrica.com',
      transporter: transporter as never,
    });

    const result = await provider.send({
      to: 'Josephbasix@gmail.com',
      subject: 'Newsletter',
      html: '<h1>Bonjour</h1>',
      meta: { sendId: 'send-1' },
    });

    assert.ok(result.id);
    assert.equal(sent.length, 1);
    const msg = sent[0] as { from: string; to: string; subject: string; html: string };
    assert.equal(msg.from, 'joseph.ny@basafrica.com');
    assert.equal(msg.to, 'Josephbasix@gmail.com');
    assert.equal(msg.subject, 'Newsletter');
    assert.equal(msg.html, '<h1>Bonjour</h1>');
  });

  it('retries on transient ENOTFOUND then succeeds', async () => {
    let attempts = 0;
    const transporter = {
      sendMail: async () => {
        attempts += 1;
        if (attempts === 1) {
          const err = new Error('getaddrinfo ENOTFOUND smtp.hostinger.com') as Error & { code: string };
          err.code = 'ENOTFOUND';
          throw err;
        }
        return { messageId: 'retry@host' };
      },
    };

    const provider = new SmtpEmailProvider({
      from: 'joseph.ny@basafrica.com',
      transporter: transporter as never,
    });

    const result = await provider.send({
      to: 'joel.musema@itmafrica.com',
      subject: 'Retry',
      html: '<p>ok</p>',
    });

    assert.equal(result.id, 'retry@host');
    assert.equal(attempts, 2);
  });

  it('builds a real transporter from SMTP_* env when none injected', () => {
    delete process.env.EMAIL_FROM_NAME;
    process.env.SMTP_HOST = 'smtp.hostinger.com';
    process.env.SMTP_PORT = '465';
    process.env.SMTP_USER = 'joseph.ny@basafrica.com';
    process.env.SMTP_PASS = 'secret';
    process.env.EMAIL_FROM = 'joseph.ny@basafrica.com';
    const provider = new SmtpEmailProvider();
    assert.equal(provider.from, 'joseph.ny@basafrica.com');
    assert.ok(provider.transporter);
  });
});
