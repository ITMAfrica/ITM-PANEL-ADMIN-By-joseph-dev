import { db } from '../lib/prisma';
import { decryptSecret } from '../lib/crypto';
import { getMetaProvider, type MetaComment, type MetaProvider } from '../lib/meta/provider';

/**
 * Synchronisation de la boîte de réception sociale : remonte les commentaires
 * des posts publiés via le panel (metadata.facebook[channelId].postId) vers
 * SocialConversation / SocialMessage.
 *
 * - Dédoublonnage par (conversationId, externalId) : relances et chevauchements
 *   scheduler + synchro manuelle sont sans danger.
 * - Throttle par connexion (lastInboxSyncAt) pour ne pas marteler la Graph API ;
 *   la synchro manuelle (force) l'ignore.
 * - Un échec sur une connexion n'interrompt pas les autres.
 */

const SYNC_THROTTLE_MS = 5 * 60 * 1000; // 5 min entre deux synchros automatiques
const PREVIEW_MAX_LENGTH = 140;

export interface InboxSyncResult {
  connections: number;
  posts: number;
  newConversations: number;
  newMessages: number;
  errors: { connectionId: string; reason: string }[];
}

function truncate(text: string): string {
  return text.length > PREVIEW_MAX_LENGTH ? `${text.slice(0, PREVIEW_MAX_LENGTH - 1)}…` : text;
}

/** Posts publiés via le panel pour les canaux d'une connexion donnée. */
async function collectPostsForConnection(
  tenantId: string,
  channelIds: string[]
): Promise<{ contentId: string; postId: string }[]> {
  if (channelIds.length === 0) return [];
  const contents = await db.content.findMany({
    where: { tenantId, type: 'social', status: 'published' },
    select: { id: true, metadata: true },
  });
  const posts: { contentId: string; postId: string }[] = [];
  for (const content of contents) {
    const meta =
      content.metadata && typeof content.metadata === 'object'
        ? (content.metadata as Record<string, unknown>)
        : {};
    const facebook =
      meta.facebook && typeof meta.facebook === 'object' && !Array.isArray(meta.facebook)
        ? (meta.facebook as Record<string, { postId?: unknown }>)
        : {};
    for (const channelId of channelIds) {
      const postId = facebook[channelId]?.postId;
      if (typeof postId === 'string' && postId) {
        posts.push({ contentId: content.id, postId });
      }
    }
  }
  return posts;
}

interface ConnectionLike {
  id: string;
  tenantId: string;
  platform: string;
  pageId: string;
}

async function upsertThread(
  connection: ConnectionLike,
  post: { contentId: string; postId: string },
  comment: MetaComment
): Promise<{ newConversation: boolean; newMessages: number }> {
  const existing = await db.socialConversation.findUnique({
    where: {
      connectionId_externalThreadId: {
        connectionId: connection.id,
        externalThreadId: comment.id,
      },
    },
  });

  let conversationId: string;
  let newConversation = false;
  if (!existing) {
    const created = await db.socialConversation.create({
      data: {
        tenantId: connection.tenantId,
        connectionId: connection.id,
        platform: connection.platform,
        externalThreadId: comment.id,
        externalPostId: post.postId,
        contentId: post.contentId,
        authorName: comment.authorName,
        authorExternalId: comment.authorId,
        preview: truncate(comment.message),
        lastMessageAt: new Date(comment.createdTime),
      },
    });
    conversationId = created.id;
    newConversation = true;
  } else {
    conversationId = existing.id;
  }

  const allMessages = [comment, ...comment.replies];
  const known = await db.socialMessage.findMany({
    where: { conversationId, externalId: { in: allMessages.map((m) => m.id) } },
    select: { externalId: true },
  });
  const knownIds = new Set(known.map((k) => k.externalId));
  const fresh = allMessages.filter((m) => !knownIds.has(m.id));

  if (fresh.length > 0) {
    await db.socialMessage.createMany({
      data: fresh.map((m) => ({
        conversationId,
        externalId: m.id,
        direction: m.authorId === connection.pageId ? 'outbound' : 'inbound',
        authorName: m.authorName,
        authorExternalId: m.authorId,
        body: m.message,
        publishedAt: new Date(m.createdTime),
      })),
    });
  }

  const hasNewInbound = fresh.some((m) => m.authorId !== connection.pageId);
  const latest = allMessages.reduce((a, b) =>
    Date.parse(a.createdTime) >= Date.parse(b.createdTime) ? a : b
  );
  await db.socialConversation.update({
    where: { id: conversationId },
    data: {
      preview: truncate(latest.message),
      lastMessageAt: new Date(latest.createdTime),
      ...(hasNewInbound ? { unread: true } : {}),
    },
  });

  return { newConversation, newMessages: fresh.length };
}

