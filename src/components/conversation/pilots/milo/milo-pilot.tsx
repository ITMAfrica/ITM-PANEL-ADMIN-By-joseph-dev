'use client';

import { MILO_PILOT } from '@/lib/ai-pilots/milo';
import { PilotFrame, type PilotFrameProps } from '../shared/pilot-frame';
import { MiloScene } from './milo-scene';

export type MiloPilotProps = Omit<PilotFrameProps, 'accent' | 'Scene'>;

/** Milo — message pilot (yellow). */
export function MiloPilot(props: MiloPilotProps) {
  return <PilotFrame accent={MILO_PILOT.accent} Scene={MiloScene} {...props} />;
}
