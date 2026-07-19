import type { AiPilotDef, AiPilotId } from './types';
import { MILO_PILOT } from './milo';
import { NOVA_PILOT } from './nova';
import { LEX_PILOT } from './lex';
import { PULSE_PILOT } from './pulse';
import { ECHO_PILOT } from './echo';

export type { AiPilotAnimName, AiPilotDef, AiPilotId, AiPilotMotion } from './types';
export { MILO_PILOT } from './milo';
export { NOVA_PILOT } from './nova';
export { LEX_PILOT } from './lex';
export { PULSE_PILOT } from './pulse';
export { ECHO_PILOT } from './echo';

export const DEFAULT_AI_PILOT_ID: AiPilotId = 'milo';

export const AI_PILOTS: readonly AiPilotDef[] = [
  MILO_PILOT,
  NOVA_PILOT,
  LEX_PILOT,
  PULSE_PILOT,
  ECHO_PILOT,
] as const;

const PILOT_BY_ID: Record<AiPilotId, AiPilotDef> = {
  milo: MILO_PILOT,
  nova: NOVA_PILOT,
  lex: LEX_PILOT,
  pulse: PULSE_PILOT,
  echo: ECHO_PILOT,
};

export function getAiPilot(id: AiPilotId): AiPilotDef {
  return PILOT_BY_ID[id] ?? MILO_PILOT;
}
