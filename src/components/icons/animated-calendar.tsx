'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  activeLoop,
  idleTransition,
  navIconSvgProps,
  type AnimatedNavIconProps,
} from './nav-icon-shared';

const PINS = [
  { x: 8, y2: 6 },
  { x: 16, y2: 6 },
] as const;

export function AnimatedCalendar({
  className,
  isActive = false,
}: AnimatedNavIconProps) {
  return (
    <svg
      {...navIconSvgProps}
      className={cn('h-5 w-5', className)}
      aria-hidden
    >
      {PINS.map((pin, index) => (
        <motion.line
          key={pin.x}
          x1={pin.x}
          x2={pin.x}
          y1={2}
          initial={false}
          animate={
            isActive
              ? { y2: [pin.y2, 4, pin.y2] }
              : { y2: pin.y2 }
          }
          transition={isActive ? activeLoop(index * 0.1) : idleTransition}
        />
      ))}
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
      <motion.rect
        width={4}
        height={4}
        x={7}
        rx={1}
        initial={false}
        animate={
          isActive
            ? { y: [13, 11, 13] }
            : { y: 13 }
        }
        transition={isActive ? activeLoop(0.25) : idleTransition}
      />
    </svg>
  );
}
