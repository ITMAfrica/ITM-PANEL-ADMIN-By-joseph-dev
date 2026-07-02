import type { Request, Response } from 'express';
import { db } from '../lib/prisma';
import { getAccessibleTenantIds, isSuperAdmin } from '../lib/tenant-access';

export async function list(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const tenantIds = await getAccessibleTenantIds(req.user);
    const workspaces = await db.workspace.findMany({
      where: isSuperAdmin(req.user) ? undefined : { id: { in: tenantIds } },
      include: {
        members: {
          include: { user: true },
        },
        projects: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(workspaces);
  } catch (error) {
    console.error('GET /api/workspaces', error);
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const { name, slug, description, color, icon } = req.body;

    if (!name || !slug) {
      res.status(400).json({ error: 'name, slug required' });
      return;
    }

    const workspace = await db.workspace.create({
      data: {
        name,
        slug,
        description: description || null,
        color: color || '#3b82f6',
        icon: icon || 'building-2',
      },
    });

    if (req.user) {
      await db.workspaceMember.create({
        data: {
          userId: req.user.id,
          workspaceId: workspace.id,
          role: 'admin',
        },
      });
    }

    res.status(201).json(workspace);
  } catch (error) {
    console.error('POST /api/workspaces', error);
    res.status(500).json({ error: 'Failed to create workspace' });
  }
}
