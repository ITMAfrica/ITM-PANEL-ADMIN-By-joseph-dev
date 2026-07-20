import { db } from '../lib/prisma';
import { getEmailProvider, type EmailProvider } from '../lib/email/provider';
import {
  injectTrackingIntoHtml,
  isCompleteHtmlDocument,
  renderNewsletterHtml,
} from '../lib/email/render';
import { renderNewsletterBody } from '../lib/markdown';
import {
  parseSections,
  renderSectionsToHtml,
  signUploadImagesInHtml,
} from '../lib/newsletter-template-render';

export interface RecipientLike {
  id: string;
  email: string;
  status: 'subscribed' | 'unsubscribed';
  channelId: string;
}

export interface DispatchContentLike {
  id: string;
  type: string;
  status: string;
  scheduledAt: string | Date | null;
  title: string;
  body: string;
  metadata: Record<string, unknown>;
  channelIds?: string[];
}

export interface DispatchItem {
  id: string;
  subject: string;
  body: string;
  channelIds: string[];
  templateId?: string | null;
  headerTitle?: string;
  headerSubtitle?: string;
}

export interface DispatchResult {
  dispatched: number;
  recipients: number;
  skippedNoChannels: number;
  skippedNoRecipients: number;
  errors: { id: string; reason: string }[];
}

export function resolveRecipients(
  channelIds: string[],
  subscribers: RecipientLike[]
): RecipientLike[] {
  const seen = new Set<string>();
  const result: RecipientLike[] = [];
  for (const sub of subscribers) {
    if (sub.status !== 'subscribed') continue;
    if (!channelIds.includes(sub.channelId)) continue;
    if (seen.has(sub.id)) continue;
    seen.add(sub.id);
    result.push(sub);
  }
  return result;
}

