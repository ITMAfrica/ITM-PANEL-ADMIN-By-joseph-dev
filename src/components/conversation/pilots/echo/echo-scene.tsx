'use client';

import { useFrame } from '@react-three/fiber';
import { ECHO_PILOT } from '@/lib/ai-pilots/echo';
import { usePilotRig } from '../shared/use-pilot-rig';
import { usePilotClip } from '../shared/use-pilot-clip';
import type { PilotSceneProps } from '../shared/pilot-frame';

/**
 * Echo scene — showman.
 * Dance with continuous spin; WalkJump when drafting.
 */
export function EchoScene({
  isGenerating = false,
  targetHeight = 1.65,
}: PilotSceneProps) {
  const { accent, motion } = ECHO_PILOT;
  const { group, clone, scale, baseY, actions, names } = usePilotRig(
    accent,
    targetHeight,
    motion.yOffset
  );

  usePilotClip(
    actions,
    names,
    {
      idle: 'Dance',
      active: 'WalkJump',
      idleTimeScale: motion.idleTimeScale,
      activeTimeScale: motion.activeTimeScale,
      idleFallbacks: ['Dance', 'Walking'],
      activeFallbacks: ['WalkJump', 'Jump', 'Wave'],
    },
    isGenerating
  );

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const overlay = isGenerating ? 0.3 : 1;
    group.current.rotation.y = motion.baseYaw + t * motion.spinSpeed;
    group.current.rotation.x =
      Math.sin(t * motion.bobSpeed * 0.65) * motion.tiltAmp * overlay;
    group.current.position.y =
      baseY + Math.sin(t * motion.bobSpeed) * motion.bobAmp * overlay;
  });

  return (
    <group ref={group} dispose={null} scale={scale} position={[0, baseY, 0]}>
      <primitive object={clone} />
    </group>
  );
}
