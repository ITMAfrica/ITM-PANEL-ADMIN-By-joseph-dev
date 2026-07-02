/** Editorial calendar design tokens — shared across admin panel pages */

export const BRAND_DARK = '#1D141F';
export const BRAND_YELLOW = '#E2F343';
export const BORDER_LIGHT = '#E8ECEF';
export const TEXT_PRIMARY = '#1D141F';
export const TEXT_MUTED = '#5C6470';
export const TEXT_SUBTLE = '#8B939E';
export const SURFACE_WHITE = '#FFFFFF';
export const SURFACE_MUTED = '#F5F7F9';
export const SURFACE_HOVER = '#F8FAFB';

export const editorialClasses = {
  pageShell: 'space-y-5 -mx-1',
  panel: 'overflow-hidden rounded-xl border border-[#E8ECEF] bg-white shadow-sm',
  panelSm: 'rounded-lg border border-[#E8ECEF] bg-white overflow-hidden',
  primaryBtn:
    'h-9 gap-1.5 rounded-lg font-semibold shadow-sm hover:opacity-90 bg-[#1D141F] text-[#E2F343]',
  outlineBtn:
    'h-9 shrink-0 border-[#E8ECEF] bg-white text-sm font-normal text-[#1D141F] hover:bg-[#F8FAFB]',
  searchInput: 'h-9 rounded-lg border-[#E8ECEF] bg-white pl-9 text-sm',
  pageTitle: 'text-xl font-bold tracking-tight text-[#1D141F]',
  sectionTitle: 'text-sm font-bold text-[#1D141F]',
  subtitle: 'text-sm text-[#5C6470] mt-0.5',
  statCard:
    'relative overflow-hidden rounded-xl border border-[#E8ECEF] bg-white shadow-sm hover:shadow-md transition-shadow duration-300',
  listCard:
    'overflow-hidden rounded-xl border border-[#E8ECEF] bg-white shadow-sm hover:shadow-md transition-all duration-300',
  emptyState: 'rounded-xl border border-[#E8ECEF] bg-white px-6 py-16 text-center',
  tabActive: 'bg-[#1D141F] text-[#E2F343] shadow-sm',
  tabInactive: 'bg-[#F5F7F9] text-[#5C6470] hover:bg-[#E8ECEF] hover:text-[#1D141F]',
  iconBox:
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E2F343]/25 border border-[#E2F343]/40',
  iconBoxSm:
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E2F343]/20 border border-[#E2F343]/35',
  iconColor: 'text-[#1D141F]',
} as const;

export const editorialPrimaryStyle = {
  backgroundColor: BRAND_DARK,
  color: BRAND_YELLOW,
} as const;
