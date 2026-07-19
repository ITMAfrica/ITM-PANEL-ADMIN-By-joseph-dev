'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { MediaItem } from '@/lib/types';

export function useMedia(tenantId: string) {
  return useQuery({
    queryKey: ['media', tenantId],
    queryFn: async (): Promise<MediaItem[]> => {
      const res = await apiFetch(`/media?tenantId=${tenantId}`);
      if (!res.ok) throw new Error('Failed to fetch media');
      return res.json();
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: true,
  });
}
