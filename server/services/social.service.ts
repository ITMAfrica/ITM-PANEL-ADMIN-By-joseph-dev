import type { Prisma } from '@prisma/client';
import { db } from '../lib/prisma';
import { decryptSecret } from '../lib/crypto';
import { getMetaProvider, type MetaProvider } from '../lib/meta/provider';

/**
 * Publication des contenus `social` sur les Pages Facebook connectées.
 *
 * Contrat metadata du Content :
 * - lecture  : `metadata.channelIds` (DistributionChannel de type 'social')
 * - écriture : `metadata.facebook[channelId] = { postId, publishedAt }` (idempotence)
 *              `metadata.socialPublish = { published, failures, lastAttemptAt }`
 *
 * Les canaux sont systématiquement filtrés par `tenantId` du contenu : un
 * channelId d'un autre tenant est ignoré (isolation multi-tenant).
 */

const RETRY_THROTTLE_MS = 60 * 60 * 1000; // 1 h entre deux tentatives sur un même contenu
const IMAGE_MD_RE = /!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/;

export function extractFirstImageUrl(body: string): string | null {
  const match = IMAGE_MD_RE.exec(body);
  return match ? match[1] : null;
}

export function stripMediaMarkdown(body: string): string {
  return body
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

interface SocialContentLike {
  id: string;
  tenantId: string;
  title: string | null;
  body: string | null;
  status: string;
  scheduledAt: Date | null;
  metadata: unknown;
}

interface FacebookPublishEntry {
  postId?: string;
  publishedAt?: string;
}

export interface SocialPublishFailure {
  channelId: string;
  reason: string;
}

export interface SocialPublishResult {
  reason: 'published' | 'no_channels' | 'already_published' | 'throttled' | 'failed';
  published: number;
  failures: SocialPublishFailure[];
}

function readMetadata(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === 'object' && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
}

export async function publishContentToSocial(
  content: SocialContentLike,
  provider: MetaProvider,
  now: Date = new Date()
): Promise<SocialPublishResult> {
  const meta = readMetadata(content.metadata);
  const channelIds = Array.isArray(meta.channelIds) ? (meta.channelIds as string[]) : [];
  if (channelIds.length === 0) {
    return { reason: 'no_channels', published: 0, failures: [] };
  }

  const channels = await db.distributionChannel.findMany({
    where: {
      id: { in: channelIds },
      tenantId: content.tenantId,
      type: 'social',
      isActive: true,
    },
    include: { socialConnection: true },
  });
  if (channels.length === 0) {
    return { reason: 'no_channels', published: 0, failures: [] };
  }

  const facebookMeta =
    meta.facebook && typeof meta.facebook === 'object' && !Array.isArray(meta.facebook)
      ? { ...(meta.facebook as Record<string, FacebookPublishEntry>) }
      : {};
  const socialPublish =
    meta.socialPublish && typeof meta.socialPublish === 'object' && !Array.isArray(meta.socialPublish)
      ? (meta.socialPublish as { lastAttemptAt?: string })
      : {};

  // Throttle : après une tentative, on n'en refait pas avant RETRY_THROTTLE_MS
  // (évite de marteler l'API Meta sur un token invalide).
  if (
    socialPublish.lastAttemptAt &&
    now.getTime() - Date.parse(socialPublish.lastAttemptAt) < RETRY_THROTTLE_MS
  ) {
    return { reason: 'throttled', published: 0, failures: [] };
  }

  const pending = channels.filter((c) => !facebookMeta[c.id]?.postId);
  if (pending.length === 0) {
    return { reason: 'already_published', published: 0, failures: [] };
  }

  const body = content.body ?? '';
  const message = stripMediaMarkdown(body) || (content.title ?? '');
  const imageUrl = extractFirstImageUrl(body);

  let published = 0;
  const failures: SocialPublishFailure[] = [];
  const publishedChannelIds: string[] = [];

  for (const channel of pending) {
    const connection = channel.socialConnection;
    if (!connection || connection.status !== 'connected') {
      failures.push({ channelId: channel.id, reason: 'not_connected' });
      continue;
    }
    try {
      const result = await provider.publishToPage({
        pageId: connection.pageId,
        pageAccessToken: decryptSecret(connection.pageAccessToken),
        message,
        imageUrl,
      });
      facebookMeta[channel.id] = { postId: result.id, publishedAt: now.toISOString() };
      published += 1;
      publishedChannelIds.push(channel.id);
      await db.socialConnection.update({
        where: { id: connection.id },
        data: { lastPublishAt: now, lastError: null },
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      failures.push({ channelId: channel.id, reason });
      console.error(`[social] publish failed for "${content.id}" on channel ${channel.id}:`, error);
      await db.socialConnection.update({
        where: { id: connection.id },
        data: { lastError: reason.slice(0, 500) },
      });
    }
  }

  await db.$transaction(async (tx) => {
    const existing = await tx.content.findUnique({
      where: { id: content.id },
      select: { metadata: true, status: true },
    });
    const currentMeta = readMetadata(existing?.metadata);
    await tx.content.update({
      where: { id: content.id },
      data: {
        ...(published > 0 && existing?.status !== 'published'
          ? { status: 'published', publishedAt: now }
          : {}),
        metadata: {
          ...currentMeta,
          facebook: facebookMeta,
          socialPublish: {
            published,
            failures,
            lastAttemptAt: now.toISOString(),
          },
        } as unknown as Prisma.InputJsonValue,
      },
    });
    await tx.contentEvent.create({
      data: {
        contentId: content.id,
        siteSlug: 'facebook',
        eventType: published > 0 ? 'facebook_published' : 'facebook_failed',
      },
    });
    if (publishedChannelIds.length > 0) {
      await tx.distributionChannel.updateMany({
        where: { id: { in: publishedChannelIds } },
        data: { lastSentAt: now },
      });
    }
  });

  return {
    reason: published > 0 ? 'published' : 'failed',
    published,
    failures,
  };
}

export async function publishSocialById(
  contentId: string,
  opts: { provider?: MetaProvider } = {}
): Promise<SocialPublishResult> {
  const content = await db.content.findUnique({ where: { id: contentId } });
  if (!content || content.type !== 'social') {
    return { reason: 'no_channels', published: 0, failures: [] };
  }
  return publishContentToSocial(content, opts.provider ?? getMetaProvider());
}

export interface SocialDispatchResult {
  dispatched: number;
  skipped: number;
  errors: { id: string; reason: string }[];
}

export async function dispatchDueSocial(
  opts: { now?: Date; provider?: MetaProvider } = {}
): Promise<SocialDispatchResult> {
  const now = opts.now ?? new Date();
  const provider = opts.provider ?? getMetaProvider();

  const contents = await db.content.findMany({
    where: {
      type: 'social',
      status: { in: ['scheduled', 'approved', 'published'] },
      scheduledAt: { lte: now },
    },
    orderBy: { scheduledAt: 'asc' },
  });

  let dispatched = 0;
  let skipped = 0;
  const errors: { id: string; reason: string }[] = [];

  for (const content of contents) {
    try {
      const result = await publishContentToSocial(content, provider, now);
      if (result.reason === 'published') {
        dispatched += 1;
      } else {
        skipped += 1;
      }
      if (result.failures.length > 0) {
        errors.push({
          id: content.id,
          reason: result.failures.map((f) => `${f.channelId}: ${f.reason}`).join('; '),
        });
      }
    } catch (error) {
      errors.push({ id: content.id, reason: error instanceof Error ? error.message : String(error) });
      console.error(`[social] dispatch failed for "${content.id}":`, error);
    }
  }

  return { dispatched, skipped, errors };
}
