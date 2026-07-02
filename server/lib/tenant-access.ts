import type { SessionUser } from './auth';
import { db } from './prisma';

export function isSuperAdmin(user: SessionUser): boolean {
  return user.role === 'super_admin';
}

export async function userCanAccessTenant(user: SessionUser, tenantId: string): Promise<boolean> {
  if (!tenantId) return false;
  if (isSuperAdmin(user)) return true;

  const member = await db.workspaceMember.findFirst({
    where: { userId: user.id, workspaceId: tenantId },
  });
  return !!member;
}

export async function getAccessibleTenantIds(user: SessionUser): Promise<string[]> {
  if (isSuperAdmin(user)) {
    const workspaces = await db.workspace.findMany({ select: { id: true } });
    return workspaces.map((w) => w.id);
  }

  const members = await db.workspaceMember.findMany({
    where: { userId: user.id },
    select: { workspaceId: true },
  });
  return members.map((m) => m.workspaceId);
}

export async function userCanAccessUser(
  sessionUser: SessionUser,
  targetUserId: string
): Promise<boolean> {
  if (isSuperAdmin(sessionUser)) return true;
  if (sessionUser.id === targetUserId) return true;

  const tenantIds = await getAccessibleTenantIds(sessionUser);
  if (tenantIds.length === 0) return false;

  const member = await db.workspaceMember.findFirst({
    where: { userId: targetUserId, workspaceId: { in: tenantIds } },
  });
  return !!member;
}
