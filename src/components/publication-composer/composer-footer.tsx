'use client';

import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { CalendarClock, ChevronDown, FileText, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { BRAND_DARK, BRAND_YELLOW } from '@/lib/editorial-design';
import { useTranslation } from '@/lib/i18n';

interface ComposerFooterProps {
  scheduledAt: Date;
  calendarOpen: boolean;
  onCalendarOpenChange: (open: boolean) => void;
  onScheduledAtChange: (date: Date) => void;
  onCancel: () => void;
  onSchedule: (mode: 'now' | 'scheduled' | 'draft') => void;
  isSubmitting?: boolean;
}

export function ComposerFooter({
  scheduledAt,
  calendarOpen,
  onCalendarOpenChange,
  onScheduledAtChange,
  onCancel,
  onSchedule,
  isSubmitting = false,
}: ComposerFooterProps) {
  const { t, locale } = useTranslation();
  const pc = t.publicationComposer;
  const dateLocale = locale === 'fr' ? fr : enUS;

  const formattedSchedule = format(
    scheduledAt,
    locale === 'fr' ? 'd MMMM yyyy HH:mm' : 'MMMM d, yyyy HH:mm',
    { locale: dateLocale }
  );

  return (
    <footer className="relative z-10 flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[#E8ECEF] bg-white px-5 py-4">
      <Button
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
        className="h-10 border-[#E8ECEF] bg-white px-5 text-sm font-medium text-[#1D141F]"
      >
        {pc.cancel}
      </Button>

      <div className="flex flex-wrap items-center gap-2">
        <Popover open={calendarOpen} onOpenChange={onCalendarOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-10 gap-2 border-[#E8ECEF] bg-white px-4 text-sm font-normal text-[#1D141F]"
            >
              {formattedSchedule}
              <ChevronDown className="h-4 w-4 text-[#8B939E]" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={scheduledAt}
              onSelect={(date) => {
                if (!date) return;
                const next = new Date(date);
                const hours = scheduledAt.getHours();
                const minutes = scheduledAt.getMinutes();
                if (Number.isNaN(hours) || Number.isNaN(minutes)) return;
                next.setHours(hours, minutes, 0, 0);
                onScheduledAtChange(next);
              }}
              locale={dateLocale}
            />
            <div className="border-t p-3">
              <label className="mb-1 block text-xs font-medium text-[#5C6470]">{pc.time}</label>
              <input
                type="time"
                value={format(scheduledAt, 'HH:mm')}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!/^\d{2}:\d{2}$/.test(value)) return;
                  const hours = Number(value.slice(0, 2));
                  const minutes = Number(value.slice(3, 5));
                  if (hours > 23 || minutes > 59) return;
                  const next = new Date(scheduledAt);
                  next.setHours(hours, minutes, 0, 0);
                  if (!Number.isNaN(next.getTime())) onScheduledAtChange(next);
                }}
                className="w-full rounded-md border border-[#E8ECEF] px-2 py-1.5 text-sm"
              />
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex overflow-hidden rounded-lg shadow-sm">
          <Button
            onClick={() => onSchedule('scheduled')}
            disabled={isSubmitting}
            className="h-10 rounded-none rounded-l-lg px-5 text-sm font-semibold hover:opacity-90 disabled:opacity-70"
            style={{ backgroundColor: BRAND_DARK, color: BRAND_YELLOW }}
          >
            {isSubmitting ? pc.submitting : pc.schedule}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={isSubmitting}
                className="h-10 rounded-none rounded-r-lg border-l border-[#E2F343]/30 px-2 hover:opacity-90 disabled:opacity-70"
                style={{ backgroundColor: BRAND_DARK, color: BRAND_YELLOW }}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-56 rounded-xl border-[#E8ECEF] p-1.5 shadow-lg shadow-black/5"
            >
              <DropdownMenuLabel className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-[#8B939E]">
                {pc.actions}
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onSchedule('scheduled')}
                className="gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-[#1D141F] hover:bg-[#F8FAFB]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E2F343]/40 bg-[#E2F343]/20 text-[#1D141F]">
                  <CalendarClock className="h-4 w-4" />
                </span>
                {pc.scheduleLater}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSchedule('now')}
                className="gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-[#1D141F] hover:bg-[#F8FAFB]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1D141F] text-[#E2F343]">
                  <Rocket className="h-4 w-4" />
                </span>
                {pc.publishNow}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1.5 bg-[#E8ECEF]" />
              <DropdownMenuItem
                onClick={() => onSchedule('draft')}
                className="gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-[#5C6470] hover:bg-[#F8FAFB]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E8ECEF] bg-[#F5F7F9] text-[#5C6470]">
                  <FileText className="h-4 w-4" />
                </span>
                {pc.saveDraft}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </footer>
  );
}
