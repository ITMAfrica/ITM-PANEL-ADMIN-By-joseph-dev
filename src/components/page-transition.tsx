'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { PageId } from '@/lib/types';

interface PageTransitionProps {
  pageId: PageId;
  children: React.ReactNode;
}

export function PageTransition({ pageId, children }: PageTransitionProps) {
  return (
    <div className="relative">
      {/* NProgress-style loading indicator — key change triggers fresh animation per page */}
      <motion.div
        key={`bar-${pageId}`}
        className="absolute top-0 left-0 h-0.5 bg-blue-500 z-50 rounded-r-full"
        initial={{ width: '0%', opacity: 1 }}
        animate={{
          width: ['0%', '70%', '100%'],
          opacity: [1, 1, 0],
        }}
        transition={{
          duration: 0.5,
          times: [0, 0.6, 1],
          ease: 'easeOut' as const,
        }}
      />

      {/* Page transition with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pageId}
          initial={{ opacity: 0, y: 8 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: {
              type: 'tween',
              ease: [0.25, 0.46, 0.45, 0.94] as const,
              duration: 0.2, // enter: 0.2s
            },
          }}
          exit={{
            opacity: 0,
            y: -8,
            transition: {
              type: 'tween',
              ease: [0.25, 0.46, 0.45, 0.94] as const,
              duration: 0.15, // exit: 0.15s
            },
          }}
        >
          {/* Staggered content entrance wrapper */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.25,
              ease: 'easeOut' as const,
              delay: 0.05,
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
