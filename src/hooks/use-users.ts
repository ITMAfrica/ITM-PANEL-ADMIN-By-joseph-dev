'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { CMSUser } from '@/lib/types';

export function useUsers(tenantId: string) {
  return useQuery({
    queryKey: ['users', tenantId],
    queryFn: async (): Promise<CMSUser[]> => {
      const res = await apiFetch(`/users?tenantId=${tenantId}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
    enabled: !!tenantId,
  });
}
