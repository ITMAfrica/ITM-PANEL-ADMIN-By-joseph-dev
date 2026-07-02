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
  | 'statistics'
  | 'reports'
  // Administration
  | 'users'
  | 'roles'
  | 'tenants'
  | 'audit'
  | 'settings';

// ─── Content Status (Editorial Workflow) ────────────────────────────────
export type ContentStatus = 'draft' | 'review' | 'approved' | 'scheduled' | 'published' | 'archived';
export type ContentPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ContentType = 'newsletter' | 'article' | 'announcement' | 'communique' | 'campaign';

// ─── RBAC Roles ─────────────────────────────────────────────────────────
export type UserRole = 'super_admin' | 'tenant_admin' | 'editor' | 'contributor' | 'reader';
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

// ─── User ───────────────────────────────────────────────────────────────
export interface CMSUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
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
  createdAt: string;
}

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
