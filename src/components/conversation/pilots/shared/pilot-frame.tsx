'use client';

import { Suspense, type ComponentType } from 'react';
import { Canvas } from '@react-three/fiber';
import { cn } from '@/lib/utils';

export type PilotSceneProps = {
  isGenerating?: boolean;
  targetHeight?: number;
};

export type PilotFrameProps = {
  accent: string;
  Scene: ComponentType<PilotSceneProps>;
  isGenerating?: boolean;
  className?: string;
  label?: string;
  role?: string;
  /** Gallery card size */
  compact?: boolean;
  /** Footer activator next to Send */
  mini?: boolean;
  showLabel?: boolean;
};

/** Shared canvas chrome — each robot injects its own Scene. */
export function PilotFrame({
  accent,
  Scene,
  isGenerating = false,
  className,
  label,
  role,
  compact = false,
  mini = false,
  showLabel = true,
}: PilotFrameProps) {
  const sizeClass = mini
    ? 'h-16 w-16'
    : compact
      ? 'h-[110px] w-full'
      : 'h-[100px] w-[88px]';
  const minStyle = mini
    ? { minWidth: 64, minHeight: 64 }
    : compact
      ? { minHeight: 110 }
      : { minWidth: 88, minHeight: 100 };
  const targetHeight = mini ? 1.35 : compact ? 1.45 : 1.65;
  const cameraZ = mini ? 3.15 : compact ? 3.0 : 3.2;

  return (
    <div
      className={cn(
        'flex shrink-0 items-center gap-2',
        compact && 'w-full flex-col gap-0',
        className
      )}
    >
      <div className={cn('shrink-0', sizeClass)} aria-hidden style={minStyle}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{
            position: mini ? [0.25, 0.08, cameraZ] : compact ? [0.35, 0.1, cameraZ] : [0.4, 0.15, cameraZ],
            fov: mini ? 30 : compact ? 28 : 30,
            near: 0.01,
            far: 100,
          }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
          onCreated={({ gl, camera }) => {
            gl.setClearColor(0x000000, 0);
            camera.lookAt(0, 0, 0);
            camera.updateProjectionMatrix();
          }}
        >
          <ambientLight intensity={1.2} />
          <directionalLight position={[2.5, 3.5, 2]} intensity={1.8} />
          <directionalLight position={[-2, 1.5, 1]} intensity={0.55} color={accent} />
          <hemisphereLight intensity={0.5} groundColor="#b0b8c0" />
          <Suspense fallback={null}>
            <Scene isGenerating={isGenerating} targetHeight={targetHeight} />
          </Suspense>
        </Canvas>
      </div>
      {showLabel && (label || role) ? (
        <div className={cn('min-w-0', compact && 'w-full px-1 pb-1 text-center')}>
          {label ? <p className="text-xs font-semibold text-[#1D141F]">{label}</p> : null}
          {role ? <p className="text-[10px] leading-snug text-[#8B939E]">{role}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
