'use client';

import { PULSE_PILOT } from '@/lib/ai-pilots/pulse';
import { PilotFrame, type PilotFrameProps } from '../shared/pilot-frame';
import { PulseScene } from './pulse-scene';

export type PulsePilotProps = Omit<PilotFrameProps, 'accent' | 'Scene'>;

/** Pulse — urgencies (orange). */
export function PulsePilot(props: PulsePilotProps) {
  return <PilotFrame accent={PULSE_PILOT.accent} Scene={PulseScene} {...props} />;
}
