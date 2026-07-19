'use client';

import { useFrame } from '@react-three/fiber';
import { MILO_PILOT } from '@/lib/ai-pilots/milo';
import { usePilotRig } from '../shared/use-pilot-rig';
import { usePilotClip } from '../shared/use-pilot-clip';
import type { PilotSceneProps } from '../shared/pilot-frame';

/**
 * Milo scene — warm greeter.
 * Owns Idle/Wave clips and a soft sway + bob personality.
 */
export function MiloScene({
  isGenerating = false,
  targetHeight = 1.65,
}: PilotSceneProps) {
  const { accent, motion } = MILO_PILOT;
  const { group, clone, scale, baseY, actions, names } = usePilotRig(
    accent,
    targetHeight,
    motion.yOffset
  );

  usePilotClip(
    actions,
    names,
    {
      idle: 'Idle',
      active: 'Wave',
      idleTimeScale: motion.idleTimeScale,
      activeTimeScale: motion.activeTimeScale,
    },
    isGenerating
  );

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const overlay = isGenerating ? 0.25 : 1;
    group.current.rotation.y =
      motion.baseYaw + Math.sin(t * motion.swaySpeed) * motion.swayAmp * overlay;
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
