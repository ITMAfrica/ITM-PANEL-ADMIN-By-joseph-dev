import type { Request, Response } from 'express';
import { db } from '../lib/prisma';
import { userCanAccessTenant } from '../lib/tenant-access';
import type { UserRole } from '@prisma/client';

interface MemberResponse {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  role: string;
  joinedAt: string;
}

async function buildMemberResponse(member: {
  id: string;
  userId: string;
  role: string;
  joinedAt: Date;
}): Promise<MemberResponse> {
  const user = await db.user.findUnique({
    where: { id: member.userId },
    select: { name: true, email: true, avatar: true },
  });
  return {
    id: member.id,
    userId: member.userId,
    userName: user?.name ?? 'Unknown',
    userEmail: user?.email ?? '',
    userAvatar: user?.avatar ?? '',
    role: member.role,
    joinedAt: member.joinedAt.toISOString(),
  };
}

export async function listMembers(req: Request, res: Response) {
  try {
    const workspaceId = req.params.id as string;
    if (!req.user || !(await userCanAccessTenant(req.user, workspaceId))) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const members = await db.workspaceMember.findMany({
      where: { workspaceId },
      orderBy: { joinedAt: 'asc' },
    });

    const result = await Promise.all(members.map(buildMemberResponse));
    res.json(result);
  } catch (error) {
    console.error('GET /api/workspaces/:id/members', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
}

export async function addMember(req: Request, res: Response) {
  try {
    const workspaceId = req.params.id as string;
    if (!req.user || !(await userCanAccessTenant(req.user, workspaceId))) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const { email, role } = req.body;
    if (!email || !role) {
      res.status(400).json({ error: 'email and role are required' });
      return;
    }

    const normalizedEmail = (email as string).toLowerCase().trim();

    const user = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      res.status(404).json({ error: 'User not found. Invite them first via Users page.' });
      return;
    }

    const existing = await db.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: user.id, workspaceId } },
    });
    if (existing) {
      res.status(409).json({ error: 'User is already a member of this workspace' });
      return;
    }

    const member = await db.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId,
        role: role as UserRole,
      },
    });

    const result = await buildMemberResponse(member);
    res.status(201).json(result);
  } catch (error) {
    console.error('POST /api/workspaces/:id/members', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
}

export async function updateMember(req: Request, res: Response) {
  try {
    const workspaceId = req.params.id as string;
    const targetUserId = req.params.userId as string;
    if (!req.user || !(await userCanAccessTenant(req.user, workspaceId))) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const { role } = req.body;
    if (!role) {
      res.status(400).json({ error: 'role is required' });
      return;
    }

    const member = await db.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
    });
    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    const updated = await db.workspaceMember.update({
      where: { id: member.id },
      data: { role: role as UserRole },
    });

    const result = await buildMemberResponse(updated);
    res.json(result);
  } catch (error) {
    console.error('PATCH /api/workspaces/:id/members/:userId', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
}

export async function removeMember(req: Request, res: Response) {
  try {
    const workspaceId = req.params.id as string;
    const targetUserId = req.params.userId as string;
    if (!req.user || !(await userCanAccessTenant(req.user, workspaceId))) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const member = await db.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
    });
    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    if (member.userId === req.user.id) {
      res.status(400).json({ error: 'Cannot remove yourself from the workspace' });
      return;
    }

    await db.workspaceMember.delete({ where: { id: member.id } });
    res.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/workspaces/:id/members/:userId', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
}
