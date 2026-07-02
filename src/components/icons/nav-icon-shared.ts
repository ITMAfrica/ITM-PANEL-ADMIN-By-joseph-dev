export interface AnimatedNavIconProps {
  className?: string;
  isActive?: boolean;
}

export const activeLoop = (delay = 0) => ({
  duration: 1.6,
  repeat: Infinity,
  ease: 'easeInOut' as const,
  delay,
});

export const idleTransition = { duration: 0.2 };

export const navIconSvgProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};
