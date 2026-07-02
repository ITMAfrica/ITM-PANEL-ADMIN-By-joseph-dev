'use client';

import { useCallback, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const CLOSE_DELAY_MS = 320;
const RIPPLE_SIZE = 96;

interface RipplePoint {
  x: number;
  y: number;
  id: number;
}

interface ComposerCloseButtonProps {
  label: string;
  onClose: () => void;
  className?: string;
}

export function ComposerCloseButton({ label, onClose, className }: ComposerCloseButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isClosing, setIsClosing] = useState(false);
  const [ripple, setRipple] = useState<RipplePoint | null>(null);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isClosing) return;

      if (prefersReducedMotion) {
        onClose();
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      setRipple({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        id: Date.now(),
      });
      setIsClosing(true);

      window.setTimeout(() => {
        onClose();
        setIsClosing(false);
        setRipple(null);
      }, CLOSE_DELAY_MS);
    },
    [isClosing, onClose, prefersReducedMotion]
  );

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={isClosing}
      whileTap={
        prefersReducedMotion
          ? undefined
          : {
              scale: 0.92,
              boxShadow: 'inset 0 2px 8px rgba(29, 20, 31, 0.14)',
            }
      }
      style={{ transformPerspective: 800 }}
      className={cn(
        'relative flex items-center gap-1.5 overflow-hidden rounded-md px-1.5 py-1 text-sm font-medium text-[#5C6470] disabled:pointer-events-none',
        className
      )}
    >
      {ripple && (
        <motion.span
          key={ripple.id}
          initial={{ width: 0, height: 0, opacity: 0.45 }}
          animate={{ width: RIPPLE_SIZE, height: RIPPLE_SIZE, opacity: 0 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#5C6470]/25 bg-[#5C6470]/8"
          style={{
            left: ripple.x,
            top: ripple.y,
          }}
          aria-hidden
        />
      )}

      <X className="relative z-1 h-4 w-4" />
      <span className="relative z-1">{label}</span>
    </motion.button>
  );
}
