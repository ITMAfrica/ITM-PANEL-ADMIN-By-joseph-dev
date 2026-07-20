import { db } from '../lib/prisma';
import { decryptSecret } from '../lib/crypto';
import { getMetaProvider, type MetaProvider } from '../lib/meta/provider';

/**
 * Lecture et actions sur la boîte de réception sociale.
 * Mapping public : aucun secret ne remonte (pageAccessToken exclu partout).
 */

export interface ConversationFilters {
  status?: 'unresolved' | 'resolved';
  platform?: string;
  unread?: boolean;
}

export async function listConversations(tenantId: string, filters: ConversationFilters = {}) {
  const rows = await db.socialConversation.findMany({
    where: {
      tenantId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.platform ? { platform: filters.platform } : {}),
      ...(filters.unread !== undefined ? { unread: filters.unread } : {}),
    },
    include: { connection: { select: { pageName: true, pageId: true } } },
    orderBy: { lastMessageAt: 'desc' },
  });
  return rows.map((row) => ({
    id: row.id,
    platform: row.platform,
    authorName: row.authorName,
    authorAvatarUrl: null as string | null, // non fourni par la Graph API v1
    preview: row.preview,
    status: row.status,
    unread: row.unread,
    lastMessageAt: row.lastMessageAt.toISOString(),
    externalPostId: row.externalPostId,
    contentId: row.contentId,
    pageName: row.connection.pageName,
  }));
}

async function getTenantConversation(tenantId: string, conversationId: string) {
  return db.socialConversation.findFirst({
    where: { id: conversationId, tenantId },
    include: { connection: true },
  });
}

export async function listMessages(tenantId: string, conversationId: string) {
  const conversation = await getTenantConversation(tenantId, conversationId);
  if (!conversation) return null;
  const rows = await db.socialMessage.findMany({
    where: { conversationId: conversation.id },
    orderBy: { publishedAt: 'asc' },
  });
  return rows.map((row) => ({
    id: row.id,
    direction: row.direction,
    authorName: row.authorName,
    body: row.body,
    publishedAt: row.publishedAt.toISOString(),
  }));
}

export async function updateConversation(
  tenantId: string,
  conversationId: string,
  patch: { status?: 'unresolved' | 'resolved'; unread?: boolean }
) {
  const conversation = await getTenantConversation(tenantId, conversationId);
  if (!conversation) return null;
  const row = await db.socialConversation.update({
    where: { id: conversation.id },
    data: {
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.unread !== undefined ? { unread: patch.unread } : {}),
    },
  });
  return { id: row.id, status: row.status, unread: row.unread };
}

export interface ReplyResult {
  id: string;
  direction: string;
  authorName: string;
  body: string;
  publishedAt: string;
}

export async function replyToConversation(
  tenantId: string,
  conversationId: string,
  message: string,
  opts: { provider?: MetaProvider } = {}
): Promise<ReplyResult | null> {
  const conversation = await getTenantConversation(tenantId, conversationId);
  if (!conversation) return null;
  if (conversation.connection.status !== 'connected') {
    throw new Error('connection_not_active');
  }

  const provider = opts.provider ?? getMetaProvider();
  const result = await provider.replyToComment({
    pageAccessToken: decryptSecret(conversation.connection.pageAccessToken),
    commentId: conversation.externalThreadId,
    message,
  });

  const now = new Date();
  const row = await db.$transaction(async (tx) => {
    const created = await tx.socialMessage.create({
      data: {
        conversationId: conversation.id,
        externalId: result.id,
        direction: 'outbound',
        authorName: conversation.connection.pageName,
        authorExternalId: conversation.connection.pageId,
        body: message,
        publishedAt: now,
      },
    });
    await tx.socialConversation.update({
      where: { id: conversation.id },
      data: { preview: message.slice(0, 140), lastMessageAt: now, unread: false },
    });
    await tx.socialConnection.update({
      where: { id: conversation.connectionId },
      data: { lastError: null },
    });
    return created;
  });

  return {
    id: row.id,
    direction: row.direction,
    authorName: row.authorName,
    body: row.body,
    publishedAt: row.publishedAt.toISOString(),
  };
}
