import type { Request, Response } from 'express';
import { db } from '../lib/prisma';
import { isSuperAdmin, userCanAccessTenant } from '../lib/tenant-access';

export async function list(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const tenantId =
      typeof req.query.tenantId === 'string' ? req.query.tenantId.trim() : undefined;

    if (tenantId) {
      if (!(await userCanAccessTenant(req.user, tenantId))) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
    } else if (!isSuperAdmin(req.user)) {
      res.status(400).json({ error: 'tenantId required' });
      return;
    }

    const rows = await db.newsletterTemplate.findMany({
      where: tenantId ? { OR: [{ tenantId }, { tenantId: null }] } : {},
      orderBy: { usageCount: 'desc' },
    });
    res.json(
      rows.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        subject: t.subject,
        preheader: t.preheader,
        thumbnail: t.thumbnail,
        category: t.category,
        isPremium: t.isPremium,
        usageCount: t.usageCount,
        body: t.body,
        createdAt: t.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('GET /api/newsletter-templates', error);
    res.status(500).json({ error: 'Failed to fetch newsletter templates' });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const body = req.body;
    const tenantId = req.authorizedTenantId!;
    const row = await db.newsletterTemplate.create({
      data: {
        name: body.name,
        description: body.description ?? '',
        subject: body.subject ?? '',
        preheader: body.preheader ?? '',
        thumbnail: body.thumbnail ?? '',
        category: body.category ?? 'general',
        isPremium: body.isPremium ?? false,
        tenantId,
        body: body.body ?? '',
      },
    });
    res.status(201).json(row);
  } catch (error) {
    console.error('POST /api/newsletter-templates', error);
    res.status(500).json({ error: 'Failed to create newsletter template' });
  }
}
