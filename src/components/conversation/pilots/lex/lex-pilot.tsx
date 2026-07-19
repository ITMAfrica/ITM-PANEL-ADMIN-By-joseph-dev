'use client';

import { LEX_PILOT } from '@/lib/ai-pilots/lex';
import { PilotFrame, type PilotFrameProps } from '../shared/pilot-frame';
import { LexScene } from './lex-scene';

export type LexPilotProps = Omit<PilotFrameProps, 'accent' | 'Scene'>;

/** Lex — rewrite & translation (green). */
export function LexPilot(props: LexPilotProps) {
  return <PilotFrame accent={LEX_PILOT.accent} Scene={LexScene} {...props} />;
}
