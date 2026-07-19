'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { editorialClasses, editorialPrimaryStyle } from '@/lib/editorial-design';
import { EmptyStateIllustration } from '@/components/empty-state-illustration';

export function EditorialPageShell({
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
      className={cn(editorialClasses.pageShell, className)}
    >
      {children}
    </motion.div>
  );
}

export function EditorialPrimaryButton({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      size="sm"
      className={cn(editorialClasses.primaryBtn, className)}
      style={editorialPrimaryStyle}
      {...props}
    >
      {children}
    </Button>
  );
}

export function EditorialPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(editorialClasses.panel, className)}>{children}</div>;
}

export function EditorialSearchInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <div className="relative min-w-[140px] flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B939E]" />
      <Input className={cn(editorialClasses.searchInput, className)} {...props} />
    </div>
  );
}

export function EditorialEmptyState({
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
    <div className={cn(editorialClasses.emptyState, className)}>
      {illustrationId || series2Id ? (
        <div className="mb-4 flex justify-center">
          <EmptyStateIllustration
            illustrationId={illustrationId}
            series2Id={series2Id}
            size="sm"
          />
        </div>
      ) : Icon ? (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E8ECEF] bg-[#F5F7F9]">
          <Icon className="h-7 w-7 text-[#8B939E]" />
        </div>
      ) : null}
      <p className="text-sm font-medium text-[#5C6470]">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-[#8B939E]">{description}</p>
      )}
    </div>
  );
}

export function EditorialStatCard({
  title,
  value,
  icon: Icon,
  className,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ElementType;
  className?: string;
}) {
  return (
    <div className={cn(editorialClasses.statCard, 'p-4', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#5C6470]">{title}</p>
          <p className="text-2xl font-extrabold tracking-tight text-[#1D141F]">{value}</p>
        </div>
        <div className={editorialClasses.iconBoxSm}>
          <Icon className={cn('h-4 w-4', editorialClasses.iconColor)} />
        </div>
      </div>
    </div>
  );
}

export function EditorialPageHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-3', className)}>
      <div>
        <h2 className={editorialClasses.pageTitle}>{title}</h2>
        {subtitle && <p className={editorialClasses.subtitle}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export { editorialClasses, editorialPrimaryStyle };
