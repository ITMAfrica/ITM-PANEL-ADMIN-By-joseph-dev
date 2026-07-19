'use client';

import { useFrame } from '@react-three/fiber';
import { LEX_PILOT } from '@/lib/ai-pilots/lex';
import { usePilotRig } from '../shared/use-pilot-rig';
import { usePilotClip } from '../shared/use-pilot-clip';
import type { PilotSceneProps } from '../shared/pilot-frame';

/**
 * Lex — paced reformulator.
 * Clip: Walking (slow) → Yes (nod)
 * Motion: large left/right glance + thinking lean — never a spin like Nova.
 */
export function LexScene({
  isGenerating = false,
  targetHeight = 1.65,
}: PilotSceneProps) {
  const { accent, motion } = LEX_PILOT;
  const { group, clone, scale, baseY, actions, names } = usePilotRig(
    accent,
    targetHeight,
    motion.yOffset
  );

  usePilotClip(
    actions,
    names,
    {
      idle: 'Walking',
      active: 'Yes',
      idleTimeScale: motion.idleTimeScale,
      activeTimeScale: motion.activeTimeScale,
      idleFallbacks: ['Walking', 'Idle'],
      activeFallbacks: ['Yes', 'No'],
    },
    isGenerating
  );

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;

    if (isGenerating) {
      // Nod energy while confirming wording — face camera, soft lean.
      group.current.rotation.y = 0.1;
      group.current.rotation.x = Math.sin(t * 4.5) * 0.12;
      group.current.rotation.z = 0;
      group.current.position.y = baseY;
      group.current.position.x = 0;
      return;
    }

    // Pacing thinker: wide yaw glance + shoulder lean + light bob.
    group.current.rotation.y =
      motion.baseYaw + Math.sin(t * motion.swaySpeed) * motion.swayAmp;
    group.current.rotation.x = Math.sin(t * 0.7) * motion.tiltAmp;
    group.current.rotation.z = Math.sin(t * motion.swaySpeed * 0.5) * 0.06;
    group.current.position.y = baseY + Math.sin(t * motion.bobSpeed) * motion.bobAmp;
    group.current.position.x = Math.sin(t * motion.swaySpeed) * 0.04;
  });

  return (
    <group ref={group} dispose={null} scale={scale} position={[0, baseY, 0]}>
      <primitive object={clone} />
    </group>
  );
}
