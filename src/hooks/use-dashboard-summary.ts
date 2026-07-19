'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type {
  CampaignMetrics,
  ChannelMetrics,
  ContentTypeMetrics,
  EditorialCalendarMetrics,
  SchedulingMetrics,
} from '@/lib/dashboard-metrics';

export interface ApprovalQueueItem {
  id: string;
  type: string;
  title: string;
  authorId: string;
  updatedAt: string;
  status: string;
}

export interface DashboardSummary {
  tenantId: string;
  newsletters: ContentTypeMetrics;
  articles: ContentTypeMetrics;
  announcements: ContentTypeMetrics;
  campaigns: CampaignMetrics;
  editorialCalendar: EditorialCalendarMetrics;
  scheduling: SchedulingMetrics & { nextSendAt: string | null };
  channels: ChannelMetrics;
  approvalQueue: ApprovalQueueItem[];
}

async function fetchDashboardSummary(tenantId: string): Promise<DashboardSummary> {
  const params = new URLSearchParams({ tenantId });
  const res = await apiFetch(`/dashboard/summary?${params}`);
  if (!res.ok) throw new Error('Failed to fetch dashboard summary');
  return res.json();
}

export function useDashboardSummary(tenantId: string) {
  return useQuery({
    queryKey: ['dashboard-summary', tenantId],
    queryFn: () => fetchDashboardSummary(tenantId),
    enabled: !!tenantId,
  });
}
