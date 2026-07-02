'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  activeLoop,
  idleTransition,
  navIconSvgProps,
  type AnimatedNavIconProps,
} from './nav-icon-shared';

const TILES = [
  { x: 3, y: 3, width: 7, height: 9 },
  { x: 14, y: 3, width: 7, height: 5 },
  { x: 14, y: 12, width: 7, height: 9 },
  { x: 3, y: 16, width: 7, height: 5 },
] as const;

export function AnimatedLayoutDashboard({
  className,
  isActive = false,
}: AnimatedNavIconProps) {
  return (
    <svg
      {...navIconSvgProps}
      className={cn('h-5 w-5', className)}
      aria-hidden
    >
      {TILES.map((tile, index) => (
        <motion.rect
          key={index}
          x={tile.x}
          width={tile.width}
          height={tile.height}
          rx="1"
          initial={false}
          animate={
            isActive
              ? { y: [tile.y, tile.y - 2, tile.y] }
              : { y: tile.y }
          }
          transition={isActive ? activeLoop(index * 0.15) : idleTransition}
        />
      ))}
    </svg>
  );
}
