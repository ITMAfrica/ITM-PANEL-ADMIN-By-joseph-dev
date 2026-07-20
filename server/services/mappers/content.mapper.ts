import { deriveExcerpt } from '../../lib/excerpt';
import { parseMetadata, parseTags } from './json';

type ContentStatus = 'draft' | 'review' | 'approved' | 'scheduled' | 'published' | 'archived';
type ContentType = 'newsletter' | 'article' | 'announcement' | 'communique' | 'campaign';
type ContentPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  excerpt: string;
  status: ContentStatus;
  priority: ContentPriority;
  authorId: string;
  tenantId: string;
  tags: string[];
  featuredImage?: string;
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  openRate?: number;
  clickRate?: number;
}

export interface Newsletter extends ContentItem {
  type: 'newsletter';
  subject: string;
  recipientCount: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  channelIds: string[];
}

export interface Article extends ContentItem {
  type: 'article';
  category: string;
  readingTime: number;
  commentCount: number;
  likeCount: number;
  shareCount: number;
}

export interface Announcement extends ContentItem {
  type: 'announcement';
  urgency: 'info' | 'warning' | 'critical';
  category: string;
  targetAudience: 'all' | 'tenant' | 'role';
  acknowledgedCount: number;
  totalRecipients: number;
}

type DbContent = {
  id: string;
  type: string;
  status: string;
  title: string;
  body: string;
  tenantId: string;
  authorId: string | null;
  priority: string;
  tags: unknown;
  metadata: unknown;
  viewCount: number;
  clickCount: number;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function baseContent(row: DbContent): ContentItem {
  const meta = parseMetadata(row.metadata);
  const openRate = typeof meta.openRate === 'number' ? meta.openRate : undefined;
  const clickRate =
    row.viewCount > 0
      ? Math.round((row.clickCount / row.viewCount) * 1000) / 10
      : undefined;

  return {
    id: row.id,
    type: row.type as ContentType,
    title: row.title,
    excerpt: deriveExcerpt(row.body),
    status: row.status as ContentStatus,
    priority: row.priority as ContentPriority,
    authorId: row.authorId ?? '',
    tenantId: row.tenantId,
    tags: parseTags(row.tags),
    featuredImage: typeof meta.featuredImage === 'string' ? meta.featuredImage : undefined,
    scheduledAt: row.scheduledAt?.toISOString(),
    publishedAt: row.publishedAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    viewCount: row.viewCount,
    openRate,
    clickRate,
  };
}

export function toNewsletter(row: DbContent): Newsletter {
  const meta = parseMetadata(row.metadata);
  const base = baseContent(row);
  const metaOpenRate = typeof meta.openRate === 'number' ? meta.openRate : undefined;
  const metaClickRate = typeof meta.clickRate === 'number' ? meta.clickRate : undefined;
  return {
    ...base,
    type: 'newsletter',
    subject: (meta.subject as string) ?? row.title,
    recipientCount: (meta.recipientCount as number) ?? 0,
    openRate: metaOpenRate ?? base.openRate ?? 0,
    clickRate: metaClickRate ?? base.clickRate ?? 0,
    bounceRate: (meta.bounceRate as number) ?? 0,
    unsubscribeRate: (meta.unsubscribeRate as number) ?? 0,
    channelIds: (meta.channelIds as string[]) ?? [],
  };
}

export function toArticle(row: DbContent): Article {
  const meta = parseMetadata(row.metadata);
  const base = baseContent(row);
  return {
    ...base,
    type: 'article',
    category: (meta.category as string) ?? 'General',
    readingTime: (meta.readingTime as number) ?? 5,
    commentCount: (meta.commentCount as number) ?? 0,
    likeCount: (meta.likeCount as number) ?? 0,
    shareCount: (meta.shareCount as number) ?? 0,
  };
}

export function toAnnouncement(row: DbContent): Announcement {
  const meta = parseMetadata(row.metadata);
  const base = baseContent(row);
  return {
    ...base,
    type: 'announcement',
    urgency: (meta.urgency as Announcement['urgency']) ?? 'info',
    category: (meta.category as string) ?? '',
    targetAudience: (meta.targetAudience as Announcement['targetAudience']) ?? 'all',
    acknowledgedCount: (meta.acknowledgedCount as number) ?? 0,
    totalRecipients: (meta.totalRecipients as number) ?? 0,
  };
}

export function mapContent(row: DbContent): ContentItem | Newsletter | Article | Announcement {
  switch (row.type) {
    case 'newsletter':
      return toNewsletter(row);
    case 'article':
      return toArticle(row);
    case 'announcement':
      return toAnnouncement(row);
    default:
      return baseContent(row);
  }
}

export type ContentDetail = ReturnType<typeof mapContentDetail>;

export function mapContentDetail(row: DbContent) {
  const meta = parseMetadata(row.metadata);
  return {
    ...mapContent(row),
    body: row.body,
    metadata: meta,
  };
}

export function toApprovedContentItem(row: DbContent) {
  const meta = parseMetadata(row.metadata);
  const siteClickRate =
    row.viewCount > 0 ? Math.round((row.clickCount / row.viewCount) * 1000) / 10 : 0;
  const clickRate =
    row.type === 'newsletter' && typeof meta.clickRate === 'number'
      ? meta.clickRate
      : siteClickRate;
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    excerpt: deriveExcerpt(row.body),
    status: row.status,
    priority: row.priority,
    authorId: row.authorId || (meta.authorId as string) || 'u-1',
    tenantId: row.tenantId,
    tags: parseTags(row.tags),
    publishedAt: row.publishedAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    viewCount: row.viewCount,
    openRate: (meta.openRate as number) || 0,
    clickRate,
    channelIds: (meta.channelIds as string[]) || [],
  };
}
