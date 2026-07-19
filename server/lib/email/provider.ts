export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  meta?: Record<string, unknown>;
}

export interface EmailSendResult {
  id: string;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<EmailSendResult>;
}

import { ItmSendEmailProvider } from './itm-send-email.provider';
export { ItmSendEmailProvider };
import { SmtpEmailProvider } from './smtp.provider';
export { SmtpEmailProvider };

export class ConsoleEmailProvider implements EmailProvider {
  public readonly sent: EmailMessage[] = [];

  async send(message: EmailMessage): Promise<EmailSendResult> {
    this.sent.push(message);
    const id = `email-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    console.info(
      `[email:console] to=${message.to} subject="${message.subject}" sendId=${String(message.meta?.sendId ?? 'n/a')}`
    );
    return { id };
  }
}

let cached: EmailProvider | undefined;

export function getEmailProvider(): EmailProvider {
  if (cached) return cached;

  switch (process.env.EMAIL_PROVIDER) {
    case 'console':
    case undefined:
      cached = new ConsoleEmailProvider();
      break;
    case 'itm-send-email':
      cached = new ItmSendEmailProvider();
      break;
    case 'smtp':
      cached = new SmtpEmailProvider();
      break;
    default:
      // Other real providers plug in here without touching callers.
      cached = new ConsoleEmailProvider();
      break;
  }

  return cached;
}
