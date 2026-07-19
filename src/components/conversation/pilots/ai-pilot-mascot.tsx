'use client';

import type { ComponentType } from 'react';
import { DEFAULT_AI_PILOT_ID, type AiPilotId } from '@/lib/ai-pilots';
import { MiloPilot, type MiloPilotProps } from './milo/milo-pilot';
import { NovaPilot } from './nova/nova-pilot';
import { LexPilot } from './lex/lex-pilot';
import { PulsePilot } from './pulse/pulse-pilot';
import { EchoPilot } from './echo/echo-pilot';

export type AiPilotMascotProps = MiloPilotProps & {
  pilotId?: AiPilotId;
};

const PILOT_COMPONENTS: Record<AiPilotId, ComponentType<MiloPilotProps>> = {
  milo: MiloPilot,
  nova: NovaPilot,
  lex: LexPilot,
  pulse: PulsePilot,
  echo: EchoPilot,
};

/**
 * Facade — routes to the dedicated pilot component.
 * Prefer importing MiloPilot / NovaPilot / … when the identity is known.
 */
export function AiPilotMascot({
  pilotId = DEFAULT_AI_PILOT_ID,
  ...props
}: AiPilotMascotProps) {
  const Pilot = PILOT_COMPONENTS[pilotId] ?? MiloPilot;
  return <Pilot {...props} />;
}
