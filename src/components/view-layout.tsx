'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { EmptyStateIllustration } from '@/components/empty-state-illustration';

/** Brand tokens aligned with editorial-calendar-view */
export const brandColors = {
  dark: '#1D141F',
  yellow: '#E2F343',
  border: '#E8ECEF',
  muted: '#8B939E',
  surface: '#F8FAFB',
  gridTint: '#EEF4F8',
} as const;

export const viewPageClasses = {
  wrapper: 'space-y-5 -mx-1',
  tabPanel: 'space-y-4',
  header: 'flex flex-col sm:flex-row sm:items-center justify-between gap-3',
  title: 'text-xl font-bold',
  subtitle: 'text-sm text-muted-foreground',
  primaryBtn:
    'h-9 gap-1.5 rounded-lg font-semibold shadow-sm hover:opacity-90',
  outlineBtn:
    'h-9 shrink-0 border-[#E8ECEF] bg-white text-sm font-normal text-[#1D141F] hover:bg-[#F8FAFB]',
  outlineIconBtn: 'h-9 w-9 shrink-0 border-[#E8ECEF] bg-white',
  controlGroup: 'flex items-center gap-1 bg-muted/50 rounded-lg p-1',
  controlBtn: 'h-7 w-7',
  pageCard: 'overflow-hidden dark-card-glow',
  pageCardContent: 'p-3 sm:p-4',
  listItem: 'rounded-xl border bg-card hover:shadow-md transition-all dark-card-glow',
  filterChip: 'px-2 py-1 rounded-md bg-muted/30 text-xs font-medium transition-colors',
  filterChipActive:
    'px-2 py-1 rounded-md bg-[#1D141F] text-[#E2F343] text-xs font-medium shadow-sm',
  statCard: 'overflow-hidden dark-card-glow',
  statCardShell:
    'relative flex items-center gap-3 rounded-xl glass-card p-3.5 shadow-sm transition-shadow hover:shadow-md dark-card-glow',
  statCardSimple:
    'rounded-xl glass-card px-4 py-3 shadow-sm dark-card-glow flex flex-col items-center justify-center text-center',
  iconBox:
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
  contentSurface: 'rounded-lg border border-border/60 bg-white overflow-hidden',
  contentSurfaceLg: 'overflow-hidden rounded-xl border border-[#E8ECEF] bg-white shadow-sm',
  searchInput: 'h-9 rounded-lg border-[#E8ECEF] bg-white pl-9 text-sm',
  subNavTab:
    'relative shrink-0 px-4 py-3 text-sm transition-colors whitespace-nowrap',
  subNavTabActive:
    'font-bold text-foreground after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:bg-foreground after:rounded-full',
  subNavTabInactive: 'font-normal text-muted-foreground hover:text-foreground',
} as const;

export const pageContainerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

export const pageItemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
};

export type ViewTab<T extends string = string> = {
  id: T;
  label: string;
  icon?: React.ReactNode;
};

/** Outer shell — motion wrapper like EditorialCalendarView */
export function ViewShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(viewPageClasses.wrapper, className)}
    >
      {children}
    </motion.div>
  );
}

/** Horizontal tab navigation — EditorialSubNav pattern */
export function ViewSubNav<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  trailing,
  className,
}: {
  tabs: ViewTab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-end justify-between gap-4 border-b border-border/60', className)}>
      <nav className="flex items-end gap-0 overflow-x-auto scrollbar-none -mb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              viewPageClasses.subNavTab,
              activeTab === tab.id ? viewPageClasses.subNavTabActive : viewPageClasses.subNavTabInactive
            )}
          >
            <span className="inline-flex items-center gap-1.5">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
      {trailing}
    </div>
  );
}

/** Tab content panel */
export function ViewTabPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(viewPageClasses.tabPanel, className)}>{children}</div>;
}

/** Toolbar row — search/filters left, actions right */
export function ViewToolbar({
  children,
  actions,
  className,
}: {
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between',
        className
      )}
    >
      {children != null && (
        <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
      )}
      {actions != null && (
        <div className="flex shrink-0 items-center gap-2 self-end xl:self-auto">{actions}</div>
      )}
    </div>
  );
}

/** Standardized search input */
export function ViewSearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn('relative min-w-[140px] max-w-[200px] flex-1 sm:max-w-xs', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B939E]" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={viewPageClasses.searchInput}
      />
    </div>
  );
}

