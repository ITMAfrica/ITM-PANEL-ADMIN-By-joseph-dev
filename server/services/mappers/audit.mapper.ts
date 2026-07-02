const actionMap: Record<string, string> = {
  create: 'create',
  update: 'update',
  delete: 'delete',
  publish: 'publish',
  validate: 'validate',
  login: 'login',
  logout: 'logout',
  permission_change: 'permission_change',
};

type DbActivityLog = {
  id: string;
  type: string;
  userId: string;
  description: string;
  targetId: string | null;
  targetType: string | null;
  workspaceId: string;
  createdAt: Date;
};

export function toAuditLogEntry(row: DbActivityLog) {
  return {
    id: row.id,
    action: actionMap[row.type] ?? 'update',
    entityType: row.targetType ?? 'system',
    entityId: row.targetId ?? '',
    userId: row.userId,
    tenantId: row.workspaceId,
    details: row.description,
    timestamp: row.createdAt.toISOString(),
  };
}
