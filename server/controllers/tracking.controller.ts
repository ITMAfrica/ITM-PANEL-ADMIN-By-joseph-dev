import type { Request, Response } from 'express';
import {
  getContentById,
  getPublishedContent,
  trackClick,
  trackView,
} from '../services/content.service';

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
    const contentId = req.body.contentId as string;
    const siteId = (req.body.siteId || req.body.site) as string | undefined;

    if (!contentId) {
      res.status(400).json({ error: 'contentId is required' });
      return;
    }
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
    const contentId = req.body.contentId as string;
    const siteId = (req.body.siteId || req.body.site) as string | undefined;
    const linkUrl = req.body.linkUrl as string | undefined;

    if (!contentId) {
      res.status(400).json({ error: 'contentId is required' });
      return;
    }
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
