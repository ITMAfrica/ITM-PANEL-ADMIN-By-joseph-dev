'use client';

import { NOVA_PILOT } from '@/lib/ai-pilots/nova';
import { PilotFrame, type PilotFrameProps } from '../shared/pilot-frame';
import { NovaScene } from './nova-scene';

export type NovaPilotProps = Omit<PilotFrameProps, 'accent' | 'Scene'>;

/** Nova — professional support (blue). */
export function NovaPilot(props: NovaPilotProps) {
  return <PilotFrame accent={NOVA_PILOT.accent} Scene={NovaScene} {...props} />;
}
