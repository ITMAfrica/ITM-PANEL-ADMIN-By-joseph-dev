'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';

interface WidgetTokenResponse {
  token: string;
  channelId: string;
}

/**
 * Creates (or retrieves existing) an opaque widget token for a channel.
 * The token replaces the raw channelId in the public <script> tag URL,
 * preventing exposure of internal database identifiers.
 */
export function useCreateWidgetToken() {
  return useMutation({
    mutationFn: async ({
      channelId,
      tenantId,
    }: {
      channelId: string;
      tenantId: string;
    }): Promise<WidgetTokenResponse> => {
      const res = await apiFetch('/widgets/token', {
        method: 'POST',
        body: JSON.stringify({ channelId, tenantId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || 'Failed to create widget token');
      }
      return res.json();
    },
  });
}

/**
 * Deletes (invalidates) the widget token for a channel,
 * allowing a new one to be generated.
 */
export function useDeleteWidgetToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      channelId,
      tenantId,
    }: {
      channelId: string;
      tenantId: string;
    }) => {
      const res = await apiFetch('/widgets/token', {
        method: 'DELETE',
        body: JSON.stringify({ channelId, tenantId }),
      });
      if (!res.ok) throw new Error('Failed to delete widget token');
      return res.json() as Promise<{ ok: boolean }>;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: ['widget-token', variables.channelId, variables.tenantId],
      });
    },
  });
}
