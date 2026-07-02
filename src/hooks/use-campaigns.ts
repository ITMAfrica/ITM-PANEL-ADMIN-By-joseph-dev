'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { Campaign } from '@/lib/types';

export function useCampaigns(tenantId: string) {
  return useQuery({
    queryKey: ['campaigns', tenantId],
    queryFn: async (): Promise<Campaign[]> => {
      const res = await apiFetch(`/campaigns?tenantId=${tenantId}`);
      if (!res.ok) throw new Error('Failed to fetch campaigns');
      return res.json();
    },
    enabled: !!tenantId,
  });
}
