'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { DistributionChannel } from '@/lib/types';

export function useDistributionChannels(tenantId: string) {
  return useQuery({
    queryKey: ['distribution-channels', tenantId],
    queryFn: async (): Promise<DistributionChannel[]> => {
      const res = await apiFetch(`/distribution-channels?tenantId=${tenantId}`);
      if (!res.ok) throw new Error('Failed to fetch channels');
      return res.json();
    },
    enabled: !!tenantId,
  });
}
