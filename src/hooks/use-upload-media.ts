'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiUploadMedia } from '@/lib/api-client';
import type { MediaItem } from '@/lib/types';

export function useUploadMedia(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File): Promise<MediaItem> => {
      const res = await apiUploadMedia(file, tenantId);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to upload media');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media', tenantId] });
    },
  });
}
