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
import { mapContent, toApprovedContentItem } from '../services/mappers/content.mapper';
import { userCanAccessTenant } from '../lib/tenant-access';

async function getAuthorizedContent(req: Request, id: string) {
  const row = await getContentByIdAdmin(id);
  if (!row || !req.user) return null;
  if (!(await userCanAccessTenant(req.user, row.tenantId))) return null;
  return row;
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
    const body = req.body;
    const tenantId = req.authorizedTenantId!;
    const { type, title, excerpt, body: contentBody, siteId, authorId, status, priority, tags, metadata, scheduledAt } = body;

    if (!type || !title) {
      res.status(400).json({ error: 'type, title required' });
      return;
    }

    let resolvedSiteId = siteId;
    if (!resolvedSiteId) {
      const site = await getOrCreateDefaultSiteForTenant(tenantId);
      resolvedSiteId = site.id;
    }

    const row = await createContent({
      type,
      title,
      excerpt,
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

    res.status(201).json(mapContent(row));
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
    res.json(mapContent(row));
  } catch {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const existing = await getAuthorizedContent(req, req.params.id as string);
    if (!existing) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const body = req.body;
    const row = await updateContent(req.params.id as string, {
      title: body.title,
      excerpt: body.excerpt,
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
    res.json(mapContent(row));
  } catch {
    res.status(500).json({ error: 'Failed to update content' });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const existing = await getAuthorizedContent(req, req.params.id as string);
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
    const existing = await getAuthorizedContent(req, req.params.id as string);
    if (!existing) {
      res.status(404).json({ error: 'Content not found or not ready to publish' });
      return;
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
