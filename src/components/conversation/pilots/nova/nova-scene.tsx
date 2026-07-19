'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { LoopRepeat } from 'three';
import { NOVA_PILOT, NOVA_PRESENCE } from '@/lib/ai-pilots/nova';
import { usePilotRig } from '../shared/use-pilot-rig';
import type { PilotSceneProps } from '../shared/pilot-frame';

type NovaPhase = 'idle' | 'greet' | 'approve';

function pickClip(
  names: string[],
  preferred: string,
  fallbacks: string[]
): string | undefined {
  if (names.includes(preferred)) return preferred;
  return fallbacks.find((n) => names.includes(n)) ?? names[0];
}

/**
 * Nova — alive Idle, occasional Wave greet, ThumbsUp when drafting.
 * Explicitly: no Standing, no lateral stage-slide.
 */
export function NovaScene({
  isGenerating = false,
  targetHeight = 1.65,
}: PilotSceneProps) {
  const { accent, motion } = NOVA_PILOT;
  const { group, clone, scale, baseY, actions, names } = usePilotRig(
    accent,
    targetHeight,
    motion.yOffset
  );

  const phaseRef = useRef<NovaPhase>('idle');
  const phaseStartedAt = useRef(0);
  const clockRef = useRef(0);

  const idleClip = pickClip(names, 'Idle', ['Idle', 'Standing']);
  const greetClip = pickClip(names, 'Wave', ['Wave', 'ThumbsUp']);
  const approveClip = pickClip(names, 'ThumbsUp', ['ThumbsUp', 'Yes']);

  const play = (clipName: string | undefined, timeScale: number) => {
    if (!clipName || !actions[clipName]) return;
    Object.values(actions).forEach((a) => a?.fadeOut(0.2));
    const action = actions[clipName];
    action?.reset().setEffectiveTimeScale(timeScale).fadeIn(0.25).play();
    action?.setLoop(LoopRepeat, Infinity);
  };

  useEffect(() => {
    if (isGenerating) {
      phaseRef.current = 'approve';
      phaseStartedAt.current = clockRef.current;
      play(approveClip, motion.activeTimeScale);
      return;
    }
    phaseRef.current = 'idle';
    phaseStartedAt.current = clockRef.current;
    play(idleClip, motion.idleTimeScale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerating]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    clockRef.current = t;
    const { breathAmp, leanAmp, leanSpeed, rollAmp, idleSeconds, greetSeconds } =
      NOVA_PRESENCE;

    // Never skate — stay centered on X/Z
    group.current.position.x = 0;
    group.current.position.z = 0;

    const breath = 1 + Math.sin(t * 1.25) * breathAmp;
    group.current.scale.setScalar(scale * breath);

    // Timed greet while not drafting
    if (!isGenerating && phaseRef.current !== 'approve') {
      const elapsed = t - phaseStartedAt.current;
      if (phaseRef.current === 'idle' && elapsed >= idleSeconds) {
        phaseRef.current = 'greet';
        phaseStartedAt.current = t;
        play(greetClip, 1.05);
      } else if (phaseRef.current === 'greet' && elapsed >= greetSeconds) {
        phaseRef.current = 'idle';
        phaseStartedAt.current = t;
        play(idleClip, motion.idleTimeScale);
      }
    }

    if (isGenerating || phaseRef.current === 'approve') {
      group.current.position.y = baseY + 0.02 + Math.sin(t * 2.2) * 0.01;
      group.current.rotation.y = 0.08 + Math.sin(t * 1.1) * 0.03;
      group.current.rotation.x = -0.05 + Math.sin(t * 2) * 0.02;
      group.current.rotation.z = 0;
      return;
    }

    if (phaseRef.current === 'greet') {
      // Face the user and greet — still no slide
      group.current.position.y = baseY + Math.sin(t * 2) * 0.012;
      group.current.rotation.y = 0.05 + Math.sin(t * 1.5) * 0.04;
      group.current.rotation.x = -0.06;
      group.current.rotation.z = Math.sin(t * 5) * 0.015;
      return;
    }

    // Idle: formal lean (natural, not planted-skate)
    group.current.position.y =
      baseY + Math.sin(t * motion.bobSpeed) * motion.bobAmp;
    group.current.rotation.y =
      motion.baseYaw + Math.sin(t * motion.swaySpeed) * motion.swayAmp;
    group.current.rotation.x = -0.02 + Math.sin(t * leanSpeed) * leanAmp;
    group.current.rotation.z = Math.sin(t * leanSpeed * 0.7) * rollAmp;
  });

  return (
    <group ref={group} dispose={null} scale={scale} position={[0, baseY, 0]}>
      <primitive object={clone} />
    </group>
  );
}
