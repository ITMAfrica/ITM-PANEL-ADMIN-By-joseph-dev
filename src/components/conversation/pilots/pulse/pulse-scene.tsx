'use client';

import { useFrame } from '@react-three/fiber';
import { PULSE_PILOT } from '@/lib/ai-pilots/pulse';
import { usePilotRig } from '../shared/use-pilot-rig';
import { usePilotClip } from '../shared/use-pilot-clip';
import type { PilotSceneProps } from '../shared/pilot-frame';

/**
 * Pulse scene — urgency.
 * Running / Punch with fast bob and snappy yaw.
 */
export function PulseScene({
  isGenerating = false,
  targetHeight = 1.65,
}: PilotSceneProps) {
  const { accent, motion } = PULSE_PILOT;
  const { group, clone, scale, baseY, actions, names } = usePilotRig(
    accent,
    targetHeight,
    motion.yOffset
  );

  usePilotClip(
    actions,
    names,
    {
      idle: 'Running',
      active: 'Punch',
      idleTimeScale: motion.idleTimeScale,
      activeTimeScale: motion.activeTimeScale,
      idleFallbacks: ['Running', 'Jump', 'Walking'],
      activeFallbacks: ['Punch', 'Jump'],
    },
    isGenerating
  );

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const overlay = isGenerating ? 0.35 : 1;
    group.current.rotation.y =
      motion.baseYaw + Math.sin(t * motion.swaySpeed) * motion.swayAmp * overlay;
    group.current.rotation.x =
      Math.sin(t * motion.bobSpeed * 0.5) * motion.tiltAmp * overlay;
    group.current.position.y =
      baseY + Math.sin(t * motion.bobSpeed) * motion.bobAmp * overlay;
  });

  return (
    <group ref={group} dispose={null} scale={scale} position={[0, baseY, 0]}>
      <primitive object={clone} />
    </group>
  );
}
