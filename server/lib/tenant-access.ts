import type { SessionUser } from './auth';
import { db } from './prisma';

export function isSuperAdmin(user: SessionUser): boolean {
  return user.role === 'super_admin';
}

// Runtime role hierarchy – highest index = most privileged
const ROLE_HIERARCHY = [
  'reader',
  'member',
  'contributor',
  'editor',
  'tenant_admin',
  'super_admin',
] as const;

type Role = (typeof ROLE_HIERARCHY)[number];

function roleIndex(role: string): number {
  return ROLE_HIERARCHY.indexOf(role as Role);
}

/** Check whether `userRole` meets or exceeds `requiredRole`. */
export function roleMeetsOrExceeds(userRole: string, requiredRole: string): boolean {
  return roleIndex(userRole) >= roleIndex(requiredRole);
}

/**
 * Returns the effective role of a user within a specific tenant/workspace.
 * - super_admin always returns 'super_admin'
 * - Otherwise returns the HIGHER of the workspace role and the global role,
 *   so that a global tenant_admin/editor retains write access even when
 *   their workspace-level role is lower (e.g. default 'member').
 */
export async function getUserTenantRole(
  user: SessionUser,
  tenantId: string
): Promise<string | null> {
  if (isSuperAdmin(user)) return 'super_admin';
  if (!tenantId) return null;

  const member = await db.workspaceMember.findFirst({
    where: { userId: user.id, workspaceId: tenantId },
    select: { role: true },
  });

  const workspaceRole = member?.role ?? null;
  const globalRole = user.role ?? null;

  if (!workspaceRole) return globalRole;
  if (!globalRole) return workspaceRole;
  return roleIndex(workspaceRole) >= roleIndex(globalRole) ? workspaceRole : globalRole;
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
