import type { Request, Response } from 'express';
import { db } from '../lib/prisma';
import { hashPassword } from '../lib/auth';
import {
  isSuperAdmin,
  userCanAccessTenant,
  userCanAccessUser,
} from '../lib/tenant-access';
import { toCMSUser } from '../services/mappers/user.mapper';

export async function list(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const tenantId =
      typeof req.query.tenantId === 'string' ? req.query.tenantId.trim() : undefined;

    if (!tenantId) {
      if (!isSuperAdmin(req.user)) {
        res.status(400).json({ error: 'tenantId required' });
        return;
      }

      const users = await db.user.findMany({
        include: {
          workspaceMembers: { include: { workspace: true } },
        },
        orderBy: { name: 'asc' },
      });
      res.json(users.map((u) => toCMSUser(u)));
      return;
    }

    if (!(await userCanAccessTenant(req.user, tenantId))) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const users = await db.user.findMany({
      include: {
        workspaceMembers: {
          include: { workspace: true },
          where: { workspaceId: tenantId },
        },
      },
      orderBy: { name: 'asc' },
    });
    const filtered = users.filter((u) => u.workspaceMembers.length > 0);
    res.json(filtered.map((u) => toCMSUser(u, tenantId)));
  } catch (error) {
    console.error('GET /api/users', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const { email, name, role, password, tenantId } = req.body;

    if (!email || !name || !password) {
      res.status(400).json({ error: 'email, name, password required' });
      return;
    }

    if (tenantId && req.user && !(await userCanAccessTenant(req.user, tenantId))) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name,
        role: role || 'contributor',
        passwordHash,
      },
    });

    if (tenantId) {
      await db.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: tenantId,
          role: 'member',
        },
      });
    }

    res.status(201).json(toCMSUser(user, tenantId));
  } catch (error) {
    console.error('POST /api/users', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
}

export async function update(req: Request, res: Response) {
  try {
    if (!req.user || !(await userCanAccessUser(req.user, req.params.id as string))) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const body = req.body;
    const user = await db.user.update({
      where: { id: req.params.id as string },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.role !== undefined && { role: body.role }),
        ...(body.status !== undefined && { status: body.status }),
      },
      include: {
        workspaceMembers: { include: { workspace: true } },
      },
    });
    res.json(toCMSUser(user));
  } catch (error) {
    console.error('PATCH /api/users', error);
    res.status(404).json({ error: 'Failed to update user' });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    if (!req.user || !(await userCanAccessUser(req.user, req.params.id as string))) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    await db.user.delete({ where: { id: req.params.id as string } });
    res.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/users', error);
    res.status(404).json({ error: 'Failed to delete user' });
  }
}
