import type { Request, Response } from 'express';
import {
  approveContent,
  createContent,
  deleteContent,
  getApprovedContent,
  getContentByIdAdmin,
  getOrCreateDefaultSiteForTenant,
  getRecentlyPublished,
  getStatsByTenant,
  listContent,
  publishContent,
  rejectContent,
  submitContentForReview,
  updateContent,
} from '../services/content.service';
import { sendNewsletterById } from '../services/newsletter.service';
import { publishSocialById } from '../services/social.service';
import { mapContent, mapContentDetail, toApprovedContentItem } from '../services/mappers/content.mapper';
import { getUserTenantRole, isSuperAdmin, roleMeetsOrExceeds, userCanAccessTenant } from '../lib/tenant-access';
import {
  contentCreateSchema,
  contentUpdateSchema,
  hasNewsletterChannelIds,
  hasNewsletterEmailSubject,
  newsletterStatusRequiresChannels,
} from '../lib/schemas';
import { parseBody } from '../lib/validate';

const NEWSLETTER_CHANNEL_REQUIRED =
  'At least one channel is required to publish or schedule a newsletter';

const NEWSLETTER_SUBJECT_REQUIRED =
  'emailSubject is required to publish or schedule a newsletter';

function mergeContentMetadata(
  existing: unknown,
  patch: Record<string, unknown> | undefined
): Record<string, unknown> {
  const base =
    existing && typeof existing === 'object' && !Array.isArray(existing)
      ? (existing as Record<string, unknown>)
      : {};
  return patch ? { ...base, ...patch } : base;
}

async function getAuthorizedContent(req: Request, id: string) {
  const row = await getContentByIdAdmin(id);
  if (!row || !req.user) return null;
  if (!(await userCanAccessTenant(req.user, row.tenantId))) return null;
  return row;
}

/**
 * If the content just became 'published', start the matching dispatch in the
 * background so the HTTP response is not blocked by SMTP / Graph API calls.
 * - newsletter → envoi email aux abonnés (sendNewsletterById)
 * - social     → publication sur les Pages Facebook (publishSocialById)
 * Returns true when a background dispatch was scheduled.
 */
function scheduleNewsletterDispatch(
  row: { id: string; type: string; status: string },
  wasPublished: boolean
): boolean {
  if (row.status !== 'published' || wasPublished) {
    return false;
  }
  if (row.type === 'newsletter') {
    void sendNewsletterById(row.id).catch((error) => {
      console.error('[content] Newsletter auto-dispatch failed:', error);
    });
    return true;
  }
  if (row.type === 'social') {
    void publishSocialById(row.id).catch((error) => {
      console.error('[content] Social auto-dispatch failed:', error);
    });
    return true;
  }
  return false;
}

/**
 * Like `getAuthorizedContent`, but also checks that the user has at least
 * the given role within the content's workspace.
 */
async function getAuthorizedContentWithRole(
  req: Request,
  id: string,
  requiredRole: string
) {
  const row = await getAuthorizedContent(req, id);
  if (!row || !req.user) return null;

  const effectiveRole = await getUserTenantRole(req.user, row.tenantId);
  if (!effectiveRole) return null;

  if (isSuperAdmin(req.user) || roleMeetsOrExceeds(effectiveRole, requiredRole)) {
    return row;
  }

  return null;
}

