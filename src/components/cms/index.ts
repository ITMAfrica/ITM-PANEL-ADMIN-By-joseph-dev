export { CmsPrimaryButton } from './cms-primary-button';

export const contentStatusColors: Record<string, string> = {
  draft: 'bg-slate-500/10 text-slate-600 border-slate-200',
  review: 'bg-amber-500/10 text-amber-700 border-amber-200',
  approved: 'bg-blue-500/10 text-blue-700 border-blue-200',
  scheduled: 'bg-violet-500/10 text-violet-700 border-violet-200',
  published: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  archived: 'bg-gray-500/10 text-gray-600 border-gray-200',
};

export const contentStatusLabels: Record<string, string> = {
  draft: 'Brouillon',
  review: 'En revue',
  approved: 'Approuvé',
  scheduled: 'Planifié',
  published: 'Publié',
  archived: 'Archivé',
};

export const eventTypeConfig: Record<string, {
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  deadline: { color: '#ef4444', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/20' },
  publication: { color: '#3b82f6', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
  review: { color: '#f59e0b', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
  meeting: { color: '#8b5cf6', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/20' },
  campaign: { color: '#06b6d4', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20' },
};
