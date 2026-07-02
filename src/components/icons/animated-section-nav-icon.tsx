'use client';

import type { ComponentType } from 'react';
import type { SectionKey } from '@/lib/navigation';
import { AnimatedLayoutDashboard } from './animated-layout-dashboard';
import { AnimatedBookOpen } from './animated-book-open';
import { AnimatedBarChart } from './animated-bar-chart';
import { AnimatedShield } from './animated-shield';
import type { AnimatedNavIconProps } from './nav-icon-shared';

const SECTION_ICONS: Record<SectionKey, ComponentType<AnimatedNavIconProps>> = {
  communication: AnimatedLayoutDashboard,
  contentManagement: AnimatedBookOpen,
  analysis: AnimatedBarChart,
  administration: AnimatedShield,
};

interface AnimatedSectionNavIconProps extends AnimatedNavIconProps {
  sectionKey: SectionKey;
}

export function AnimatedSectionNavIcon({
  sectionKey,
  ...props
}: AnimatedSectionNavIconProps) {
  const Icon = SECTION_ICONS[sectionKey];
  return <Icon {...props} />;
}
