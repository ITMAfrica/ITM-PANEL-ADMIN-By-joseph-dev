import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters');

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Invalid email'),
  name: z.string().trim().min(1, 'Name is required'),
  password: passwordSchema,
});

const contentTypeSchema = z.enum([
  'newsletter',
  'article',
  'announcement',
  'communique',
  'campaign',
  'social',
]);

const contentStatusSchema = z.enum([
  'draft',
  'review',
  'approved',
  'scheduled',
  'published',
  'archived',
]);

const contentPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

const NEWSLETTER_CHANNEL_REQUIRED =
  'At least one channel is required to publish or schedule a newsletter';

const NEWSLETTER_SUBJECT_REQUIRED =
  'emailSubject is required to publish or schedule a newsletter';

export function newsletterStatusRequiresChannels(
  status: string | null | undefined
): boolean {
  return status === 'published' || status === 'scheduled';
}

export function hasNewsletterChannelIds(metadata: unknown): boolean {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return false;
  }
  const channelIds = (metadata as Record<string, unknown>).channelIds;
  return (
    Array.isArray(channelIds) &&
    channelIds.length > 0 &&
    channelIds.every((id) => typeof id === 'string' && id.trim().length > 0)
  );
}

export function hasNewsletterEmailSubject(metadata: unknown): boolean {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return false;
  }
  const subject = (metadata as Record<string, unknown>).emailSubject;
  return typeof subject === 'string' && subject.trim().length > 0;
}

export const contentCreateSchema = z
  .object({
    type: contentTypeSchema,
    title: z.string().trim().min(1, 'Title is required'),
    body: z.string().optional(),
    siteId: z.string().optional(),
    authorId: z.string().optional(),
    status: contentStatusSchema.optional(),
    priority: contentPrioritySchema.optional(),
    tags: z.array(z.string()).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    scheduledAt: z.union([z.string(), z.null()]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type !== 'newsletter') return;
    if (!newsletterStatusRequiresChannels(data.status)) return;
    if (!hasNewsletterChannelIds(data.metadata)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: NEWSLETTER_CHANNEL_REQUIRED,
        path: ['metadata', 'channelIds'],
      });
    }
    if (!hasNewsletterEmailSubject(data.metadata)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: NEWSLETTER_SUBJECT_REQUIRED,
        path: ['metadata', 'emailSubject'],
      });
    }
  });

export const contentUpdateSchema = z
  .object({
    title: z.string().trim().min(1, 'Title cannot be empty').optional(),
    body: z.string().optional(),
    status: contentStatusSchema.optional(),
    priority: contentPrioritySchema.optional(),
    tags: z.array(z.string()).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    scheduledAt: z.union([z.string(), z.null()]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

const userRoleSchema = z.enum([
  'super_admin',
  'tenant_admin',
  'editor',
  'contributor',
  'reader',
  'member',
]);

const userStatusSchema = z.enum(['online', 'away', 'offline', 'busy']);

export const userCreateSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Invalid email'),
  name: z.string().trim().min(1, 'Name is required'),
  password: passwordSchema,
  role: userRoleSchema.optional(),
  tenantId: z.string().optional(),
});

export const userUpdateSchema = z
  .object({
    name: z.string().trim().min(1, 'Name cannot be empty').optional(),
    role: userRoleSchema.optional(),
    status: userStatusSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const channelCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  type: z.enum(['email', 'web', 'intranet', 'social', 'push', 'sms']).optional().default('email'),
  icon: z.string().optional().default('mail'),
});

export const channelUpdateSchema = z
  .object({
    isActive: z.boolean().optional(),
    name: z.string().trim().min(1, 'Name cannot be empty').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const mediaCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  url: z
    .string()
    .trim()
    .min(1, 'URL is required')
    // Allow relative upload paths (/api/uploads/...) OR absolute http(s) URLs.
    // Reject dangerous schemes (javascript:, data:, ...) without breaking the
    // local filesystem upload flow.
    .refine(
      (v) =>
        v.startsWith('/') ||
        v.startsWith('http://') ||
        v.startsWith('https://'),
      'URL must be a relative path or an http(s) URL',
    ),
  type: z.string().optional(),
  mimeType: z.string().optional(),
  size: z.number().int().nonnegative().optional(),
  thumbnailUrl: z.string().optional(),
  uploadedBy: z.string().optional(),
  alt: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const subscriberCreateSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Invalid email'),
  name: z.string().trim().optional(),
  channelId: z.string().min(1, 'channelId is required'),
});

export const CONSENT_TEXT_VERSION = 'v1-2026-07';

export const publicSubscribeSchema = z
  .object({
    email: z.string().trim().min(1, 'Email is required').email('Invalid email'),
    name: z.string().trim().optional(),
    channelId: z.string().trim().optional(),
    token: z.string().trim().optional(),
    siteSlug: z.string().trim().optional(),
    formKey: z.string().trim().optional(),
    consent: z.object({
      newsletter: z.literal(true),
      privacyAccepted: z.literal(true),
      textVersion: z.string().trim().min(1).optional(),
    }),
    context: z
      .object({
        pageUrl: z.string().trim().max(2048).optional(),
        referrer: z.string().trim().max(2048).optional(),
        siteSlug: z.string().trim().max(128).optional(),
        utm: z
          .object({
            source: z.string().trim().max(256).optional(),
            medium: z.string().trim().max(256).optional(),
            campaign: z.string().trim().max(256).optional(),
            term: z.string().trim().max(256).optional(),
            content: z.string().trim().max(256).optional(),
          })
          .optional(),
      })
      .optional(),
    technical: z
      .object({
        language: z.string().trim().max(64).optional(),
        timezone: z.string().trim().max(64).optional(),
        userAgent: z.string().trim().max(512).optional(),
      })
      .optional(),
  })
  .refine((data) => data.channelId || data.token, {
    message: 'Either channelId or token is required',
    path: ['channelId'],
  });

export const trackViewSchema = z.object({
  contentId: z.string().min(1, 'contentId is required'),
  siteId: z.union([z.string().min(1), z.literal('')]).optional(),
  site: z.string().min(1).optional(),
});

export const trackClickSchema = z.object({
  contentId: z.string().min(1, 'contentId is required'),
  siteId: z.union([z.string().min(1), z.literal('')]).optional(),
  site: z.string().min(1).optional(),
  linkUrl: z.string().max(2048).optional(),
});

export const trackAcknowledgeSchema = z.object({
  contentId: z.string().min(1, 'contentId is required'),
  siteId: z.union([z.string().min(1), z.literal('')]).optional(),
  site: z.string().min(1).optional(),
});

export const analyticsTrendsQuerySchema = z.object({
  resource: z.enum(['all', 'newsletters', 'articles', 'announcements', 'campaigns']).default('all'),
  mode: z.enum(['volume', 'reach', 'engagement', 'quality']).default('volume'),
  weeks: z.coerce.number().int().min(1).max(52).default(12),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  granularity: z.enum(['day', 'week', 'month']).optional(),
  locale: z.enum(['fr', 'en']).optional(),
});
