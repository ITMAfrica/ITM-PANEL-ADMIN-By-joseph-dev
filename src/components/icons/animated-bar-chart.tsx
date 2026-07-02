'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  activeLoop,
  idleTransition,
  navIconSvgProps,
  type AnimatedNavIconProps,
} from './nav-icon-shared';

const BARS = [
  { x: 8, y2: 14, activeY2: 11 },
  { x: 13, y2: 5, activeY2: 9 },
  { x: 18, y2: 9, activeY2: 12 },
] as const;

export function AnimatedBarChart({
  className,
  isActive = false,
}: AnimatedNavIconProps) {
  return (
    <svg
      {...navIconSvgProps}
      className={cn('h-5 w-5', className)}
      aria-hidden
    >
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      {BARS.map((bar, index) => (
        <motion.line
          key={bar.x}
          x1={bar.x}
          x2={bar.x}
          y1={17}
          initial={false}
          animate={
            isActive
              ? { y2: [bar.y2, bar.activeY2, bar.y2] }
              : { y2: bar.y2 }
          }
          transition={isActive ? activeLoop(index * 0.12) : idleTransition}
        />
      ))}
    </svg>
  );
}
