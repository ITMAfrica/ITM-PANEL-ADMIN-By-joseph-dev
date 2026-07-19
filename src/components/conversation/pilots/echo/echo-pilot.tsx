'use client';

import { ECHO_PILOT } from '@/lib/ai-pilots/echo';
import { PilotFrame, type PilotFrameProps } from '../shared/pilot-frame';
import { EchoScene } from './echo-scene';

export type EchoPilotProps = Omit<PilotFrameProps, 'accent' | 'Scene'>;

/** Echo — follow-ups (purple). */
export function EchoPilot(props: EchoPilotProps) {
  return <PilotFrame accent={ECHO_PILOT.accent} Scene={EchoScene} {...props} />;
}
