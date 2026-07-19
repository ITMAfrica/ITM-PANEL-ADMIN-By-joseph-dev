'use client';

import { useEffect } from 'react';
import { LoopRepeat, type AnimationAction } from 'three';

type ClipConfig = {
  idle: string;
  active: string;
  idleTimeScale: number;
  activeTimeScale: number;
  idleFallbacks?: string[];
  activeFallbacks?: string[];
};

function resolveClip(
  names: string[],
  preferred: string,
  fallbacks: string[]
): string | undefined {
  if (names.includes(preferred)) return preferred;
  return fallbacks.find((n) => names.includes(n)) ?? names[0];
}

/** Plays the pilot's idle or active skeleton clip. */
export function usePilotClip(
  actions: Record<string, AnimationAction | null | undefined>,
  names: string[],
  config: ClipConfig,
  isGenerating: boolean
) {
  useEffect(() => {
    const idleName = resolveClip(
      names,
      config.idle,
      config.idleFallbacks ?? ['Idle', 'Standing']
    );
    const activeName = resolveClip(
      names,
      config.active,
      config.activeFallbacks ?? ['Wave', 'Yes', 'ThumbsUp']
    );
    const next = isGenerating ? activeName : idleName;
    if (!next || !actions[next]) return;

    const action = actions[next];
    const timeScale = isGenerating ? config.activeTimeScale : config.idleTimeScale;
    action.reset().setEffectiveTimeScale(timeScale).fadeIn(0.28).play();
    action.setLoop(LoopRepeat, Infinity);

    return () => {
      action.fadeOut(0.18);
    };
  }, [
    actions,
    config.active,
    config.activeFallbacks,
    config.activeTimeScale,
    config.idle,
    config.idleFallbacks,
    config.idleTimeScale,
    isGenerating,
    names,
  ]);
}
