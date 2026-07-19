'use client';

import { useState } from 'react';
import {
  ViewShell,
  ViewTabPanel,
} from '@/components/view-layout';
import { UpgradePlanBanner } from '@/components/upgrade-plan-banner';
import { ReportsAnalyticsPanels } from '@/components/reports-analytics-panels';
import {
  PeriodRangePicker,
  type AnalyticsPeriod,
  type PeriodSelection,
} from '@/components/period-range-picker';
import { endOfDay, startOfDay, subDays } from 'date-fns';

function defaultRange(period: AnalyticsPeriod): { from: Date; to: Date } {
  const to = endOfDay(new Date());
  if (period === '7d') return { from: startOfDay(subDays(to, 6)), to };
  if (period === '90d') return { from: startOfDay(subDays(to, 89)), to };
  if (period === '1y') return { from: startOfDay(subDays(to, 364)), to };
  return { from: startOfDay(subDays(to, 29)), to };
}

export function ReportsView() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');
  const [range, setRange] = useState(() => defaultRange('30d'));

  const handlePeriodChange = (selection: PeriodSelection) => {
    setPeriod(selection.period);
    setRange({ from: selection.from, to: selection.to });
  };

  return (
    <ViewShell>
      <UpgradePlanBanner variant="reports" />
      <PeriodRangePicker value={period} onChange={handlePeriodChange} />
      <ViewTabPanel className="space-y-8">
        <ReportsAnalyticsPanels rangeFrom={range.from} rangeTo={range.to} />
      </ViewTabPanel>
    </ViewShell>
  );
}
