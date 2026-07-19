import type { AiPilotDef } from './types';

/**
 * Lex — paced thinker / reformulator.
 * Walks while reflecting; nods (Yes) when the wording clicks.
 * Deliberately opposite to Nova’s still standing pose.
 */
export const LEX_PILOT: AiPilotDef = {
  id: 'lex',
  accent: '#22C55E',
  surface: '#ECFDF3',
  motion: {
    idleAnim: 'Walking',
    activeAnim: 'Yes',
    idleTimeScale: 0.55,
    activeTimeScale: 1.05,
    yOffset: 0.06,
    spinSpeed: 0,
    /** Slow look left/right while pacing */
    swaySpeed: 0.45,
    swayAmp: 0.55,
    bobSpeed: 1.1,
    bobAmp: 0.02,
    baseYaw: -0.35,
    tiltAmp: 0.09,
  },
};
