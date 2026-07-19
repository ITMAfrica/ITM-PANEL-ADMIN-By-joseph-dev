'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { DistributionChannel, Subscriber } from '@/lib/types';

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

export function useUpdateDistributionChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { isActive?: boolean; name?: string };
    }) => {
      const res = await apiFetch(`/distribution-channels/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update channel');
      return res.json() as Promise<DistributionChannel>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['distribution-channels'] });
    },
  });
}

export function useCreateDistributionChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      tenantId: string;
      type?: string;
      icon?: string;
    }) => {
      const res = await apiFetch('/distribution-channels', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || 'Failed to create channel');
      }
      return res.json() as Promise<DistributionChannel>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['distribution-channels'] });
    },
  });
}

export function useChannelSubscribers(channelId: string | null, tenantId?: string) {
  return useQuery({
    queryKey: ['channel-subscribers', channelId, tenantId],
    queryFn: async (): Promise<Subscriber[]> => {
      const params = new URLSearchParams({ channelId: channelId! });
      if (tenantId) params.set('tenantId', tenantId);
      const res = await apiFetch(`/subscribers?${params}`);
      if (!res.ok) throw new Error('Failed to fetch subscribers');
      return res.json();
    },
    enabled: !!channelId && !!tenantId,
  });
}
