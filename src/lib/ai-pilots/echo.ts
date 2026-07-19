import type { AiPilotDef } from './types';

/** Showman — dances with slow spin, walk-jumps when drafting */
export const ECHO_PILOT: AiPilotDef = {
  id: 'echo',
  accent: '#A855F7',
  surface: '#F6F0FF',
  motion: {
    idleAnim: 'Dance',
    activeAnim: 'WalkJump',
    idleTimeScale: 1.05,
    activeTimeScale: 1.2,
    yOffset: 0,
    spinSpeed: 0.35,
    swaySpeed: 0,
    swayAmp: 0,
    bobSpeed: 1.6,
    bobAmp: 0.02,
    baseYaw: 0,
    tiltAmp: 0.03,
  },
};