export async function list(req: Request, res: Response) {
  try {
    const tenantId = req.authorizedTenantId!;
    const { type, status, search } = req.query;

    const rows = await listContent({
      tenantId,
      type: type ? String(type) : undefined,
      status: status ? String(status) : undefined,
      search: search ? String(search) : undefined,
    });
    res.json(rows.map(mapContent));
  } catch (error) {
    console.error('GET /api/content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const body = parseBody(contentCreateSchema, req, res);
    if (!body) return;

    const tenantId = req.authorizedTenantId!;
    const { type, title, body: contentBody, siteId, authorId, status, priority, tags, metadata, scheduledAt } = body;

    let resolvedSiteId = siteId;
    if (!resolvedSiteId) {
      const site = await getOrCreateDefaultSiteForTenant(tenantId);
      resolvedSiteId = site.id;
    }

    const row = await createContent({
      type,
      title,
      body: contentBody,
      tenantId,
      siteId: resolvedSiteId,
      authorId: authorId ?? req.user?.id,
      status: status ?? 'draft',
      priority,
      tags,
      metadata,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    });

    // Auto-dispatch in background: respond as soon as content is saved.
    const dispatching = scheduleNewsletterDispatch(row, false);
    const response = mapContent(row);
    res.status(201).json(dispatching ? { ...response, dispatching: true } : response);
  } catch (error) {
    console.error('POST /api/content:', error);
    res.status(500).json({ error: 'Failed to create content' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const row = await getAuthorizedContent(req, req.params.id as string);
    if (!row) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(mapContentDetail(row));
  } catch {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const existing = await getAuthorizedContentWithRole(req, req.params.id as string, 'editor');
    if (!existing) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const body = parseBody(contentUpdateSchema, req, res);
    if (!body) return;

    const nextStatus = body.status ?? existing.status;
    if (
      existing.type === 'newsletter' &&
      newsletterStatusRequiresChannels(nextStatus)
    ) {
      const effectiveMetadata = mergeContentMetadata(existing.metadata, body.metadata);
      if (!hasNewsletterChannelIds(effectiveMetadata)) {
        res.status(400).json({ error: NEWSLETTER_CHANNEL_REQUIRED });
        return;
      }
      if (!hasNewsletterEmailSubject(effectiveMetadata)) {
        res.status(400).json({ error: NEWSLETTER_SUBJECT_REQUIRED });
        return;
      }
    }

    const wasPublished = existing.status === 'published';

    const row = await updateContent(req.params.id as string, {
      title: body.title,
      body: body.body,
      status: body.status,
      priority: body.priority,
      tags: body.tags,
      metadata: body.metadata,
      scheduledAt:
        body.scheduledAt !== undefined
          ? body.scheduledAt
            ? new Date(body.scheduledAt)
            : null
          : undefined,
    });
    if (!row) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    // Auto-dispatch in background when a newsletter transitions to 'published'.
    const dispatching = scheduleNewsletterDispatch(row, wasPublished);
    const response = mapContentDetail(row);
    res.json(dispatching ? { ...response, dispatching: true } : response);
  } catch {
    res.status(500).json({ error: 'Failed to update content' });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const existing = await getAuthorizedContentWithRole(req, req.params.id as string, 'tenant_admin');
    if (!existing) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const ok = await deleteContent(req.params.id as string);
    if (!ok) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete content' });
  }
}

export async function publish(req: Request, res: Response) {
  try {
    const existing = await getAuthorizedContentWithRole(req, req.params.id as string, 'editor');
    if (!existing) {
      res.status(404).json({ error: 'Content not found or not ready to publish' });
      return;
    }

    if (existing.type === 'newsletter') {
      if (!hasNewsletterChannelIds(existing.metadata)) {
        res.status(400).json({ error: NEWSLETTER_CHANNEL_REQUIRED });
        return;
      }
      if (!hasNewsletterEmailSubject(existing.metadata)) {
        res.status(400).json({ error: NEWSLETTER_SUBJECT_REQUIRED });
        return;
      }
    }

    const content = await publishContent(req.params.id as string);
    if (!content) {
      res.status(404).json({ error: 'Content not found or not ready to publish' });
      return;
    }

    res.json({
      ok: true,
      content: {
        id: content.id,
        title: content.title,
        status: content.status,
        publishedAt: content.publishedAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error('POST /api/content/[id]/publish', error);
    res.status(500).json({ error: 'Failed to publish content' });
  }
}

export async function stats(req: Request, res: Response) {
  const tenantId = req.authorizedTenantId!;

  try {
    const statsData = await getStatsByTenant(tenantId);
    res.json({ tenantId, ...statsData });
  } catch (error) {
    console.error('GET /api/content/stats', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

export async function approved(req: Request, res: Response) {
  const tenantId = req.authorizedTenantId!;

  try {
    const [approvedRows, recentlyPublished] = await Promise.all([
      getApprovedContent(tenantId),
      getRecentlyPublished(tenantId),
    ]);

    res.json({
      approved: approvedRows.map(toApprovedContentItem),
      recentlyPublished: recentlyPublished.map(toApprovedContentItem),
    });
  } catch (error) {
    console.error('GET /api/content/approved', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
}

export async function approve(req: Request, res: Response) {
  try {
    const existing = await getAuthorizedContent(req, req.params.id as string);
    if (!existing) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    if (existing.status !== 'review') {
      res.status(409).json({ error: 'Content is not in review' });
      return;
    }

    const row = await approveContent(req.params.id as string);
    if (!row) {
      res.status(409).json({ error: 'Content is not in review' });
      return;
    }
    res.json(mapContent(row));
  } catch (error) {
    console.error('POST /api/content/:id/approve', error);
    res.status(500).json({ error: 'Failed to approve content' });
  }
}

export async function reject(req: Request, res: Response) {
  try {
    const existing = await getAuthorizedContent(req, req.params.id as string);
    if (!existing) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    if (existing.status !== 'review') {
      res.status(409).json({ error: 'Content is not in review' });
      return;
    }

    const reason = typeof req.body?.reason === 'string' ? req.body.reason : undefined;
    const row = await rejectContent(req.params.id as string, reason);
    if (!row) {
      res.status(409).json({ error: 'Content is not in review' });
      return;
    }
    res.json(mapContent(row));
  } catch (error) {
    console.error('POST /api/content/:id/reject', error);
    res.status(500).json({ error: 'Failed to reject content' });
  }
}

export async function submitForReview(req: Request, res: Response) {
  try {
    const existing = await getAuthorizedContent(req, req.params.id as string);
    if (!existing) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    if (existing.status !== 'draft') {
      res.status(409).json({ error: 'Content is not a draft' });
      return;
    }

    const row = await submitContentForReview(req.params.id as string);
    if (!row) {
      res.status(409).json({ error: 'Content is not a draft' });
      return;
    }
    res.json(mapContent(row));
  } catch (error) {
    console.error('POST /api/content/:id/submit-for-review', error);
    res.status(500).json({ error: 'Failed to submit content for review' });
  }
}
