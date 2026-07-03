'use client';

import { useState } from 'react';
import {
  ViewShell,
  ViewSubNav,
  ViewTabPanel,
  type ViewTab,
} from '@/components/view-layout';
import { AllResourceAnalyticsPanels } from '@/components/resource-analytics';
import { UpgradePlanBanner } from '@/components/upgrade-plan-banner';

const periods = [
  { key: '7d', label: '7d' },
  { key: '30d', label: '30d' },
  { key: '90d', label: '90d' },
  { key: '1y', label: '1a' },
] as const;

type Period = (typeof periods)[number]['key'];

export function StatisticsView() {
  const [period, setPeriod] = useState<Period>('30d');
  const weeksCount = period === '7d' ? 7 : 12;

  const periodTabs: ViewTab<Period>[] = periods.map((p) => ({
    id: p.key,
    label: p.label,
  }));

  return (
    <ViewShell>
      <UpgradePlanBanner variant="statistics" />
      <ViewSubNav tabs={periodTabs} activeTab={period} onTabChange={setPeriod} />
      <ViewTabPanel className="space-y-8">
        <AllResourceAnalyticsPanels weeksCount={weeksCount} />
      </ViewTabPanel>
    </ViewShell>
  );
}
