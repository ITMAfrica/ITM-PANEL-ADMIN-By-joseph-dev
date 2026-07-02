'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  activeLoop,
  idleTransition,
  navIconSvgProps,
  type AnimatedNavIconProps,
} from './nav-icon-shared';

export function AnimatedShield({
  className,
  isActive = false,
}: AnimatedNavIconProps) {
  return (
    <svg
      {...navIconSvgProps}
      className={cn('h-5 w-5', className)}
      aria-hidden
    >
      <motion.path
        d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
        initial={false}
        animate={isActive ? { y: [0, -1.5, 0] } : { y: 0 }}
        transition={isActive ? activeLoop() : idleTransition}
      />
      <motion.path
        d="M9 12l2 2 4-4"
        initial={false}
        animate={
          isActive
            ? {
                pathLength: [0.4, 1, 0.4],
                opacity: [0.5, 1, 0.5],
              }
            : { pathLength: 1, opacity: 0 }
        }
        transition={isActive ? activeLoop(0.2) : idleTransition}
      />
    </svg>
  );
}
