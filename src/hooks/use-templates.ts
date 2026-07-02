'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { ContentTemplate } from '@/lib/types';

export function useTemplates(tenantId?: string) {
  return useQuery({
    queryKey: ['templates', tenantId],
    queryFn: async (): Promise<ContentTemplate[]> => {
      const params = tenantId ? `?tenantId=${tenantId}` : '';
      const res = await apiFetch(`/templates${params}`);
      if (!res.ok) throw new Error('Failed to fetch templates');
      return res.json();
    },
  });
}
