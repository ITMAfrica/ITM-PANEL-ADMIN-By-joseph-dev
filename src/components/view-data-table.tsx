'use client';

import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ViewContentSurface } from '@/components/view-layout';
import { EmptyStateIllustration } from '@/components/empty-state-illustration';

export const tableHeadClass = 'text-xs font-semibold text-muted-foreground';
export const tableRowClass = 'hover:bg-muted/30 border-b border-border/60 cursor-pointer';
export const tableRowTransparentClass =
  'border-0 cursor-pointer hover:opacity-90 transition-opacity';
export const tableCellClass = 'text-sm py-3';

/** Semi-transparent column tints — Metricool-style */
export const tableColumnTints = {
  subtle: 'bg-foreground/[0.04]',
  blue: 'bg-blue-500/10',
  violet: 'bg-violet-500/10',
  cyan: 'bg-cyan-500/10',
  amber: 'bg-amber-500/10',
  rose: 'bg-rose-500/10',
  slate: 'bg-slate-500/8',
  emerald: 'bg-emerald-500/10',
} as const;

export type TableColumnTint = keyof typeof tableColumnTints;

const COLUMN_TINT_CYCLE: TableColumnTint[] = [
  'subtle',
  'blue',
  'violet',
  'cyan',
  'amber',
  'rose',
  'emerald',
  'slate',
];

type ViewDataTableContextValue = {
  transparent: boolean;
};

const ViewDataTableContext = React.createContext<ViewDataTableContextValue>({
  transparent: true,
});

function useViewDataTableContext() {
  return React.useContext(ViewDataTableContext);
}

function resolveTransparent(
  explicit: boolean | undefined,
  context: ViewDataTableContextValue
): boolean {
  return explicit ?? context.transparent;
}

function getTintForColumnIndex(index: number): TableColumnTint {
  return COLUMN_TINT_CYCLE[index % COLUMN_TINT_CYCLE.length];
}

function isTableColumnElement(child: React.ReactElement): boolean {
  return (
    child.type === ViewDataTableHead ||
    child.type === ViewDataTableCell ||
    child.type === ViewDataTableCheckboxHead ||
    child.type === ViewDataTableCheckboxCell
  );
}

function injectColumnTints(
  children: React.ReactNode,
  transparent: boolean
): React.ReactNode {
  let columnIndex = 0;

  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child) || !isTableColumnElement(child)) {
      return child;
    }

    const tint = getTintForColumnIndex(columnIndex);
    columnIndex += 1;

    const props = child.props as {
      transparent?: boolean;
      tint?: TableColumnTint;
    };

    return React.cloneElement(child, {
      transparent: resolveTransparent(props.transparent, { transparent }),
      tint: props.tint ?? tint,
    } as Partial<typeof props>);
  });
}

export function ViewDataTable({
  children,
  className,
  large,
  transparent = true,
}: {
  children: React.ReactNode;
  className?: string;
  large?: boolean;
  /** Set to false for classic bordered table (e.g. editorial calendar) */
  transparent?: boolean;
}) {
  const contextValue = React.useMemo(
    () => ({ transparent }),
    [transparent]
  );

  return (
    <ViewDataTableContext.Provider value={contextValue}>
      <ViewContentSurface
        large={large}
        className={cn(transparent && 'border-0 bg-transparent shadow-none', className)}
      >
        <Table
          className={cn(transparent && 'border-separate border-spacing-x-1.5 border-spacing-y-1')}
        >
          {children}
        </Table>
      </ViewContentSurface>
    </ViewDataTableContext.Provider>
  );
}

export function ViewDataTableHeader({
  children,
  transparent,
}: {
  children: React.ReactNode;
  transparent?: boolean;
}) {
  const ctx = useViewDataTableContext();
  const isTransparent = resolveTransparent(transparent, ctx);

  return (
    <TableHeader>
      <TableRow
        className={cn(
          isTransparent ? 'border-0 hover:bg-transparent' : 'border-b border-border/60 hover:bg-transparent'
        )}
      >
        {isTransparent ? injectColumnTints(children, true) : children}
      </TableRow>
    </TableHeader>
  );
}

