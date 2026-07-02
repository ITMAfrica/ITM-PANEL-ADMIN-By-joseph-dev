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
    workspace: { name: string };
  }[];
};

export function toCMSUser(user: DbUser, tenantId?: string) {
  const membership =
    user.workspaceMembers?.find((m) => !tenantId || m.workspaceId === tenantId) ??
    user.workspaceMembers?.[0];

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar ?? '',
    role: user.role,
    status: user.status,
    tenantId: membership?.workspaceId ?? tenantId ?? '',
    tenantName: membership?.workspace.name ?? '',
    lastActive: user.updatedAt.toISOString(),
    contentCount: 0,
  };
}
