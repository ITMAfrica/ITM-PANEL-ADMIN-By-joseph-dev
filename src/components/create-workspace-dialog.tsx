'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { apiFetch } from '@/lib/api-client';
import { useTranslation } from '@/lib/i18n';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  WORKSPACE_COLOR_OPTIONS,
  WORKSPACE_ICON_OPTIONS,
  WorkspaceIcon,
} from '@/lib/workspace-icons';

export function CreateWorkspaceDialog() {
  const createWorkspaceDialogOpen = useAppStore((s) => s.createWorkspaceDialogOpen);
  const setCreateWorkspaceDialogOpen = useAppStore((s) => s.setCreateWorkspaceDialogOpen);
  const addWorkspace = useAppStore((s) => s.addWorkspace);
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('building-2');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || isSubmitting) return;

    const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setIsSubmitting(true);

    try {
      const res = await apiFetch('/workspaces', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          slug,
          description: description.trim() || undefined,
          color: selectedColor,
          icon: selectedIcon,
        }),
      });

      if (!res.ok) {
        toast.error(t.createWorkspace.createError);
        return;
      }

      const workspace = await res.json();
      addWorkspace({
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        color: workspace.color ?? selectedColor,
        icon: workspace.icon ?? selectedIcon,
      });
      toast.success(t.toast.workspaceCreated);
      setCreateWorkspaceDialogOpen(false);
      resetForm();
    } catch {
      toast.error(t.createWorkspace.createError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedIcon('building-2');
    setSelectedColor('#3b82f6');
  };

  const handleOpenChange = (open: boolean) => {
    setCreateWorkspaceDialogOpen(open);
    if (!open) resetForm();
  };

  return (
    <Dialog open={createWorkspaceDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Gradient Header */}
        <div className="relative shrink-0 px-6 pt-5 pb-3 border-b">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              background: `linear-gradient(135deg, ${selectedColor} 0%, transparent 60%)`,
            }}
          />
          <DialogHeader className="relative">
            <DialogTitle className="text-lg font-semibold">{t.createWorkspace.title}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t.createWorkspace.descriptionPlaceholder}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-3 min-h-0">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="ws-name" className="text-sm font-medium">
              {t.createWorkspace.name}
            </Label>
            <Input
              id="ws-name"
              placeholder={t.createWorkspace.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="ws-desc" className="text-sm font-medium">
              {t.createWorkspace.description}
            </Label>
            <Textarea
              id="ws-desc"
              placeholder={t.createWorkspace.descriptionPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[56px] resize-none"
            />
          </div>

          {/* Appearance */}
          <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-4">
            <div className="space-y-2.5">
              <Label className="text-xs font-medium text-muted-foreground">
                {t.createWorkspace.icon}
              </Label>
              <div className="grid grid-cols-6 gap-1.5">
                {WORKSPACE_ICON_OPTIONS.map((iconId) => {
                  const isSelected = selectedIcon === iconId;
                  return (
                    <button
                      key={iconId}
                      type="button"
                      aria-label={iconId}
                      aria-pressed={isSelected}
                      className={cn(
                        'h-9 w-full rounded-lg flex items-center justify-center transition-all duration-150',
                        'text-muted-foreground hover:text-foreground hover:bg-background/70',
                        isSelected && 'bg-background text-foreground shadow-sm'
                      )}
                      style={
                        isSelected
                          ? { boxShadow: `0 0 0 2px var(--background), 0 0 0 4px ${selectedColor}` }
                          : undefined
                      }
                      onClick={() => setSelectedIcon(iconId)}
                    >
                      <WorkspaceIcon icon={iconId} className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-border/40" />

            <div className="space-y-2.5">
              <Label className="text-xs font-medium text-muted-foreground">
                {t.createWorkspace.color}
              </Label>
              <div className="flex flex-wrap gap-2">
                {WORKSPACE_COLOR_OPTIONS.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      aria-label={color}
                      aria-pressed={isSelected}
                      className={cn(
                        'h-6 w-6 rounded-full transition-all duration-150',
                        'hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        isSelected && 'scale-105'
                      )}
                      style={{
                        backgroundColor: color,
                        ...(isSelected
                          ? { boxShadow: `0 0 0 2px var(--background), 0 0 0 4px ${color}` }
                          : {}),
                      }}
                      onClick={() => setSelectedColor(color)}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">{t.createWorkspace.preview}</Label>
            <div className="rounded-lg border bg-muted/20 p-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center shadow-sm shrink-0"
                  style={{ backgroundColor: selectedColor }}
                >
                  <WorkspaceIcon icon={selectedIcon} className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {name || t.createWorkspace.namePlaceholder}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {description || t.createWorkspace.descriptionPlaceholder}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="shrink-0 px-6 py-3 border-t bg-background flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="flex-1"
          >
            {t.createWorkspace.cancel}
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || isSubmitting}
            className="flex-1 bg-[oklch(0.55_0.18_250)] hover:bg-[oklch(0.50_0.15_160)] text-white"
          >
            {isSubmitting ? t.createWorkspace.creating : t.createWorkspace.create}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
