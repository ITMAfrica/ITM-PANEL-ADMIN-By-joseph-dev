'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { AuditLogEntry } from '@/lib/types';

export function useAuditLog(tenantId: string) {
  return useQuery({
    queryKey: ['activity', tenantId],
    queryFn: async (): Promise<AuditLogEntry[]> => {
      const res = await apiFetch(`/activity?tenantId=${tenantId}`);
      if (!res.ok) throw new Error('Failed to fetch audit log');
      return res.json();
    },
    enabled: !!tenantId,
  });
}
