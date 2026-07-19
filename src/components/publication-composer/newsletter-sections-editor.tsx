'use client';

import { useRef, useState } from 'react';
import { GripVertical, Trash2, ArrowUp, ArrowDown, Plus, Upload, ImageIcon, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { useUploadMedia } from '@/hooks/use-upload-media';
import { MediaPickerDialog } from '@/components/media/media-picker-dialog';
import type { NewsletterSection } from '@/lib/types';

const SECTION_LABELS: Record<NewsletterSection['type'], string> = {
  hero: 'En-tête (Hero)',
  band: 'Bandeau de section',
  article: 'Article / Bloc texte',
  cta: 'Bouton (CTA)',
  calendar: 'Calendrier',
  footer: 'Pied de page',
};

function ImageField({
  value,
  onPick,
  uploadMedia,
}: {
  value: string;
  onPick: (url: string) => void;
  uploadMedia: ReturnType<typeof useUploadMedia>;
}) {
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    try {
      const item = await uploadMedia.mutateAsync(file);
      onPick(item.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de l’upload');
    }
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-[#1D141F]">URL image (optionnel)</Label>
      <Input
        value={value}
        onChange={(e) => onPick(e.target.value)}
        placeholder="https://… ou collez une URL"
        className="h-9 border-[#E8ECEF] bg-[#FAFBFC] text-sm"
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMedia.isPending || !activeTenantId}
          title="Uploader depuis mon ordinateur"
          aria-label="Uploader depuis mon ordinateur"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E8ECEF] bg-white text-[#5C6470] transition-colors hover:border-[oklch(0.55_0.18_250/0.3)] hover:text-[oklch(0.55_0.18_250)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploadMedia.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          title="Choisir dans la bibliothèque"
          aria-label="Choisir dans la bibliothèque"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E8ECEF] bg-white text-[#5C6470] transition-colors hover:border-[oklch(0.55_0.18_250/0.3)] hover:text-[oklch(0.55_0.18_250)]"
        >
          <ImageIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      {uploadMedia.isPending && (
        <p className="text-xs text-[#8B939E]">Upload en cours…</p>
      )}
      {error && <p className="text-xs text-rose-500">{error}</p>}

      {value && (
        <img
          src={value}
          alt="Aperçu"
          className="h-24 w-auto rounded-md border border-[#E8ECEF] object-cover"
        />
      )}

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(item) => onPick(item.url)}
        filterType="image"
      />
    </div>
  );
}

interface NewsletterSectionsEditorProps {
  sections: NewsletterSection[];
  onChange: (sections: NewsletterSection[]) => void;
}

