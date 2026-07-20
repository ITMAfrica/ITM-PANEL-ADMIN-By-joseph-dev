// ========================
// Core Types for ContentFlow - SaaS CMS Multi-Tenant
// ========================

export type PageId =
  // Communication
  | 'dashboard'
  | 'newsletters'
  | 'articles'
  | 'announcements'
  | 'campaigns'
  | 'editorial-calendar'
  | 'conversation'
  // Gestion de contenu
  | 'library'
  | 'media'
  | 'templates'
  | 'drafts'
  | 'published'
  | 'archive'
  // Diffusion
  | 'scheduling'
  | 'channels'
  | 'automations'
  // Analyse
  | 'reports'
  // Administration
  | 'users'
  | 'roles'
  | 'tenants'
  | 'workspace-members'
  | 'audit'
  | 'settings'
  | 'documentation';

// ─── Content Status (Editorial Workflow) ────────────────────────────────
export type ContentStatus = 'draft' | 'review' | 'approved' | 'scheduled' | 'published' | 'archived';
export type ContentPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ContentType = 'newsletter' | 'article' | 'announcement' | 'communique' | 'campaign';

// ─── RBAC Roles ─────────────────────────────────────────────────────────
export type UserRole = 'super_admin' | 'tenant_admin' | 'editor' | 'contributor' | 'reader' | 'member';
export type UserStatus = 'online' | 'away' | 'offline' | 'busy';

// ─── Tenant ─────────────────────────────────────────────────────────────
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: 'country' | 'subsidiary' | 'organization' | 'brand' | 'department';
  color: string;
  icon: string;
  country: string;
  memberCount: number;
  contentCount: number;
  isActive: boolean;
  createdAt: string;
}

// ─── Workspace Member ───────────────────────────────────────────────────
export interface WorkspaceMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  role: UserRole;
  joinedAt: string;
}

// ─── User ───────────────────────────────────────────────────────────────
export interface CMSUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  tenantRole: UserRole;
  status: UserStatus;
  tenantId: string;
  tenantName: string;
  lastActive: string;
  contentCount: number;
}

// ─── Content Base ───────────────────────────────────────────────────────
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

export interface ContentDetail extends ContentItem {
  body: string;
  metadata: Record<string, unknown>;
}

// ─── Newsletter ─────────────────────────────────────────────────────────
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

// ─── Article ────────────────────────────────────────────────────────────
export interface Article extends ContentItem {
  type: 'article';
  category: string;
  readingTime: number;
  commentCount: number;
  likeCount: number;
  shareCount: number;
}

// ─── Announcement ───────────────────────────────────────────────────────
export interface Announcement extends ContentItem {
  type: 'announcement';
  urgency: 'info' | 'warning' | 'critical';
  /** Type de communication (id issu de ANNOUNCEMENT_TYPES, ex. 'security', 'it-maintenance'). */
  category: string;
  targetAudience: 'all' | 'tenant' | 'role';
  acknowledgedCount: number;
  totalRecipients: number;
}

// ─── Campaign ───────────────────────────────────────────────────────────
export interface Campaign {
  id: string;
  name: string;
  description: string;
  color: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate: string;
  tenantId: string;
  contentCount: number;
  publishedCount: number;
  totalReach: number;
  avgOpenRate: number;
  avgClickRate: number;
  channels: string[];
  createdAt: string;
}

// ─── Media ──────────────────────────────────────────────────────────────
export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'audio' | 'other';
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  tenantId: string;
  alt?: string;
  width?: number;
  height?: number;
  createdAt: string;
}

// ─── Template ───────────────────────────────────────────────────────────
export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  type: ContentType;
  thumbnail: string;
  category: string;
  isPremium: boolean;
  usageCount: number;
  /** Sections JSON (mêmes blocs que les newsletters) — pré-remplit le compositeur. */
  body: string;
  createdAt: string;
}

export interface NewsletterTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  preheader: string;
  thumbnail: string;
  category: string;
  isPremium: boolean;
  usageCount: number;
  body: string;
  createdAt: string;
}

