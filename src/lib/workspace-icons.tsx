'use client';

import {
  BarChart3,
  Building2,
  Gem,
  Home,
  Lightbulb,
  Palette,
  Rocket,
  Settings,
  Shield,
  Target,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const WORKSPACE_ICON_MAP: Record<string, LucideIcon> = {
  'building-2': Building2,
  home: Home,
  rocket: Rocket,
  palette: Palette,
  lightbulb: Lightbulb,
  wrench: Wrench,
  'bar-chart-3': BarChart3,
  target: Target,
  zap: Zap,
  gem: Gem,
  shield: Shield,
  settings: Settings,
};

export const WORKSPACE_ICON_OPTIONS = Object.keys(WORKSPACE_ICON_MAP);

export const WORKSPACE_COLOR_OPTIONS = [
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
] as const;

export function WorkspaceIcon({
  icon,
  className,
}: {
  icon?: string | null;
  className?: string;
}) {
  if (!icon) return null;
  const Icon = WORKSPACE_ICON_MAP[icon];
  if (Icon) return <Icon className={cn('shrink-0', className)} />;
  return <span className={cn('leading-none', className)}>{icon}</span>;
}
