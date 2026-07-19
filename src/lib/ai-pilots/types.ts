export type AiPilotId = 'milo' | 'nova' | 'lex' | 'pulse' | 'echo';

/** Clips available on RobotExpressive.glb */
export type AiPilotAnimName =
  | 'Idle'
  | 'Standing'
  | 'Sitting'
  | 'Walking'
  | 'Running'
  | 'Jump'
  | 'Dance'
  | 'Wave'
  | 'Yes'
  | 'No'
  | 'ThumbsUp'
  | 'Punch'
  | 'WalkJump';

export type AiPilotMotion = {
  idleAnim: AiPilotAnimName;
  activeAnim: AiPilotAnimName;
  idleTimeScale: number;
  activeTimeScale: number;
  yOffset: number;
  spinSpeed: number;
  swaySpeed: number;
  swayAmp: number;
  bobSpeed: number;
  bobAmp: number;
  baseYaw: number;
  tiltAmp: number;
};

/** Per-robot identity + motion — owned by each pilot module */
export type AiPilotDef = {
  id: AiPilotId;
  accent: string;
  surface: string;
  motion: AiPilotMotion;
};
