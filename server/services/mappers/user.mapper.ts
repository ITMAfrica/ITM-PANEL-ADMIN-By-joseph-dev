type DbUser = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  status: string;
  updatedAt: Date;
  workspaceMembers?: {
    workspaceId: string;
    role: string;
    workspace: { name: string };
  }[];
};

export function toCMSUser(user: DbUser, tenantId?: string) {
  const membership =
    user.workspaceMembers?.find((m) => !tenantId || m.workspaceId === tenantId) ??
    user.workspaceMembers?.[0];

  // The user's effective role within the resolved tenant.
  // Falls back to the global role if no workspace membership is found.
  const tenantRole = membership?.role ?? user.role;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar ?? '',
    role: user.role,
    tenantRole,
    status: user.status,
    tenantId: membership?.workspaceId ?? tenantId ?? '',
    tenantName: membership?.workspace.name ?? '',
    lastActive: user.updatedAt.toISOString(),
    contentCount: 0,
  };
}