export async function syncConnectionInbox(
  connectionId: string,
  opts: { provider?: MetaProvider; force?: boolean; now?: Date } = {}
): Promise<InboxSyncResult> {
  const provider = opts.provider ?? getMetaProvider();
  const now = opts.now ?? new Date();
  const result: InboxSyncResult = {
    connections: 0,
    posts: 0,
    newConversations: 0,
    newMessages: 0,
    errors: [],
  };

  const connection = await db.socialConnection.findUnique({
    where: { id: connectionId },
    include: { channels: { select: { id: true } } },
  });
  if (!connection || connection.status !== 'connected') {
    return result;
  }
  if (
    !opts.force &&
    connection.lastInboxSyncAt &&
    now.getTime() - connection.lastInboxSyncAt.getTime() < SYNC_THROTTLE_MS
  ) {
    return result;
  }

  result.connections = 1;
  try {
    const token = decryptSecret(connection.pageAccessToken);
    const posts = await collectPostsForConnection(
      connection.tenantId,
      connection.channels.map((c) => c.id)
    );
    for (const post of posts) {
      const comments = await provider.listPostComments({
        pageId: connection.pageId,
        pageAccessToken: token,
        postId: post.postId,
      });
      result.posts += 1;
      for (const comment of comments) {
        // Les commentaires racine émis par notre propre Page ne sont pas des fils.
        if (comment.authorId === connection.pageId) continue;
        const upserted = await upsertThread(connection, post, comment);
        if (upserted.newConversation) result.newConversations += 1;
        result.newMessages += upserted.newMessages;
      }
    }
    await db.socialConnection.update({
      where: { id: connection.id },
      data: { lastInboxSyncAt: now, lastError: null },
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    result.errors.push({ connectionId: connection.id, reason });
    console.error(`[inbox] sync failed for connection ${connection.id}:`, error);
    await db.socialConnection.update({
      where: { id: connection.id },
      data: { lastError: reason.slice(0, 500) },
    });
  }
  return result;
}

export async function syncTenantInboxes(
  tenantId: string,
  opts: { provider?: MetaProvider; force?: boolean } = {}
): Promise<InboxSyncResult> {
  const connections = await db.socialConnection.findMany({
    where: { tenantId, status: 'connected' },
    select: { id: true },
  });
  const total: InboxSyncResult = {
    connections: 0,
    posts: 0,
    newConversations: 0,
    newMessages: 0,
    errors: [],
  };
  for (const connection of connections) {
    const result = await syncConnectionInbox(connection.id, opts);
    total.connections += result.connections;
    total.posts += result.posts;
    total.newConversations += result.newConversations;
    total.newMessages += result.newMessages;
    total.errors.push(...result.errors);
  }
  return total;
}

/** Appelé par le scheduler : toutes les connexions actives, avec throttle. */
export async function syncAllInboxes(
  opts: { provider?: MetaProvider } = {}
): Promise<InboxSyncResult> {
  const connections = await db.socialConnection.findMany({
    where: { status: 'connected' },
    select: { id: true },
  });
  const total: InboxSyncResult = {
    connections: 0,
    posts: 0,
    newConversations: 0,
    newMessages: 0,
    errors: [],
  };
  for (const connection of connections) {
    const result = await syncConnectionInbox(connection.id, opts);
    total.connections += result.connections;
    total.posts += result.posts;
    total.newConversations += result.newConversations;
    total.newMessages += result.newMessages;
    total.errors.push(...result.errors);
  }
  return total;
}