function deriveSubtitle(body: string): string {
  return body
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[[^\]]+]\([^)]+\)/g, '$1')
    .replace(/[#*_>]/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim()
    .split('\n')
    .slice(0, 1)
    .join(' ')
    .slice(0, 160);
}

export function computeRates(
  sends: { status: string }[]
): { recipientCount: number; openRate: number; clickRate: number } {
  const recipientCount = sends.length;
  if (recipientCount === 0) {
    return { recipientCount: 0, openRate: 0, clickRate: 0 };
  }
  const opened = sends.filter((s) => s.status === 'opened' || s.status === 'clicked').length;
  const clicked = sends.filter((s) => s.status === 'clicked').length;
  const openRate = Math.round((opened / recipientCount) * 1000) / 10;
  const clickRate = Math.round((clicked / recipientCount) * 1000) / 10;
  return { recipientCount, openRate, clickRate };
}

export function buildDispatchItems(
  contents: DispatchContentLike[],
  now: Date
): DispatchItem[] {
  return contents
    .filter((c) => {
      if (c.type !== 'newsletter') return false;
      if (c.status !== 'scheduled' && c.status !== 'approved' && c.status !== 'published') return false;
      const when = c.scheduledAt ? new Date(c.scheduledAt) : null;
      return when !== null && when.getTime() <= now.getTime();
    })
    .map((c) => ({
      id: c.id,
      subject: resolveEmailSubject(c.metadata?.emailSubject, c.title),
      body: c.body ?? '',
      templateId: typeof c.metadata?.templateId === 'string' ? c.metadata.templateId : null,
      headerTitle: c.title ?? '',
      headerSubtitle: deriveSubtitle(c.body ?? ''),
      channelIds:
        c.channelIds && c.channelIds.length > 0
          ? c.channelIds
          : Array.isArray(c.metadata?.channelIds)
            ? (c.metadata.channelIds as string[])
            : [],
    }));
}

export async function dispatchDueNewsletters(
  opts: { now?: Date; provider?: EmailProvider } = {}
): Promise<DispatchResult> {
  const now = opts.now ?? new Date();
  const provider = opts.provider ?? getEmailProvider();
  const appUrl = (process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001').replace(/\/$/, '');

  const contents = await db.content.findMany({
    where: {
      type: 'newsletter',
      status: { in: ['scheduled', 'approved', 'published'] },
      scheduledAt: { lte: now },
    },
    orderBy: { scheduledAt: 'asc' },
  });

  const contentChannels = await db.contentChannel.findMany({
    where: { contentId: { in: contents.map((c) => c.id) } },
  });
  const channelIdsByContent = new Map<string, string[]>();
  for (const link of contentChannels) {
    const ids = channelIdsByContent.get(link.contentId) ?? [];
    ids.push(link.channelId);
    channelIdsByContent.set(link.contentId, ids);
  }

  const items = buildDispatchItems(
    contents.map((c) => {
      const meta = c.metadata && typeof c.metadata === 'object'
        ? (c.metadata as Record<string, unknown>)
        : {};
      const metaChannelIds = Array.isArray(meta.channelIds)
        ? (meta.channelIds as string[])
        : [];
      // metadata.channelIds is the source of truth (set by the UI).
      // Fall back to ContentChannel links only if metadata is empty.
      const resolvedChannelIds =
        metaChannelIds.length > 0 ? metaChannelIds : channelIdsByContent.get(c.id) ?? [];
      return { ...c, channelIds: resolvedChannelIds };
    }) as unknown as DispatchContentLike[],
    now
  );
  let dispatched = 0;
  let totalRecipients = 0;
  let skippedNoChannels = 0;
  let skippedNoRecipients = 0;
  const errors: { id: string; reason: string }[] = [];

  for (const item of items) {
    if (item.channelIds.length === 0) {
      skippedNoChannels += 1;
      console.warn(
        `[newsletter] "${item.id}" eligible for dispatch but has NO linked channels (ContentChannel). ` +
          `Check that channels were attached to this newsletter.`
      );
      continue;
    }
    try {
      const sent = await dispatchItem(item, provider, appUrl);
      if (sent.reason === 'sent') {
        dispatched += 1;
        totalRecipients += sent.recipients;
      } else {
        skippedNoRecipients += 1;
        console.warn(
          `[newsletter] "${item.id}" has ${item.channelIds.length} channel(s) but dispatched 0 recipient(s) ` +
            `(reason=${sent.reason}). Likely no active subscribers (Subscription) on those channels.`
        );
      }
    } catch (error) {
      errors.push({ id: item.id, reason: error instanceof Error ? error.message : String(error) });
      console.error(`[newsletter] dispatch failed for "${item.id}":`, error);
    }
  }

  return {
    dispatched,
    recipients: totalRecipients,
    skippedNoChannels,
    skippedNoRecipients,
    errors,
  };
}

export async function resolveNewsletterHtml(
  item: Pick<DispatchItem, 'body' | 'templateId'>,
  appUrl: string
): Promise<string> {
  const sections = parseSections(item.body);
  if (sections) {
    // Full template document — must not be wrapped again in the generic envelope.
    return signUploadImagesInHtml(renderSectionsToHtml(sections), appUrl);
  }

  if (item.templateId) {
    const template = await db.newsletterTemplate.findUnique({
      where: { id: item.templateId },
    });
    if (template && template.body.trim()) {
      const templateSections = parseSections(template.body);
      if (templateSections) {
        return signUploadImagesInHtml(renderSectionsToHtml(templateSections), appUrl);
      }
      return signUploadImagesInHtml(template.body, appUrl);
    }
  }
  return renderNewsletterBody(item.body, appUrl);
}

function resolveEmailSubject(
  emailSubject: unknown,
  fallbackTitle: string | null | undefined
): string {
  if (typeof emailSubject === 'string' && emailSubject.trim()) {
    return emailSubject.trim();
  }
  return String(fallbackTitle ?? '').trim();
}

function buildOutboundHtml(
  htmlBody: string,
  item: DispatchItem,
  sendId: string,
  appUrl: string
): string {
  if (isCompleteHtmlDocument(htmlBody)) {
    return injectTrackingIntoHtml(htmlBody, sendId, appUrl);
  }
  return renderNewsletterHtml({
    subject: item.subject,
    body: htmlBody,
    sendId,
    appUrl,
    headerTitle: item.headerTitle,
    headerSubtitle: item.headerSubtitle,
  });
}

export interface DispatchItemResult {
  recipients: number;
  reason: 'sent' | 'no_active_channels' | 'no_recipients' | 'already_sent';
}

async function dispatchItem(
  item: DispatchItem,
  provider: EmailProvider,
  appUrl: string
): Promise<DispatchItemResult> {
  const htmlBody = await resolveNewsletterHtml(item, appUrl);

  // Les canaux sociaux (Pages Facebook) ne sont pas des destinataires email :
  // ils sont traités par social.service.ts, jamais ici.
  const channels = await db.distributionChannel.findMany({
    where: { id: { in: item.channelIds }, isActive: true, type: { not: 'social' } },
  });
  if (channels.length === 0) {
    return { recipients: 0, reason: 'no_active_channels' };
  }

  const subscriptions = await db.subscription.findMany({
    where: { channelId: { in: channels.map((c) => c.id) } },
    include: { subscriber: true },
  });
  const recipients = resolveRecipients(
    channels.map((c) => c.id),
    subscriptions.map((s) => ({
      id: s.subscriber.id,
      email: s.subscriber.email,
      status: s.status,
      channelId: s.channelId,
    })) as unknown as RecipientLike[]
  );
  if (recipients.length === 0) {
    return { recipients: 0, reason: 'no_recipients' };
  }

  const alreadySent = await db.newsletterSend.count({ where: { contentId: item.id } });
  if (alreadySent > 0) {
    return { recipients: 0, reason: 'already_sent' };
  }

  const created = await db.$transaction(async (tx) => {
    const sends = await Promise.all(
      recipients.map((recipient) =>
        tx.newsletterSend.create({
          data: {
            contentId: item.id,
            subscriberId: recipient.id,
            channelId: recipient.channelId,
            status: 'sent',
          },
        })
      )
    );
    const existing = await tx.content.findUnique({
      where: { id: item.id },
      select: { metadata: true },
    });
    const meta =
      existing?.metadata && typeof existing.metadata === 'object'
        ? (existing.metadata as Record<string, unknown>)
        : {};
    const rates = computeRates(sends);
    await tx.content.update({
      where: { id: item.id },
      data: {
        status: 'published',
        publishedAt: new Date(),
        metadata: {
          ...meta,
          recipientCount: rates.recipientCount,
          openRate: rates.openRate,
          clickRate: rates.clickRate,
        },
      },
    });
    await tx.distributionChannel.updateMany({
      where: { id: { in: channels.map((c) => c.id) } },
      data: { lastSentAt: new Date(), subscriberCount: recipients.length },
    });
    return sends;
  });

  const sendErrors: { email: string; reason: string }[] = [];
  for (let i = 0; i < created.length; i += 1) {
    const send = created[i];
    const recipient = recipients[i];
    try {
      await provider.send({
        to: recipient.email,
        subject: item.subject,
        html: buildOutboundHtml(htmlBody, item, send.id, appUrl),
        meta: { sendId: send.id },
      });
    } catch (error) {
      sendErrors.push({
        email: recipient.email,
        reason: error instanceof Error ? error.message : String(error),
      });
      console.error(`[newsletter] failed to send "${item.id}" to ${recipient.email}:`, error);
    }
  }

  if (sendErrors.length > 0) {
    console.warn(
      `[newsletter] "${item.id}" dispatched ${recipients.length - sendErrors.length}/${recipients.length} email(s); ` +
        `${sendErrors.length} failure(s): ${sendErrors.map((e) => `${e.email} (${e.reason})`).join(', ')}`
    );
  }

  return { recipients: recipients.length, reason: 'sent' };
}

export async function sendNewsletterById(
  contentId: string,
  opts: { provider?: EmailProvider } = {}
): Promise<{ recipients: number; reason?: string; channelIds: string[] }> {
  const provider = opts.provider ?? getEmailProvider();
  const appUrl = (process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001').replace(/\/$/, '');

  const content = await db.content.findUnique({ where: { id: contentId } });
  if (!content || content.type !== 'newsletter') {
    return { recipients: 0, reason: 'not_newsletter', channelIds: [] };
  }

  const meta = (content.metadata && typeof content.metadata === 'object'
    ? (content.metadata as Record<string, unknown>)
    : {}) as Record<string, unknown>;
  const channelIds = Array.isArray(meta.channelIds) ? (meta.channelIds as string[]) : [];

  if (channelIds.length === 0) {
    return { recipients: 0, reason: 'no_channels_in_metadata', channelIds };
  }

  const item: DispatchItem = {
    id: content.id,
    subject: resolveEmailSubject(meta.emailSubject, content.title),
    body: content.body ?? '',
    templateId: typeof meta.templateId === 'string' ? meta.templateId : null,
    headerTitle: content.title ?? '',
    headerSubtitle: deriveSubtitle(content.body ?? ''),
    channelIds,
  };

  const result = await dispatchItem(item, provider, appUrl);
  return { recipients: result.recipients, reason: result.reason, channelIds };
}
