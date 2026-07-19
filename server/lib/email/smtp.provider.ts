import nodemailer from 'nodemailer';
import type { EmailMessage, EmailProvider, EmailSendResult } from './provider';

type Transporter = {
  sendMail: (msg: {
    from: string;
    to: string;
    subject: string;
    html: string;
  }) => Promise<{ messageId?: string }>;
};

export interface SmtpEmailProviderOptions {
  from?: string;
  fromName?: string;
  transporter?: Transporter;
}

const DNS_RETRY_CODES = new Set(['ENOTFOUND', 'EAI_AGAIN', 'ECONNRESET', 'ETIMEDOUT']);
const MAX_SEND_ATTEMPTS = 3;

function isTransientSmtpError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = 'code' in error ? String((error as { code?: unknown }).code ?? '') : '';
  return DNS_RETRY_CODES.has(code);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildTransporter(): Transporter {
  const port = Number(process.env.SMTP_PORT ?? 465);
  const secure = port === 465;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'smtp.hostinger.com',
    port,
    secure,
    requireTLS: !secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  }) as unknown as Transporter;
}

export class SmtpEmailProvider implements EmailProvider {
  readonly from: string;
  readonly transporter: Transporter;

  constructor(options: SmtpEmailProviderOptions = {}) {
    const address = options.from ?? process.env.EMAIL_FROM ?? process.env.SMTP_USER ?? 'newsletter@itm.example';
    const name = options.fromName ?? process.env.EMAIL_FROM_NAME;
    this.from = name ? `${name} <${address}>` : address;
    this.transporter = options.transporter ?? buildTransporter();
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_SEND_ATTEMPTS; attempt += 1) {
      try {
        const info = await this.transporter.sendMail({
          from: this.from,
          to: message.to,
          subject: message.subject,
          html: message.html,
        });
        return { id: info.messageId ?? `smtp-${Date.now()}` };
      } catch (error) {
        lastError = error;
        if (!isTransientSmtpError(error) || attempt === MAX_SEND_ATTEMPTS) {
          throw error;
        }
        console.warn(
          `[email:smtp] transient ${String((error as { code?: string }).code)} on attempt ${attempt}/${MAX_SEND_ATTEMPTS}, retrying…`
        );
        await sleep(attempt * 250);
      }
    }

    throw lastError;
  }
}
