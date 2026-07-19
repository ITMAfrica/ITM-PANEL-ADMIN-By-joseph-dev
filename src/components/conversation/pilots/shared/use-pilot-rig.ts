'use client';

import { useMemo, useRef } from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import type { Group } from 'three';
import { AI_PILOT_MODEL_PATH, MODEL_CENTER_Y, MODEL_HEIGHT } from './constants';
import { tintRobot } from './tint-robot';

export function usePilotRig(accent: string, targetHeight: number, yOffset: number) {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF(AI_PILOT_MODEL_PATH);
  const scale = targetHeight / MODEL_HEIGHT;
  const baseY = -(MODEL_CENTER_Y * scale) + yOffset;

  const clone = useMemo(() => {
    const next = SkeletonUtils.clone(scene);
    tintRobot(next, accent);
    return next;
  }, [scene, accent]);

  const { actions, names } = useAnimations(animations, group);

  return { group, clone, scale, baseY, actions, names };
}

useGLTF.preload(AI_PILOT_MODEL_PATH);
