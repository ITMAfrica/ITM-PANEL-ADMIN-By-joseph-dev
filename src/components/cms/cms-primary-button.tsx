'use client';

import { Button } from '@/components/ui/button';
import { cmsPrimaryBtnStyle } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';

export function CmsPrimaryButton({
  className,
  children,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      size="sm"
      className={cn('h-9 gap-1.5 rounded-lg font-semibold shadow-sm hover:opacity-90', className)}
      style={cmsPrimaryBtnStyle}
      {...props}
    >
      {children}
    </Button>
  );
}
