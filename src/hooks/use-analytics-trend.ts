'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';

export const TREND_MODES = ['volume', 'reach', 'engagement', 'quality'] as const;
export const TREND_RESOURCES = [
  'all',
  'newsletters',
  'articles',
  'announcements',
  'campaigns',
] as const;

export type TrendMode = (typeof TREND_MODES)[number];
export type TrendResource = (typeof TREND_RESOURCES)[number];

export type AnalyticsTrendsResponse = {
  resource: TrendResource;
  mode: TrendMode;
  weeks: number;
  granularity?: 'day' | 'week' | 'month';
  from?: string;
  to?: string;
  available: boolean;
  unavailableReason?: string;
  keys: { primary: string; secondary: string };
  series: Array<{ name: string; primary: number; secondary: number }>;
  source: string;
};

async function fetchAnalyticsTrends(params: {
  tenantId: string;
  resource: TrendResource;
  mode: TrendMode;
  weeks?: number;
  from?: string;
  to?: string;
  locale?: string;
}): Promise<AnalyticsTrendsResponse> {
  const query = new URLSearchParams({
    tenantId: params.tenantId,
    resource: params.resource,
    mode: params.mode,
  });
  if (params.from && params.to) {
    query.set('from', params.from);
    query.set('to', params.to);
  } else if (params.weeks) {
    query.set('weeks', String(params.weeks));
  }
  if (params.locale) query.set('locale', params.locale);

  const res = await apiFetch(`/dashboard/trends?${query}`);
  if (!res.ok) throw new Error('Failed to fetch analytics trends');
  return res.json();
}

export function useAnalyticsTrend({
  tenantId,
  resource,
  mode,
  weeks,
  from,
  to,
  locale,
  enabled = true,
}: {
  tenantId: string;
  resource: TrendResource;
  mode: TrendMode;
  weeks?: number;
  from?: string;
  to?: string;
  locale?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['dashboard-trends', tenantId, resource, mode, weeks ?? null, from ?? null, to ?? null, locale ?? null],
    queryFn: () =>
      fetchAnalyticsTrends({ tenantId, resource, mode, weeks, from, to, locale }),
    enabled: !!tenantId && enabled !== false,
  });
}
