'use client';

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { ContentItem } from '@/lib/types';

const EMPTY_CONTENT: ContentItem[] = [];

export interface ContentFilters {
  tenantId: string;
  type?: string;
  status?: string;
  search?: string;
  enabled?: boolean;
}

async function fetchContent(filters: ContentFilters): Promise<ContentItem[]> {
  const params = new URLSearchParams({ tenantId: filters.tenantId });
  if (filters.type) params.set('type', filters.type);
  if (filters.status) params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);
  const res = await apiFetch(`/content?${params}`);
  if (!res.ok) throw new Error('Failed to fetch content');
  return res.json();
}

export function useContent(filters: ContentFilters) {
  const { tenantId, type, status, search, enabled = true } = filters;

  return useQuery({
    queryKey: ['content', tenantId, type ?? null, status ?? null, search ?? null],
    queryFn: () => fetchContent(filters),
    enabled: !!tenantId && enabled !== false,
  });
}

export function useCreateContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiFetch('/content', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create content');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['content'] }),
  });
}

export function useScheduledContent(tenantId: string) {
  return useContent({ tenantId, status: 'scheduled', enabled: !!tenantId });
}

export function useCalendarEvents(tenantId: string) {
  const { data: scheduledData, ...rest } = useScheduledContent(tenantId);
  const { data: publishedData } = useContent({ tenantId, status: 'published', enabled: !!tenantId });
  const scheduled = scheduledData ?? EMPTY_CONTENT;
  const published = publishedData ?? EMPTY_CONTENT;

  const events = useMemo(
    () => [
      ...scheduled.map((c) => ({
        id: c.id,
        title: c.title,
        date: c.scheduledAt ?? c.createdAt,
        type: 'publication' as const,
        status: 'scheduled' as const,
        color: '#3b82f6',
        contentId: c.id,
        tenantId: c.tenantId,
      })),
      ...published
        .filter((c) => c.publishedAt)
        .map((c) => ({
          id: `pub-${c.id}`,
          title: c.title,
          date: c.publishedAt!,
          type: 'publication' as const,
          status: 'published' as const,
          color: '#8B939E',
          contentId: c.id,
          tenantId: c.tenantId,
        })),
    ],
    [scheduled, published]
  );

  return { data: events, scheduled, published, ...rest };
}