export type NewsletterSection =
  | { type: 'hero'; title: string; subtitle: string; imageUrl: string; label?: string }
  | { type: 'band'; label: string }
  | { type: 'article'; title: string; imageUrl: string; text: string }
  | { type: 'cta'; label: string; href: string }
  | { type: 'calendar'; items: string[] }
  | { type: 'footer'; text: string };

// ─── Distribution Channel ───────────────────────────────────────────────
export interface DistributionChannel {
  id: string;
  name: string;
  type: 'email' | 'web' | 'intranet' | 'social' | 'push' | 'sms';
  icon: string;
  subscriberCount: number;
  isActive: boolean;
  lastSentAt?: string;
}

// Connexion OAuth Meta (Page Facebook) — mapping public de GET /api/meta/connections.
// Le token d'accès n'est jamais exposé par l'API.
export interface MetaConnection {
  id: string;
  platform: string;
  pageId: string;
  pageName: string;
  status: 'connected' | 'expired' | 'revoked' | 'error';
  scopes: unknown;
  tokenExpiresAt: string | null;
  lastPublishAt: string | null;
  lastError: string | null;
  channelId: string | null;
  createdAt: string;
}

// ─── Social Inbox (boîte de réception sociale) ───────────────────────────
export interface SocialConversation {
  id: string;
  platform: string;
  authorName: string;
  authorAvatarUrl: string | null;
  preview: string;
  status: 'unresolved' | 'resolved';
  unread: boolean;
  lastMessageAt: string;
  externalPostId: string;
  contentId: string | null;
  pageName: string;
}

export interface SocialMessage {
  id: string;
  direction: 'inbound' | 'outbound';
  authorName: string;
  body: string;
  publishedAt: string;
}

export interface InboxSyncResult {
  connections: number;
  posts: number;
  newConversations: number;
  newMessages: number;
  errors: { connectionId: string; reason: string }[];
}

export interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  tenantId: string;
  status: 'subscribed' | 'unsubscribed';
  createdAt: string;
  city?: string | null;
  country?: string | null;
  consentNewsletter?: boolean;
  consentPrivacy?: boolean;
  consentTextVersion?: string | null;
  consentedAt?: string;
  metadata?: {
    context?: {
      pageUrl?: string;
      referrer?: string;
      siteSlug?: string;
      utm?: Record<string, string>;
    };
    technical?: {
      language?: string;
      timezone?: string;
      userAgent?: string;
    };
  };
}

// ─── Automation ─────────────────────────────────────────────────────────
export interface Automation {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
  lastRun?: string;
  runCount: number;
  tenantId: string;
}

// ─── Notification ───────────────────────────────────────────────────────
export interface Notification {
  id: string;
  type: 'validation_requested' | 'content_approved' | 'content_published' | 'send_failed' | 'new_assignment' | 'comment_mention' | 'system' | 'assignment' | 'comment' | 'deadline' | 'mention' | 'invitation';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

// ─── Audit Log ──────────────────────────────────────────────────────────
export interface AuditLogEntry {
  id: string;
  action: 'create' | 'update' | 'delete' | 'validate' | 'publish' | 'login' | 'logout' | 'permission_change';
  entityType: string;
  entityId: string;
  userId: string;
  tenantId: string;
  details: string;
  timestamp: string;
}

// ─── Calendar Event ─────────────────────────────────────────────────────
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: 'deadline' | 'publication' | 'review' | 'meeting' | 'campaign';
  status?: 'scheduled' | 'published';
  color: string;
  contentId?: string;
  tenantId?: string;
}

// ─── Content Version ────────────────────────────────────────────────────
export interface ContentVersion {
  id: string;
  contentId: string;
  version: number;
  content: string;
  authorId: string;
  createdAt: string;
  changeNote?: string;
}

// ─── Newsletter send tracking ─────────────────────────────────────────
export interface NewsletterSendDetail {
  id: string;
  status: string;
  email: string;
  name: string | null;
  city: string | null;
  country: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  createdAt: string;
}

export interface NewsletterSendsResponse {
  contentId: string;
  total: number;
  opened: number;
  clicked: number;
  sends: NewsletterSendDetail[];
}
