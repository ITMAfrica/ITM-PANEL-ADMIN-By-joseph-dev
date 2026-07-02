import Image from 'next/image';
import { cn } from '@/lib/utils';

export function EmptyStateIllustration({ className }: { className?: string }) {
  return (
    <Image
      src="/page-vide.svg"
      alt=""
      width={240}
      height={180}
      aria-hidden
      className={cn('h-24 w-auto select-none', className)}
      priority={false}
    />
  );
}