function SectionCard({
  section,
  index,
  total,
  onUpdate,
  onRemove,
  onMove,
}: {
  section: NewsletterSection;
  index: number;
  total: number;
  onUpdate: (next: NewsletterSection) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const uploadMedia = useUploadMedia(useAppStore((s) => s.activeTenantId));
  const setImageUrl = (imageUrl: string) => onUpdate({ ...section, imageUrl } as NewsletterSection);
  const field = (key: string, value: string, label: string) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-[#1D141F]">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onUpdate({ ...section, [key]: e.target.value } as NewsletterSection)}
        className="h-9 border-[#E8ECEF] bg-[#FAFBFC] text-sm"
      />
    </div>
  );

  return (
    <div className="rounded-lg border border-[#E8ECEF] bg-white p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#5C6470]">
          <GripVertical className="h-3.5 w-3.5 text-[#B5BCC6]" />
          {SECTION_LABELS[section.type]}
        </span>
        <span className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="flex h-6 w-6 items-center justify-center rounded text-[#5C6470] hover:bg-[#F0F3F6] disabled:opacity-40"
            aria-label="Monter"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="flex h-6 w-6 items-center justify-center rounded text-[#5C6470] hover:bg-[#F0F3F6] disabled:opacity-40"
            aria-label="Descendre"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="flex h-6 w-6 items-center justify-center rounded text-rose-500 hover:bg-rose-50"
            aria-label="Supprimer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </span>
      </div>

      <div className="space-y-3">
        {section.type === 'hero' && (
          <>
            {field('label', section.label ?? '', 'Sur-titre (ex. JUILLET NEWSLETTER)')}
            {field('title', section.title, 'Titre')}
            {field('subtitle', section.subtitle, 'Sous-titre')}
            <ImageField value={section.imageUrl} onPick={setImageUrl} uploadMedia={uploadMedia} />
          </>
        )}
        {section.type === 'band' && field('label', section.label, 'Libellé du bandeau')}
        {section.type === 'article' && (
          <>
            {field('title', section.title, 'Titre (optionnel)')}
            <ImageField value={section.imageUrl} onPick={setImageUrl} uploadMedia={uploadMedia} />
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#1D141F]">Texte</Label>
              <Textarea
                value={section.text}
                onChange={(e) => onUpdate({ ...section, text: e.target.value })}
                className="min-h-[70px] resize-none border-[#E8ECEF] bg-[#FAFBFC] text-sm"
              />
            </div>
          </>
        )}
        {section.type === 'cta' && (
          <>
            {field('label', section.label, 'Texte du bouton')}
            {field('href', section.href, 'Lien (URL)')}
          </>
        )}
        {section.type === 'calendar' && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-[#1D141F]">Éléments (un par ligne)</Label>
            <Textarea
              value={section.items.join('\n')}
              onChange={(e) => onUpdate({ ...section, items: e.target.value.split('\n') })}
              className="min-h-[80px] resize-none border-[#E8ECEF] bg-[#FAFBFC] text-sm"
            />
          </div>
        )}
        {section.type === 'footer' && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-[#1D141F]">Texte</Label>
            <Textarea
              value={section.text}
              onChange={(e) => onUpdate({ ...section, text: e.target.value })}
              className="min-h-[60px] resize-none border-[#E8ECEF] bg-[#FAFBFC] text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}

const ADDABLE: { type: NewsletterSection['type']; label: string }[] = [
  { type: 'hero', label: 'Hero' },
  { type: 'band', label: 'Bandeau' },
  { type: 'article', label: 'Article' },
  { type: 'cta', label: 'CTA' },
  { type: 'calendar', label: 'Calendrier' },
  { type: 'footer', label: 'Footer' },
];

function emptySection(type: NewsletterSection['type']): NewsletterSection {
  switch (type) {
    case 'hero':
      return { type, title: '', subtitle: '', imageUrl: '', label: '' };
    case 'band':
      return { type, label: '' };
    case 'article':
      return { type, title: '', imageUrl: '', text: '' };
    case 'cta':
      return { type, label: '', href: '' };
    case 'calendar':
      return { type, items: [''] };
    case 'footer':
      return { type, text: '' };
  }
}

export function NewsletterSectionsEditor({ sections, onChange }: NewsletterSectionsEditorProps) {
  const update = (index: number, next: NewsletterSection) => {
    onChange(sections.map((s, i) => (i === index ? next : s)));
  };
  const remove = (index: number) => onChange(sections.filter((_, i) => i !== index));
  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  const add = (type: NewsletterSection['type']) => onChange([...sections, emptySection(type)]);

  return (
    <div className="space-y-3">
      {sections.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#E8ECEF] bg-[#FAFBFC] p-4 text-center text-sm text-[#8B939E]">
          Aucune section. Ajoutez des blocs pour composer votre newsletter.
        </p>
      ) : (
        sections.map((section, index) => (
          <SectionCard
            key={index}
            section={section}
            index={index}
            total={sections.length}
            onUpdate={(next) => update(index, next)}
            onRemove={() => remove(index)}
            onMove={(dir) => move(index, dir)}
          />
        ))
      )}

      <div className="flex flex-wrap gap-1.5">
        {ADDABLE.map((a) => (
          <button
            key={a.type}
            type="button"
            onClick={() => add(a.type)}
            className={cn(
              'flex items-center gap-1 rounded-full border border-[#E8ECEF] bg-white px-3 py-1.5 text-xs font-medium text-[#5C6470] transition-colors hover:border-[oklch(0.55_0.18_250/0.3)] hover:text-[oklch(0.55_0.18_250)]'
            )}
          >
            <Plus className="h-3 w-3" />
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
