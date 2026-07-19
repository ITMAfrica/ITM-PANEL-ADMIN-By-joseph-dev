'use client';

import { useMemo, useState } from 'react';
import {
  differenceInCalendarDays,
  endOfDay,
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Calendar, CalendarDayButton } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export type AnalyticsPeriod = '7d' | '30d' | '90d' | '1y';

type PresetId =
  | 'yesterday'
  | 'lastWeek'
  | 'currentMonth'
  | 'last30Days'
  | 'previousMonth'
  | 'last3Months'
  | 'last6Months'
  | 'last12Months';

type PresetDef = {
  id: PresetId;
  period: AnalyticsPeriod;
  range: () => DateRange;
};

function rangeDays(from: Date, to: Date): number {
  return differenceInCalendarDays(startOfDay(to), startOfDay(from)) + 1;
}

export function periodFromRange(from: Date, to: Date): AnalyticsPeriod {
  const days = rangeDays(from, to);
  if (days <= 7) return '7d';
  if (days <= 30) return '30d';
  if (days <= 90) return '90d';
  return '1y';
}

function defaultRangeForPeriod(period: AnalyticsPeriod): DateRange {
  const to = endOfDay(new Date());
  if (period === '7d') return { from: startOfDay(subDays(to, 6)), to };
  if (period === '90d') return { from: startOfDay(subDays(to, 89)), to };
  if (period === '1y') return { from: startOfDay(subDays(to, 364)), to };
  return { from: startOfDay(subDays(to, 29)), to };
}

function buildPresets(): PresetDef[] {
  const today = new Date();
  return [
    {
      id: 'yesterday',
      period: '7d',
      range: () => {
        const day = subDays(today, 1);
        return { from: startOfDay(day), to: endOfDay(day) };
      },
    },
    {
      id: 'lastWeek',
      period: '7d',
      range: () => ({
        from: startOfDay(subDays(today, 7)),
        to: endOfDay(subDays(today, 1)),
      }),
    },
    {
      id: 'currentMonth',
      period: '30d',
      range: () => ({
        from: startOfMonth(today),
        to: endOfDay(today),
      }),
    },
    {
      id: 'last30Days',
      period: '30d',
      range: () => ({
        from: startOfDay(subDays(today, 29)),
        to: endOfDay(today),
      }),
    },
    {
      id: 'previousMonth',
      period: '30d',
      range: () => {
        const prev = subMonths(today, 1);
        return { from: startOfMonth(prev), to: endOfMonth(prev) };
      },
    },
    {
      id: 'last3Months',
      period: '90d',
      range: () => ({
        from: startOfDay(subMonths(today, 3)),
        to: endOfDay(today),
      }),
    },
    {
      id: 'last6Months',
      period: '1y',
      range: () => ({
        from: startOfDay(subMonths(today, 6)),
        to: endOfDay(today),
      }),
    },
    {
      id: 'last12Months',
      period: '1y',
      range: () => ({
        from: startOfDay(subMonths(today, 12)),
        to: endOfDay(today),
      }),
    },
  ];
}

function rangesEqual(a: DateRange | undefined, b: DateRange | undefined): boolean {
  if (!a?.from || !a?.to || !b?.from || !b?.to) return false;
  return (
    startOfDay(a.from).getTime() === startOfDay(b.from).getTime() &&
    startOfDay(a.to).getTime() === startOfDay(b.to).getTime()
  );
}

export type PeriodSelection = {
  period: AnalyticsPeriod;
  from: Date;
  to: Date;
};

export function PeriodRangePicker({
  value,
  onChange,
  className,
}: {
  value: AnalyticsPeriod;
  onChange: (selection: PeriodSelection) => void;
  className?: string;
}) {
  const { t, locale } = useTranslation();
  const dateLocale = locale === 'fr' ? fr : enUS;
  const presets = useMemo(() => buildPresets(), []);
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange>(() => defaultRangeForPeriod(value));

  const label = useMemo(() => {
    if (!range.from || !range.to) return t.periodPicker.mainPeriod;
    const fromLabel = format(range.from, 'd MMM yyyy', { locale: dateLocale });
    const toLabel = format(range.to, 'd MMM yyyy', { locale: dateLocale });
    return `${fromLabel} - ${toLabel}`;
  }, [range, dateLocale, t.periodPicker.mainPeriod]);

  const activePresetId = useMemo(() => {
    return presets.find((p) => rangesEqual(p.range(), range))?.id;
  }, [presets, range]);

  const applyRange = (next: DateRange | undefined, period?: AnalyticsPeriod) => {
    if (!next?.from) return;
    const resolved: DateRange = {
      from: startOfDay(next.from),
      to: endOfDay(next.to ?? next.from),
    };
    setRange(resolved);
    if (resolved.from && resolved.to) {
      onChange({
        period: period ?? periodFromRange(resolved.from, resolved.to),
        from: resolved.from,
        to: resolved.to,
      });
    }
  };

  const handlePreset = (preset: PresetDef) => {
    applyRange(preset.range(), preset.period);
    setOpen(false);
  };

  const presetLabel = (id: PresetId) => t.periodPicker[id];

  return (
    <div className={cn('ml-auto flex w-fit flex-col items-end gap-1.5', className)}>
      <span className="text-sm text-[#8B939E]">{t.periodPicker.mainPeriod}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex h-9 max-w-full items-center gap-2 rounded-lg border border-[#E8ECEF] bg-[#F4F6F8] px-3 text-sm text-[#1D141F]',
              'hover:bg-[#EEF1F4] transition-colors'
            )}
          >
            <CalendarIcon className="h-4 w-4 shrink-0 text-[#8B939E]" />
            <span className="truncate font-medium">{label}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-auto max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[#E8ECEF] p-0 shadow-lg"
        >
          <div className="flex flex-col sm:flex-row">
            <div className="border-b border-[#E8ECEF] p-3 sm:border-b-0 sm:border-r">
              <Calendar
                mode="range"
                numberOfMonths={2}
                selected={range}
                onSelect={(next) => applyRange(next)}
                locale={dateLocale}
                defaultMonth={range.from ?? new Date()}
                className="[--cell-size:2.25rem]"
                classNames={{
                  range_start: 'rounded-l-md bg-[#EEF1F4]',
                  range_end: 'rounded-r-md bg-[#EEF1F4]',
                  range_middle: 'bg-[#EEF1F4] rounded-none',
                  today: 'rounded-md bg-transparent',
                }}
                components={{
                  DayButton: ({ className: dayClass, ...props }) => (
                    <CalendarDayButton
                      {...props}
                      className={cn(
                        'data-[selected-single=true]:bg-[#1D141F] data-[selected-single=true]:text-white',
                        'data-[range-start=true]:bg-[#1D141F] data-[range-start=true]:text-white',
                        'data-[range-end=true]:bg-[#1D141F] data-[range-end=true]:text-white',
                        'data-[range-middle=true]:bg-[#EEF1F4] data-[range-middle=true]:text-[#1D141F]',
                        'hover:bg-[#F4F6F8]',
                        dayClass
                      )}
                    />
                  ),
                }}
              />
            </div>
            <div className="flex w-full flex-col gap-0.5 p-2 sm:w-48">
              {presets.map((preset) => {
                const active = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePreset(preset)}
                    className={cn(
                      'flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors',
                      active
                        ? 'bg-[#EEF1F4] font-medium text-[#1D141F]'
                        : 'text-[#3A3F45] hover:bg-[#F4F6F8]'
                    )}
                  >
                    <span className="truncate">{presetLabel(preset.id)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