export function ViewDataTableHead({
  children,
  className,
  tint,
  transparent,
}: {
  children?: React.ReactNode;
  className?: string;
  tint?: TableColumnTint;
  transparent?: boolean;
}) {
  const ctx = useViewDataTableContext();
  const isTransparent = resolveTransparent(transparent, ctx);

  return (
    <TableHead
      className={cn(
        tableHeadClass,
        isTransparent && 'h-auto border-0 px-3 py-2.5 font-medium rounded-lg',
        isTransparent && tint && tableColumnTints[tint],
        className
      )}
    >
      {children}
    </TableHead>
  );
}

export function ViewDataTableCheckboxHead({
  checked,
  onCheckedChange,
  transparent,
  tint,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  transparent?: boolean;
  tint?: TableColumnTint;
}) {
  const ctx = useViewDataTableContext();
  const isTransparent = resolveTransparent(transparent, ctx);

  return (
    <TableHead
      className={cn(
        'w-10 pl-4',
        isTransparent && 'border-0 rounded-lg px-3 py-2.5',
        isTransparent && tint && tableColumnTints[tint]
      )}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        aria-label="Select all"
      />
    </TableHead>
  );
}

export function ViewDataTableBody({ children }: { children: React.ReactNode }) {
  return <TableBody>{children}</TableBody>;
}

export function ViewDataTableRow({
  children,
  onClick,
  className,
  transparent,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  transparent?: boolean;
}) {
  const ctx = useViewDataTableContext();
  const isTransparent = resolveTransparent(transparent, ctx);

  return (
    <TableRow
      className={cn(isTransparent ? tableRowTransparentClass : tableRowClass, className)}
      onClick={onClick}
    >
      {isTransparent ? injectColumnTints(children, true) : children}
    </TableRow>
  );
}

export function ViewDataTableCell({
  children,
  className,
  colSpan,
  tint,
  transparent,
}: {
  children?: React.ReactNode;
  className?: string;
  colSpan?: number;
  tint?: TableColumnTint;
  transparent?: boolean;
}) {
  const ctx = useViewDataTableContext();
  const isTransparent = resolveTransparent(transparent, ctx);

  return (
    <TableCell
      className={cn(
        tableCellClass,
        isTransparent && 'border-0 px-3 py-2.5 rounded-lg',
        isTransparent && tint && tableColumnTints[tint],
        className
      )}
      colSpan={colSpan}
    >
      {children}
    </TableCell>
  );
}

export function ViewDataTableCheckboxCell({
  transparent,
  tint,
}: {
  transparent?: boolean;
  tint?: TableColumnTint;
} = {}) {
  const ctx = useViewDataTableContext();
  const isTransparent = resolveTransparent(transparent, ctx);

  return (
    <TableCell
      className={cn(
        'pl-4 w-10',
        isTransparent && 'border-0 rounded-lg px-3 py-2.5',
        isTransparent && tint && tableColumnTints[tint]
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <Checkbox aria-label="Select row" />
    </TableCell>
  );
}

export function ViewDataTableEmpty({
  colSpan,
  message,
}: {
  colSpan: number;
  message: string;
}) {
  const { transparent } = useViewDataTableContext();

  return (
    <TableRow className={cn(transparent ? 'border-0' : 'hover:bg-transparent')}>
      <TableCell
        colSpan={colSpan}
        className={cn(
          'py-10 text-center text-sm text-muted-foreground',
          transparent && 'rounded-lg border-0 bg-foreground/[0.03]'
        )}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <EmptyStateIllustration />
          <span>{message}</span>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ViewStatusText({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex rounded-md border px-2 py-0.5 text-xs font-medium',
        className
      )}
    >
      {label}
    </span>
  );
}
