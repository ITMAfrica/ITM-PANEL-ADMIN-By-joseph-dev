import type { ContentPriority, ContentStatus, ContentType, Prisma } from '@prisma/client';
import { db } from '../lib/prisma';
import { parseMetadata, parseTags } from './mappers/json';

export interface PublicContentItem {
  id: string;
  type: string;
  title: string;
  excerpt: string;
  body: string;
  tenantId: string;
  tags: string[];
  viewCount: number;
  clickCount: number;
  clickRate: number;
  openRate: number;
  publishedAt: string | null;
  metadata: Record<string, unknown>;
}

function toPublicContent(content: {
  id: string;
  type: string;
  title: string;
  excerpt: string;
  body: string;
  tenantId: string;
  tags: unknown;
  viewCount: number;
  clickCount: number;
  publishedAt: Date | null;
  metadata: unknown;
}): PublicContentItem {
  const meta = parseMetadata(content.metadata);
  const openRate = typeof meta.openRate === 'number' ? meta.openRate : 0;
  const clickRate =
    content.viewCount > 0
      ? Math.round((content.clickCount / content.viewCount) * 1000) / 10
      : 0;

  return {
    id: content.id,
    type: content.type,
    title: content.title,
    excerpt: content.excerpt,
    body: content.body,
    tenantId: content.tenantId,
    tags: parseTags(content.tags),
    viewCount: content.viewCount,
    clickCount: content.clickCount,
    clickRate,
    openRate,
    publishedAt: content.publishedAt?.toISOString() ?? null,
    metadata: meta,
  };
}

export async function getPublishedContent(siteSlug: string, type?: string) {
  const site = await db.site.findUnique({ where: { slug: siteSlug } });
  if (!site) return [];

  const contents = await db.content.findMany({
    where: {
      siteId: site.id,
      status: 'published',
      ...(type ? { type: type as ContentType } : {}),
    },
    orderBy: { publishedAt: 'desc' },
  });

  return contents.map(toPublicContent);
}

export async function getContentById(id: string) {
  const content = await db.content.findUnique({ where: { id } });
  if (!content || content.status !== 'published') return null;
  return toPublicContent(content);
}

export async function getApprovedContent(tenantId: string) {
  return db.content.findMany({
    where: { tenantId, status: 'approved' },
    orderBy: { updatedAt: 'desc' },
    include: { site: true },
  });
}

export async function getRecentlyPublished(tenantId: string, limit = 5) {
  return db.content.findMany({
    where: { tenantId, status: 'published' },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    include: { site: true },
  });
}

export async function publishContent(id: string) {
  const content = await db.content.findUnique({ where: { id } });
  if (!content) return null;
  if (content.status !== 'approved' && content.status !== 'scheduled') {
    return null;
  }

  return db.content.update({
    where: { id },
    data: {
      status: 'published',
      publishedAt: new Date(),
    },
    include: { site: true },
  });
}

export async function trackView(contentId: string, siteSlug: string) {
  const site = await db.site.findUnique({ where: { slug: siteSlug } });
  if (!site) return null;

  const content = await db.content.findFirst({
    where: { id: contentId, siteId: site.id, status: 'published' },
  });
  if (!content) return null;

  const [updated] = await db.$transaction([
    db.content.update({
      where: { id: contentId },
      data: { viewCount: { increment: 1 } },
    }),
    db.contentEvent.create({
      data: {
        contentId,
        siteSlug,
        eventType: 'view',
      },
    }),
  ]);

  return toPublicContent(updated);
}

export async function trackClick(contentId: string, siteSlug: string, linkUrl?: string) {
  const site = await db.site.findUnique({ where: { slug: siteSlug } });
  if (!site) return null;

  const content = await db.content.findFirst({
    where: { id: contentId, siteId: site.id, status: 'published' },
  });
  if (!content) return null;

  const [updated] = await db.$transaction([
    db.content.update({
      where: { id: contentId },
      data: { clickCount: { increment: 1 } },
    }),
    db.contentEvent.create({
      data: {
        contentId,
        siteSlug,
        eventType: 'click',
        linkUrl: linkUrl || null,
      },
    }),
  ]);

  return toPublicContent(updated);
}

export async function getStatsByTenant(tenantId: string) {
  const contents = await db.content.findMany({
    where: { tenantId },
    select: {
      type: true,
      viewCount: true,
      clickCount: true,
      status: true,
      metadata: true,
    },
  });

  const published = contents.filter((c) => c.status === 'published');
  const totalViews = published.reduce((sum, c) => sum + c.viewCount, 0);
  const totalClicks = published.reduce((sum, c) => sum + c.clickCount, 0);
  const avgClickRate =
    totalViews > 0 ? Math.round((totalClicks / totalViews) * 1000) / 10 : 0;

  const openRates = published
    .filter((c) => c.type === 'newsletter')
    .map((c) => parseMetadata(c.metadata).openRate)
    .filter((r): r is number => typeof r === 'number' && r > 0);
  const avgOpenRate =
    openRates.length > 0
      ? Math.round((openRates.reduce((a, b) => a + b, 0) / openRates.length) * 10) / 10
      : 0;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEvents = await db.contentEvent.findMany({
    where: {
      createdAt: { gte: todayStart },
      content: { tenantId },
    },
    select: { eventType: true },
  });

  const viewsToday = todayEvents.filter((e) => e.eventType === 'view').length;
  const clicksToday = todayEvents.filter((e) => e.eventType === 'click').length;

  return {
    totalViews,
    totalClicks,
    avgClickRate,
    avgOpenRate,
    publishedCount: published.length,
    viewsToday,
    clicksToday,
  };
}

