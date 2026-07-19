'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  getIllustration,
  ILLUSTRATION_PRESETS,
  type ItmIllustrationId,
} from '@/lib/itm-illustrations';
import {
  getIllustration2,
  type ItmIllustration2Id,
} from '@/lib/itm-illustrations-2';

const SIZE_CLASS = {
  sm: 'h-32 w-auto',
  md: 'h-44 w-auto sm:h-52',
  lg: 'h-56 w-auto sm:h-64',
} as const;

export type EmptyStateIllustrationProps = {
  className?: string;
  /** Series 1 illustration id (default: empty-box). Ignored if series2Id is set. */
  illustrationId?: ItmIllustrationId;
  /** Series 2 denser illustration — preferred when set. */
  series2Id?: ItmIllustration2Id;
  size?: keyof typeof SIZE_CLASS;
  animate?: boolean;
};

export function EmptyStateIllustration({
  className,
  illustrationId = ILLUSTRATION_PRESETS.empty,
  series2Id,
  size = 'md',
  animate = true,
}: EmptyStateIllustrationProps) {
  const reduceMotion = useReducedMotion();
  const art = series2Id
    ? getIllustration2(series2Id)
    : getIllustration(illustrationId);

  const image = (
    <Image
      src={art.path}
      alt=""
      width={series2Id ? 640 : 480}
      height={series2Id ? 480 : 360}
      aria-hidden
      className={cn(SIZE_CLASS[size], 'select-none', className)}
      priority={false}
    />
  );

  if (!animate) {
    return <div className="relative">{image}</div>;
  }

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 16, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, -14, 0],
                rotate: [0, -1.25, 0, 1.25, 0],
              }
        }
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {image}
      </motion.div>
    </motion.div>
  );
}
