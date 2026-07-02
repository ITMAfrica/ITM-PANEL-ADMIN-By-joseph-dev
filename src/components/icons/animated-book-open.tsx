'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  activeLoop,
  idleTransition,
  navIconSvgProps,
  type AnimatedNavIconProps,
} from './nav-icon-shared';

export function AnimatedBookOpen({
  className,
  isActive = false,
}: AnimatedNavIconProps) {
  return (
    <svg
      {...navIconSvgProps}
      className={cn('h-5 w-5', className)}
      aria-hidden
    >
      <motion.line
        x1={12}
        x2={12}
        initial={false}
        animate={
          isActive
            ? { y1: [7, 9, 7], y2: [21, 19, 21] }
            : { y1: 7, y2: 21 }
        }
        transition={isActive ? activeLoop() : idleTransition}
      />
      <motion.g
        initial={false}
        animate={isActive ? { rotate: [-4, 4, -4] } : { rotate: 0 }}
        transition={isActive ? activeLoop(0.1) : idleTransition}
        style={{ transformOrigin: '12px 12px', transformBox: 'fill-box' }}
      >
        <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
      </motion.g>
    </svg>
  );
}
