import type { AiPilotDef } from './types';

/** Urgency — runs on loop, punches when drafting */
export const PULSE_PILOT: AiPilotDef = {
  id: 'pulse',
  accent: '#F97316',
  surface: '#FFF4EB',
  motion: {
    idleAnim: 'Running',
    activeAnim: 'Punch',
    idleTimeScale: 1.35,
    activeTimeScale: 1.45,
    yOffset: 0.04,
    spinSpeed: 0,
    swaySpeed: 0.9,
    swayAmp: 0.18,
    bobSpeed: 3.2,
    bobAmp: 0.045,
    baseYaw: 0.55,
    tiltAmp: 0.05,
  },
};