/** Brand CTA button — dark bg + yellow text */
export function BrandPrimaryButton({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      size="sm"
      className={cn(viewPageClasses.primaryBtn, className)}
      style={{ backgroundColor: brandColors.dark, color: brandColors.yellow }}
      {...props}
    >
      {children}
    </Button>
  );
}

/** Outline toolbar button */
export function ViewOutlineButton({
  className,
  icon,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { icon?: React.ReactNode }) {
  return (
    <Button
      variant="outline"
      size={children ? 'sm' : 'icon'}
      className={cn(
        children ? viewPageClasses.outlineBtn : viewPageClasses.outlineIconBtn,
        children && 'gap-2 px-3',
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </Button>
  );
}

/** White bordered content container */
export function ViewContentSurface({
  children,
  className,
  large,
}: {
  children: React.ReactNode;
  className?: string;
  large?: boolean;
}) {
  return (
    <div className={cn(large ? viewPageClasses.contentSurfaceLg : viewPageClasses.contentSurface, className)}>
      {children}
    </div>
  );
}

/** Empty state inside content surface */
export function ViewEmptyState({
  icon: Icon,
  title,
  description,
  className,
  illustrationId,
  series2Id,
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  className?: string;
  illustrationId?: import('@/lib/itm-illustrations').ItmIllustrationId;
  series2Id?: import('@/lib/itm-illustrations-2').ItmIllustration2Id;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {Icon && !illustrationId && !series2Id ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50">
          <Icon className="h-7 w-7 text-muted-foreground" />
        </div>
      ) : (
        <div className="mb-4">
          <EmptyStateIllustration illustrationId={illustrationId} series2Id={series2Id} />
        </div>
      )}
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground/70">{description}</p>}
    </div>
  );
}

/** Coming soon placeholder */
export function ViewPlaceholderPanel({
  title,
  description,
  illustrationId = 'waiting',
  series2Id,
}: {
  title: string;
  description?: string;
  illustrationId?: import('@/lib/itm-illustrations').ItmIllustrationId;
  series2Id?: import('@/lib/itm-illustrations-2').ItmIllustration2Id;
}) {
  return (
    <ViewContentSurface className="px-6 py-16 text-center">
      <div className="mb-4 flex justify-center">
        <EmptyStateIllustration
          illustrationId={illustrationId}
          series2Id={series2Id}
          size="md"
        />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground/70">{description}</p>}
    </ViewContentSurface>
  );
}

/** Stats grid — optional section inside tab panel */
export function ViewStatGrid({
  children,
  className,
  cols = 4,
}: {
  children: React.ReactNode;
  className?: string;
  cols?: 2 | 3 | 4;
}) {
  const colClass =
    cols === 2
      ? 'grid-cols-2'
      : cols === 3
        ? 'grid-cols-1 sm:grid-cols-3'
        : 'grid-cols-2 lg:grid-cols-4';
  return <div className={cn('grid gap-3', colClass, className)}>{children}</div>;
}

/** Preset accent classes for colored stat/chart icon boxes */
export const statAccentVariants = {
  blue: 'bg-blue-500/15 text-blue-600 border-blue-500/20',
  amber: 'bg-amber-500/15 text-amber-600 border-amber-500/20',
  cyan: 'bg-cyan-500/15 text-cyan-600 border-cyan-500/20',
  rose: 'bg-rose-500/15 text-rose-600 border-rose-500/20',
  slate: 'bg-slate-500/15 text-slate-600 border-slate-500/20',
  violet:
    'bg-[oklch(0.55_0.18_250/0.15)] text-[oklch(0.55_0.18_250)] border-[oklch(0.55_0.18_250/0.2)]',
} as const;

/** Full-card tone — background, border, and value text per accent */
const statCardToneVariants: Record<
  StatAccentVariant,
  { card: string; value: string; label: string }
> = {
  blue: {
    card: 'bg-blue-500/8 border-blue-500/30 hover:bg-blue-500/12',
    value: 'text-blue-700',
    label: 'text-blue-600/80',
  },
  amber: {
    card: 'bg-amber-500/8 border-amber-500/30 hover:bg-amber-500/12',
    value: 'text-amber-700',
    label: 'text-amber-600/80',
  },
  cyan: {
    card: 'bg-cyan-500/8 border-cyan-500/30 hover:bg-cyan-500/12',
    value: 'text-cyan-700',
    label: 'text-cyan-600/80',
  },
  rose: {
    card: 'bg-rose-500/8 border-rose-500/30 hover:bg-rose-500/12',
    value: 'text-rose-700',
    label: 'text-rose-600/80',
  },
  slate: {
    card: 'bg-slate-500/8 border-slate-500/30 hover:bg-slate-500/12',
    value: 'text-slate-700',
    label: 'text-slate-600/80',
  },
  violet: {
    card: 'bg-[oklch(0.55_0.18_250/0.08)] border-[oklch(0.55_0.18_250/0.3)] hover:bg-[oklch(0.55_0.18_250/0.12)]',
    value: 'text-[oklch(0.45_0.18_250)]',
    label: 'text-[oklch(0.5_0.16_250/0.8)]',
  },
};

export type StatAccentVariant = keyof typeof statAccentVariants;

/** Colored icon container — shared by ViewStatCard and chart headers */
export function ViewIconBox({
  icon: Icon,
  accent,
  accentVariant,
  className,
  iconClassName,
  size = 'md',
}: {
  icon: React.ElementType;
  accent?: string;
  accentVariant?: StatAccentVariant;
  className?: string;
  iconClassName?: string;
  size?: 'md' | 'sm';
}) {
  const resolvedAccent =
    accent ?? (accentVariant ? statAccentVariants[accentVariant] : undefined);

  return (
    <div
      className={cn(
        size === 'md'
          ? viewPageClasses.iconBox
          : 'flex shrink-0 items-center justify-center rounded-xl border p-2',
        resolvedAccent,
        className
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0', iconClassName)} />
    </div>
  );
}

export function ViewStatCard({
  label,
  value,
  icon: Icon,
  accent,
  accentVariant,
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
  accent?: string;
  accentVariant?: StatAccentVariant;
  className?: string;
}) {
  const tone = accentVariant ? statCardToneVariants[accentVariant] : undefined;
  const shellClass = Icon ? viewPageClasses.statCardShell : viewPageClasses.statCardSimple;

  return (
    <div className={cn(shellClass, tone?.card, 'transition-colors', className)}>
      {Icon && <ViewIconBox icon={Icon} accent={accent} accentVariant={accentVariant} />}
      <div className={cn('min-w-0', Icon ? 'flex-1' : 'w-full')}>
        <div
          className={cn(
            'text-2xl font-bold leading-none tracking-tight',
            tone?.value ?? 'text-foreground'
          )}
        >
          {value}
        </div>
        <p className={cn('mt-1.5 text-xs', tone?.label ?? 'text-muted-foreground')}>{label}</p>
      </div>
    </div>
  );
}

/** Filter chips row */
export function ViewFilterRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('flex flex-wrap items-center gap-1.5', className)}>{children}</div>;
}

/** @deprecated Use ViewShell — kept for gradual migration */
export function ViewPage({
  children,
  className,
  animate = true,
}: {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}) {
  if (animate) {
    return <ViewShell className={className}>{children}</ViewShell>;
  }
  return <div className={cn(viewPageClasses.wrapper, className)}>{children}</div>;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(viewPageClasses.header, className)}>
      <div>
        <h2 className={viewPageClasses.title}>{title}</h2>
        {subtitle != null && subtitle !== '' && (
          <p className={viewPageClasses.subtitle}>{subtitle}</p>
        )}
      </div>
      {actions}
    </div>
  );
}

export function PageSection({
  children,
  className,
  animate = true,
}: {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}) {
  if (animate) {
    return (
      <motion.div variants={pageItemVariants} className={className}>
        {children}
      </motion.div>
    );
  }
  return <div className={className}>{children}</div>;
}

/** @deprecated Use BrandPrimaryButton */
export function PrimaryActionButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return <BrandPrimaryButton className={className} {...props} />;
}

export function ControlGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(viewPageClasses.controlGroup, className)}>{children}</div>;
}

export function FilterChip({
  active,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        active ? viewPageClasses.filterChipActive : viewPageClasses.filterChip,
        'whitespace-nowrap',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function PageCard({
  children,
  className,
  contentClassName,
}: {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card className={cn(viewPageClasses.pageCard, className)}>
      <CardContent className={cn(viewPageClasses.pageCardContent, contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
