'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { PageId } from '@/lib/types';

interface PageTransitionProps {
  pageId: PageId;
  children: React.ReactNode;
}

export function PageTransition({ pageId, children }: PageTransitionProps) {
  return (
    <>
      {/* Progress bar — lives outside the AnimatePresence to avoid key conflicts */}
      <motion.div
        key={`bar-${pageId}`}
        className="fixed top-18 left-0 right-0 h-0.5 z-60 rounded-r-full pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, #a78bfa, #ec4899, #fb923c)',
        }}
        initial={{ width: '0%', opacity: 0 }}
        animate={{
          width: ['0%', '50%', '80%', '100%'],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 0.9,
          times: [0, 0.15, 0.5, 1],
          ease: 'easeInOut' as const,
        }}
      />

      {/* 
        mode="wait" : l'ancienne page termine son exit AVANT que la nouvelle n'entre.
        Zéro chevauchement = zéro clignotement.
        Exit ultra-rapide (0.15s) pour un fondu quasi-instant.
      */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pageId}
          initial={{ opacity: 0, y: 14 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: {
              type: 'tween',
              ease: [0.16, 1, 0.3, 1] as const,
              duration: 0.3,
            },
          }}
          exit={{
            opacity: 0,
            y: -6,
            transition: {
              duration: 0.15,
              ease: 'easeIn' as const,
            },
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
