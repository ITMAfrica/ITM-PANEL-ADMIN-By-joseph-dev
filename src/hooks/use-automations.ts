'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { Automation } from '@/lib/types';

export function useAutomations(tenantId: string) {
  return useQuery({
    queryKey: ['automations', tenantId],
    queryFn: async (): Promise<Automation[]> => {
      const res = await apiFetch(`/automations?tenantId=${tenantId}`);
      if (!res.ok) throw new Error('Failed to fetch automations');
      return res.json();
    },
    enabled: !!tenantId,
  });
}
