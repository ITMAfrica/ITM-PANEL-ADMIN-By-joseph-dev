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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['content'] });
      qc.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}

export function useContentById(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['content', 'detail', id],
    queryFn: async () => {
      const res = await apiFetch(`/content/${id}`);
      if (!res.ok) throw new Error('Failed to fetch content');
      return res.json() as Promise<import('@/lib/types').ContentDetail>;
    },
    enabled: !!id && enabled,
  });
}

export function useUpdateContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Record<string, unknown>;
    }) => {
      const res = await apiFetch(`/content/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update content');
      return res.json() as Promise<import('@/lib/types').ContentDetail>;
    },
    onSuccess: (_data, variables) => {
      invalidateContentQueries(qc);
      qc.invalidateQueries({ queryKey: ['content', 'detail', variables.id] });
    },
  });
}

function invalidateContentQueries(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['content'] });
  qc.invalidateQueries({ queryKey: ['dashboard-summary'] });
}

export function useApproveContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/content/${id}/approve`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to approve content');
      return res.json() as Promise<ContentItem>;
    },
    onSuccess: () => invalidateContentQueries(qc),
  });
}

export function useRejectContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await apiFetch(`/content/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error('Failed to reject content');
      return res.json() as Promise<ContentItem>;
    },
    onSuccess: () => invalidateContentQueries(qc),
  });
}

export function useSubmitContentForReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/content/${id}/submit-for-review`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to submit content for review');
      return res.json() as Promise<ContentItem>;
    },
    onSuccess: () => invalidateContentQueries(qc),
  });
}

export function useDeleteContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/content/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete content');
      return res.json() as Promise<{ ok: boolean }>;
    },
    onSuccess: (_data, id) => {
      invalidateContentQueries(qc);
      qc.removeQueries({ queryKey: ['content', 'detail', id] });
    },
  });
}

export function useScheduledContent(tenantId: string) {
  return useContent({ tenantId, status: 'scheduled', enabled: !!tenantId });
}

export function useSendNewsletter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (contentId: string) => {
      const res = await apiFetch(`/newsletters/${contentId}/send`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to send newsletter');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['content'] });
      qc.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}

export function useNewsletterSends(contentId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['newsletter-sends', contentId],
    queryFn: async () => {
      const res = await apiFetch(`/newsletters/${contentId}/sends`);
      if (!res.ok) throw new Error('Failed to fetch newsletter sends');
      return (await res.json()) as import('@/lib/types').NewsletterSendsResponse;
    },
    enabled: !!contentId && enabled,
  });
}

export function useSubscriberCount(tenantId: string) {
  return useQuery({
    queryKey: ['subscriber-count', tenantId],
    queryFn: async () => {
      const params = new URLSearchParams({ tenantId });
      const res = await apiFetch(`/subscribers/count?${params}`);
      if (!res.ok) throw new Error('Failed to fetch subscriber count');
      const data = (await res.json()) as { total: number };
      return data.total;
    },
    enabled: !!tenantId,
  });
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
