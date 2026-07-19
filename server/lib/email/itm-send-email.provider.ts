import type { EmailMessage, EmailProvider, EmailSendResult } from './provider';

function stripHtmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

type FetchImpl = (url: string, init: { method: string; body: string }) => Promise<{ ok: boolean; status: number }>;

export interface ItmSendEmailProviderOptions {
  baseUrl?: string;
  from?: string;
  fetchImpl?: FetchImpl;
}

export class ItmSendEmailProvider implements EmailProvider {
  private readonly baseUrl: string;
  readonly from: string;
  private readonly fetchImpl: FetchImpl;

  constructor(options: ItmSendEmailProviderOptions = {}) {
    this.baseUrl = (options.baseUrl ?? process.env.ITM_SEND_EMAIL_URL ?? 'http://localhost:5001').replace(/\/$/, '');
    this.from = options.from ?? process.env.EMAIL_FROM ?? 'newsletter@itm.example';
    this.fetchImpl = options.fetchImpl ?? (globalThis.fetch as unknown as FetchImpl);
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const text = stripHtmlToText(message.html);
    const res = await this.fetchImpl(`${this.baseUrl}/api/send-text/talentPro`, {
      method: 'POST',
      body: JSON.stringify({
        email: message.to,
        subject: message.subject,
        text,
      }),
    });

    if (!res.ok) {
      throw new Error(`itm-send-email responded with status ${res.status}`);
    }

    return { id: `itm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
  }
}