export interface ListContentFilters {
  tenantId: string;
  type?: string;
  status?: string;
  search?: string;
}

export async function listContent(filters: ListContentFilters) {
  const { tenantId, type, status, search } = filters;
  return db.content.findMany({
    where: {
      tenantId,
      ...(type ? { type: type as ContentType } : {}),
      ...(status ? { status: status as ContentStatus } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' as const } },
              { excerpt: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: 'desc' },
    include: { site: true },
  });
}

export interface CreateContentInput {
  id?: string;
  type: string;
  title: string;
  excerpt?: string;
  body?: string;
  tenantId: string;
  siteId: string;
  authorId?: string;
  status?: string;
  priority?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  scheduledAt?: Date | null;
}

export async function createContent(input: CreateContentInput) {
  const id = input.id ?? `cnt-${Date.now()}`;
  const requestedStatus = (input.status ?? 'draft') as ContentStatus;
  const publishedAt = requestedStatus === 'published' ? new Date() : null;

  return db.content.create({
    data: {
      id,
      type: input.type as ContentType,
      title: input.title,
      excerpt: input.excerpt ?? '',
      body: input.body ?? '',
      tenantId: input.tenantId,
      siteId: input.siteId,
      authorId: input.authorId ?? null,
      status: requestedStatus,
      priority: (input.priority ?? 'medium') as ContentPriority,
      tags: (input.tags ?? []) as Prisma.InputJsonValue,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      scheduledAt: input.scheduledAt ?? null,
      publishedAt,
    },
    include: { site: true },
  });
}

export interface UpdateContentInput {
  title?: string;
  excerpt?: string;
  body?: string;
  status?: string;
  priority?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  scheduledAt?: Date | null;
  publishedAt?: Date | null;
}

export async function updateContent(id: string, input: UpdateContentInput) {
  const existing = await db.content.findUnique({ where: { id } });
  if (!existing) return null;

  const data: Prisma.ContentUpdateInput = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.excerpt !== undefined) data.excerpt = input.excerpt;
  if (input.body !== undefined) data.body = input.body;
  if (input.status !== undefined) data.status = input.status as ContentStatus;
  if (input.priority !== undefined) data.priority = input.priority as ContentPriority;
  if (input.tags !== undefined) data.tags = input.tags as Prisma.InputJsonValue;
  if (input.metadata !== undefined) data.metadata = input.metadata as Prisma.InputJsonValue;
  if (input.scheduledAt !== undefined) data.scheduledAt = input.scheduledAt;
  if (input.publishedAt !== undefined) data.publishedAt = input.publishedAt;
  if (input.status === 'published' && !existing.publishedAt) {
    data.publishedAt = new Date();
  }

  return db.content.update({
    where: { id },
    data,
    include: { site: true },
  });
}

export async function deleteContent(id: string) {
  const existing = await db.content.findUnique({ where: { id } });
  if (!existing) return false;
  await db.contentEvent.deleteMany({ where: { contentId: id } });
  await db.content.delete({ where: { id } });
  return true;
}

export async function getContentByIdAdmin(id: string) {
  return db.content.findUnique({
    where: { id },
    include: { site: true },
  });
}

export async function approveContent(id: string) {
  const existing = await db.content.findUnique({ where: { id } });
  if (!existing || existing.status !== 'review') return null;

  return db.content.update({
    where: { id },
    data: { status: 'approved' },
    include: { site: true },
  });
}

export async function rejectContent(id: string, reason?: string) {
  const existing = await db.content.findUnique({ where: { id } });
  if (!existing || existing.status !== 'review') return null;

  const meta = parseMetadata(existing.metadata);
  if (reason) {
    meta.rejectionReason = reason;
  }

  return db.content.update({
    where: { id },
    data: {
      status: 'draft',
      metadata: meta as Prisma.InputJsonValue,
    },
    include: { site: true },
  });
}

export async function submitContentForReview(id: string) {
  const existing = await db.content.findUnique({ where: { id } });
  if (!existing || existing.status !== 'draft') return null;

  return db.content.update({
    where: { id },
    data: { status: 'review' },
    include: { site: true },
  });
}

export async function getDefaultSiteForTenant(tenantId: string) {
  return db.site.findFirst({
    where: { tenantId, status: 'active' },
    orderBy: { createdAt: 'asc' },
  });
}

/** Ensures content can be created even when no external site is connected yet. */
export async function getOrCreateDefaultSiteForTenant(tenantId: string) {
  const active = await getDefaultSiteForTenant(tenantId);
  if (active) return active;

  const existing = await db.site.findFirst({
    where: { tenantId },
    orderBy: { createdAt: 'asc' },
  });
  if (existing) {
    if (existing.status === 'active') return existing;
    return db.site.update({
      where: { id: existing.id },
      data: { status: 'active' },
    });
  }

  const slug = `panel-${tenantId.replace(/[^a-z0-9]/gi, '').slice(0, 8)}-${Date.now()}`;
  return db.site.create({
    data: {
      slug,
      name: 'Panel',
      url: '',
      tenantId,
      status: 'active',
    },
  });
}
