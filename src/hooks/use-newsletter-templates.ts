'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { NewsletterTemplate } from '@/lib/types';

export function useNewsletterTemplates(tenantId?: string) {
  return useQuery({
    queryKey: ['newsletter-templates', tenantId],
    queryFn: async (): Promise<NewsletterTemplate[]> => {
      const params = tenantId ? `?tenantId=${tenantId}` : '';
      const res = await apiFetch(`/newsletter-templates${params}`);
      if (!res.ok) throw new Error('Failed to fetch newsletter templates');
      return res.json();
    },
  });
}
