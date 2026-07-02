export const contentStatusColors: Record<string, { bg: string; text: string; border: string }> = {
  draft: { bg: 'bg-slate-500/10', text: 'text-slate-600', border: 'border-slate-500/20' },
  review: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20' },
  approved: { bg: 'bg-cyan-500/10', text: 'text-cyan-600', border: 'border-cyan-500/20' },
  scheduled: { bg: 'bg-violet-500/10', text: 'text-violet-600', border: 'border-violet-500/20' },
  published: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
  archived: { bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/20' },
};

export const contentStatusLabels: Record<string, Record<string, string>> = {
  fr: { draft: 'Brouillon', review: 'En révision', approved: 'Approuvé', scheduled: 'Planifié', published: 'Publié', archived: 'Archivé' },
  en: { draft: 'Draft', review: 'In Review', approved: 'Approved', scheduled: 'Scheduled', published: 'Published', archived: 'Archived' },
};

export const roleColors: Record<string, { bg: string; text: string; border: string }> = {
  super_admin: { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-500/20' },
  tenant_admin: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
  editor: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
  contributor: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20' },
  reader: { bg: 'bg-slate-500/10', text: 'text-slate-600', border: 'border-slate-500/20' },
};
