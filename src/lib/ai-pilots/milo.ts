import type { AiPilotDef } from './types';

/** Friendly greeter — soft idle + wave */
export const MILO_PILOT: AiPilotDef = {
  id: 'milo',
  accent: '#E2F343',
  surface: '#F7FBE8',
  motion: {
    idleAnim: 'Idle',
    activeAnim: 'Wave',
    idleTimeScale: 1,
    activeTimeScale: 1.1,
    yOffset: 0,
    spinSpeed: 0,
    swaySpeed: 0.6,
    swayAmp: 0.32,
    bobSpeed: 1.3,
    bobAmp: 0.028,
    baseYaw: 0.4,
    tiltAmp: 0.035,
  },
};
