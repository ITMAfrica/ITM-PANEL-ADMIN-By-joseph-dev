import type { AiPilotDef } from './types';

/**
 * Nova — natural idle + occasional Wave greet (no Standing, no stage-slide).
 */
export const NOVA_PILOT: AiPilotDef = {
  id: 'nova',
  accent: '#3B82F6',
  surface: '#EEF5FF',
  motion: {
    idleAnim: 'Idle',
    activeAnim: 'ThumbsUp',
    idleTimeScale: 0.9,
    activeTimeScale: 1.05,
    yOffset: 0.02,
    spinSpeed: 0,
    swaySpeed: 0.32,
    swayAmp: 0.1,
    bobSpeed: 1.05,
    bobAmp: 0.02,
    baseYaw: 0.15,
    tiltAmp: 0.055,
  },
};

export const NOVA_PRESENCE = {
  breathAmp: 0.022,
  leanAmp: 0.07,
  leanSpeed: 0.65,
  rollAmp: 0.035,
  /** Seconds of Idle before a greet */
  idleSeconds: 6,
  /** Seconds the Wave greet lasts */
  greetSeconds: 2.2,
} as const;
