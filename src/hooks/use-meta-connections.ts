'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { MetaConnection } from '@/lib/types';

export function useMetaConnections(tenantId: string) {
  return useQuery({
    queryKey: ['meta-connections', tenantId],
    queryFn: async (): Promise<MetaConnection[]> => {
      const res = await apiFetch(`/meta/connections?tenantId=${tenantId}`);
      if (!res.ok) throw new Error('Failed to fetch Meta connections');
      return res.json();
    },
    enabled: !!tenantId,
  });
}

export function useDisconnectMetaConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, tenantId }: { id: string; tenantId: string }) => {
      const res = await apiFetch(
        `/meta/connections/${encodeURIComponent(id)}?tenantId=${encodeURIComponent(tenantId)}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to disconnect Meta page');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meta-connections'] });
      // La déconnexion désactive aussi le canal associé.
      qc.invalidateQueries({ queryKey: ['distribution-channels'] });
    },
  });
}
