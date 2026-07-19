'use client';

import { useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';
import { Code, Copy, Check, Mail, Puzzle, RefreshCw, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { useDistributionChannels } from '@/hooks/use-distribution-channels';
import { useCreateWidgetToken, useDeleteWidgetToken } from '@/hooks/use-widget-token';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

function getWidgetBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${window.location.protocol}//${hostname}:3001/api`;
    }
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) return apiUrl.replace(/\/$/, '');
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:3001/api';
}

interface NewsletterEmbedDialogProps {
  /** Canal pré-sélectionné à l'ouverture (optionnel). */
  initialChannelId?: string;
  /** Remplacer le bouton déclencheur par un élément personnalisé. */
  trigger?: ReactNode;
  /** Variante d'affichage du déclencheur. */
  variant?: 'toolbar' | 'composer';
}

export function NewsletterEmbedDialog({
  initialChannelId,
  trigger,
  variant = 'toolbar',
}: NewsletterEmbedDialogProps = {}) {
  const { t, locale } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const { data: channels = [] } = useDistributionChannels(activeTenantId);
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [widgetToken, setWidgetToken] = useState<string | null>(null);

  const createToken = useCreateWidgetToken();
  const deleteToken = useDeleteWidgetToken();

  const activeChannels = useMemo(
    () => channels.filter((ch) => ch.isActive),
    [channels]
  );

  const selectedChannel = useMemo(
    () => activeChannels.find((ch) => ch.id === selectedChannelId),
    [activeChannels, selectedChannelId]
  );

  // Auto-generate a widget token when a channel is selected.
  useEffect(() => {
    if (!selectedChannelId || !activeTenantId) {
      setWidgetToken(null);
      return;
    }

    let cancelled = false;

    createToken.mutate(
      { channelId: selectedChannelId, tenantId: activeTenantId },
      {
        onSuccess: (data) => {
          if (!cancelled) setWidgetToken(data.token);
        },
        onError: (err) => {
          if (!cancelled) {
            console.error('Failed to create widget token:', err);
            setWidgetToken(null);
          }
        },
      }
    );

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChannelId, activeTenantId]);

  const embedSnippet = useMemo(() => {
    if (!selectedChannelId) return '';
    const baseUrl = getWidgetBaseUrl();
    if (widgetToken) {
      return `<script src="${baseUrl}/widgets/subscribe?token=${widgetToken}" async></script>`;
    }
    // Only show channelId fallback if token generation failed
    return '';
  }, [selectedChannelId, widgetToken]);

  const handleCopy = useCallback(async () => {
    if (!embedSnippet) return;
    try {
      await navigator.clipboard.writeText(embedSnippet);
      setCopied(true);
      toast.success(locale === 'fr' ? 'Code copié !' : 'Code copied!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = embedSnippet;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [embedSnippet, locale]);

  const handleRegenerateToken = () => {
    if (!selectedChannelId || !activeTenantId) return;
    deleteToken.mutate(
      { channelId: selectedChannelId, tenantId: activeTenantId },
      {
        onSuccess: () => {
          createToken.mutate(
            { channelId: selectedChannelId, tenantId: activeTenantId },
            {
              onSuccess: (data) => {
                setWidgetToken(data.token);
                toast.success(
                  locale === 'fr' ? 'Token régénéré' : 'Token regenerated'
                );
              },
            }
          );
        },
      }
    );
  };

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen && initialChannelId) {
      setSelectedChannelId(initialChannelId);
    }
    if (!nextOpen) {
      setSelectedChannelId('');
      setWidgetToken(null);
      setCopied(false);
    }
  }, [initialChannelId]);

  const isGenerating = createToken.isPending || deleteToken.isPending;

  const defaultTrigger = variant === 'composer' ? (
    <Button
      variant="outline"
      size="sm"
      className="h-9 w-full justify-start gap-2.5 border border-dashed border-[#E8ECEF] bg-white text-sm text-muted-foreground hover:text-foreground hover:border-[oklch(0.55_0.18_250/0.4)] hover:bg-[oklch(0.55_0.18_250/0.04)] transition-colors"
    >
      <Puzzle className="h-4 w-4 text-[#5C6470]" />
      {t.newsletters.embed}
    </Button>
  ) : (
    <Button
      size="sm"
      variant="outline"
      className="h-9 border-[#E8ECEF] bg-white text-sm gap-2 hover:bg-[#F5F7F9]"
    >
      <Code className="h-4 w-4 text-[oklch(0.55_0.18_250)]" />
      <span className="hidden sm:inline">{t.newsletters.embed}</span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? defaultTrigger}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-[oklch(0.55_0.18_250)]" />
            {t.newsletterEmbed.title}
          </DialogTitle>
          <DialogDescription>
            {t.newsletterEmbed.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Sélecteur de canal */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t.newsletterEmbed.selectChannel}
            </label>
            <Select value={selectedChannelId} onValueChange={setSelectedChannelId}>
              <SelectTrigger className="h-10 w-full border-[#E8ECEF] bg-white text-sm">
                <SelectValue placeholder={t.newsletterEmbed.channelRequired} />
              </SelectTrigger>
              <SelectContent>
                {activeChannels.length === 0 ? (
                  <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                    {locale === 'fr'
                      ? 'Aucun canal actif disponible.'
                      : 'No active channels available.'}
                  </div>
                ) : (
                  activeChannels.map((ch) => (
                    <SelectItem key={ch.id} value={ch.id}>
                      <span className="flex items-center gap-2">
                        <span>{ch.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({ch.subscriberCount}{' '}
                          {locale === 'fr' ? 'abonnés' : 'subscribers'})
                        </span>
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t.newsletterEmbed.channelHint}
            </p>
          </div>

          {/* Code d'embed (affiché seulement si un canal est sélectionné) */}
          <AnimatePresence>
            {selectedChannelId && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    {t.newsletterEmbed.embedCode}
                  </label>
                  <div className="relative">
                    {isGenerating ? (
                      <div className="flex items-center gap-2 rounded-xl border border-[#E8ECEF] bg-[#F5F7F9] p-4">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {locale === 'fr' ? 'Génération du token...' : 'Generating token...'}
                        </span>
                      </div>
                    ) : embedSnippet ? (
                      <>
                        <pre className="rounded-xl border border-[#E8ECEF] bg-[#F5F7F9] p-4 text-sm text-[#1D141F] overflow-x-auto font-mono whitespace-pre-wrap break-all leading-relaxed">
                          {embedSnippet}
                        </pre>
                        <div className="absolute top-2 right-2 flex gap-1">
                          {widgetToken && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 border-[#E8ECEF] bg-white text-xs"
                              onClick={handleRegenerateToken}
                              disabled={isGenerating}
                              title={locale === 'fr' ? 'Régénérer le token' : 'Regenerate token'}
                            >
                              <RefreshCw className={cn('h-3 w-3', isGenerating && 'animate-spin')} />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className={cn(
                              'h-8 border-[#E8ECEF] bg-white text-xs gap-1.5',
                              copied && 'border-emerald-400 bg-emerald-50 text-emerald-700'
                            )}
                            onClick={handleCopy}
                          >
                            {copied ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                {t.newsletterEmbed.copied}
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                {t.newsletterEmbed.copy}
                              </>
                            )}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-700">
                        {locale === 'fr'
                          ? 'Impossible de générer le token. Vérifiez vos permissions.'
                          : 'Unable to generate token. Check your permissions.'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Security note */}
                {widgetToken && !isGenerating && (
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                    <p className="text-xs text-emerald-700">
                      {locale === 'fr'
                        ? "L'identifiant interne du canal est masqué. Un token opaque protège le code public."
                        : 'Internal channel ID is hidden. An opaque token protects the public code.'}
                    </p>
                  </div>
                )}

                {/* Aperçu du widget */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {t.newsletterEmbed.preview}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {t.newsletterEmbed.previewNote}
                  </p>
                  <div className="rounded-xl border border-[#E8ECEF] bg-white p-5">
                    <div className="flex gap-2 flex-wrap max-w-[340px] mx-auto">
                      <input
                        className="flex-1 min-w-0 px-3 py-2.5 border border-[#d1d5db] rounded-[10px] text-[15px] outline-none bg-white text-[#111827] placeholder:text-[#9ca3af]"
                        type="email"
                        placeholder={locale === 'fr' ? 'votre@email.com' : 'your@email.com'}
                        disabled
                      />
                      <button
                        className="shrink-0 px-5 py-2.5 bg-[#3b82f6] text-white border-none rounded-[10px] text-[15px] font-semibold"
                        disabled
                      >
                        {locale === 'fr' ? "S'abonner" : 'Subscribe'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenChange(false)}
            className="h-9 border-[#E8ECEF] bg-white text-sm"
          >
            {t.common.close}
          </Button>
          {embedSnippet && (
            <Button
              size="sm"
              onClick={handleCopy}
              className="h-9 text-sm gap-2"
              style={{ backgroundColor: '#1D141F', color: '#E2F343' }}
            >
              <Copy className="h-4 w-4" />
              {t.newsletterEmbed.copy}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
