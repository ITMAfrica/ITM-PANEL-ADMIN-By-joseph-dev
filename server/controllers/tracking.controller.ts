import type { Request, Response } from 'express';
import {
  getContentById,
  getPublishedContent,
  trackAcknowledge,
  trackClick,
  trackView,
} from '../services/content.service';
import { parseBody } from '../lib/validate';
import {
  trackAcknowledgeSchema,
  trackClickSchema,
  trackViewSchema,
} from '../lib/schemas';

export async function listPublicContent(req: Request, res: Response) {
  const site = req.query.site as string | undefined;
  if (!site) {
    res.status(400).json({ error: 'site query parameter is required' });
    return;
  }
  const type = (req.query.type as string) || undefined;

  try {
    const content = await getPublishedContent(site, type);
    res.json({ site, count: content.length, content });
  } catch (error) {
    console.error('GET /api/public/content', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
}

export async function getPublicContentById(req: Request, res: Response) {
  try {
    const content = await getContentById(req.params.id as string);
    if (!content) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }
    res.json(content);
  } catch (error) {
    console.error('GET /api/public/content/[id]', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
}

export async function trackViewEvent(req: Request, res: Response) {
  try {
    const body = parseBody(trackViewSchema, req, res);
    if (!body) return;

    const contentId = body.contentId;
    const siteId = body.siteId || body.site;

    if (!siteId) {
      res.status(400).json({ error: 'siteId or site is required' });
      return;
    }

    const result = await trackView(contentId, siteId);
    if (!result) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }

    res.json({ ok: true, viewCount: result.viewCount, clickCount: result.clickCount });
  } catch (error) {
    console.error('POST /api/track/view', error);
    res.status(500).json({ error: 'Failed to track view' });
  }
}

export async function trackClickEvent(req: Request, res: Response) {
  try {
    const body = parseBody(trackClickSchema, req, res);
    if (!body) return;

    const contentId = body.contentId;
    const siteId = body.siteId || body.site;
    const linkUrl = body.linkUrl;

    if (!siteId) {
      res.status(400).json({ error: 'siteId or site is required' });
      return;
    }

    const result = await trackClick(contentId, siteId, linkUrl);
    if (!result) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }

    res.json({
      ok: true,
      viewCount: result.viewCount,
      clickCount: result.clickCount,
      clickRate: result.clickRate,
    });
  } catch (error) {
    console.error('POST /api/track/click', error);
    res.status(500).json({ error: 'Failed to track click' });
  }
}

/** Future site/widget connection — records ContentEvent acknowledge. */
export async function trackAcknowledgeEvent(req: Request, res: Response) {
  try {
    const body = parseBody(trackAcknowledgeSchema, req, res);
    if (!body) return;

    const contentId = body.contentId;
    const siteId = body.siteId || body.site;

    if (!siteId) {
      res.status(400).json({ error: 'siteId or site is required' });
      return;
    }

    const result = await trackAcknowledge(contentId, siteId);
    if (!result) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('POST /api/track/acknowledge', error);
    res.status(500).json({ error: 'Failed to track acknowledge' });
  }
}
