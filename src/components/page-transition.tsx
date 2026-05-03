'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PageId } from '@/lib/types';

// Navigation order for determining direction
const PAGE_ORDER: PageId[] = [
  'dashboard',
  'tasks',
  'projects',
  'calendar',
  'messages',
  'meetings',
  'files',
  'wiki',
  'activity',
  'members',
  'teams',
  'reports',
  'automations',
  'settings',
];

function getDirection(from: PageId | null, to: PageId): number {
  if (!from) return 0;
  const fromIdx = PAGE_ORDER.indexOf(from);
  const toIdx = PAGE_ORDER.indexOf(to);
  if (fromIdx === -1 || toIdx === -1) return 0;
  return toIdx > fromIdx ? 1 : -1;
}

const variants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction * 40,
    y: 4,
  }),
  center: {
    opacity: 1,
    x: 0,
    y: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction * -40,
    y: -4,
  }),
};

const transition = {
  type: 'tween',
  ease: [0.25, 0.46, 0.45, 0.94],
  duration: 0.2,
};

interface PageTransitionProps {
  pageId: PageId;
  children: React.ReactNode;
}

export function PageTransition({ pageId, children }: PageTransitionProps) {
  const prevPageRef = useRef<PageId | null>(null);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const prevPage = prevPageRef.current;
    prevPageRef.current = pageId;
    setDirection(getDirection(prevPage, pageId));
  }, [pageId]);

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={pageId}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={transition}
        className="will-change-transform"
      >
        {/* Content-ready subtle fade-in overlay */}
        <motion.div
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15, delay: 0.05 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
