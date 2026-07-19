'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { apiFetch } from '@/lib/api-client';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDistributionChannels } from '@/hooks/use-distribution-channels';
import { useCreateWidgetToken, useDeleteWidgetToken } from '@/hooks/use-widget-token';
import { Copy, Check, Code2, Mail, Globe, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function SubscribeWidgetGenerator() {
  const { t, locale } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const { data: channels = [] } = useDistributionChannels(activeTenantId);
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [widgetToken, setWidgetToken] = useState<string | null>(null);

  const createToken = useCreateWidgetToken();
  const deleteToken = useDeleteWidgetToken();

  // Derive the effective channel ID: user selection or first active channel
  const effectiveChannelId = useMemo(() => {
    if (selectedChannelId) return selectedChannelId;
    const firstActive = channels.find((c) => c.isActive);
    return firstActive?.id ?? '';
  }, [selectedChannelId, channels]);

  const activeChannels = channels.filter((c) => c.isActive);
  const selectedChannel = channels.find((c) => c.id === effectiveChannelId);

  const apiOrigin = useCallback(() => {
    return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '');
  }, []);

  // Auto-generate a widget token when the effective channel changes.
  useEffect(() => {
    if (!effectiveChannelId || !activeTenantId) {
      setWidgetToken(null);
      return;
    }

    let cancelled = false;

    createToken.mutate(
      { channelId: effectiveChannelId, tenantId: activeTenantId },
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
  }, [effectiveChannelId, activeTenantId]);

  const widgetScript = useMemo(() => {
    if (!selectedChannel || !widgetToken) return '';
    return `<script src="${apiOrigin()}/api/widgets/subscribe?token=${widgetToken}" async></script>`;
  }, [selectedChannel, widgetToken, apiOrigin]);

  const copyScript = async () => {
    if (!widgetScript) return;
    await navigator.clipboard.writeText(widgetScript);
    setCopied(true);
    toast.success(locale === 'fr' ? 'Code copié !' : 'Code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateToken = () => {
    if (!effectiveChannelId || !activeTenantId) return;
    deleteToken.mutate(
      { channelId: effectiveChannelId, tenantId: activeTenantId },
      {
        onSuccess: () => {
          // After deletion, re-create the token
          createToken.mutate(
            { channelId: effectiveChannelId, tenantId: activeTenantId },
            {
              onSuccess: (data) => {
                setWidgetToken(data.token);
                toast.success(
                  locale === 'fr' ? 'Token régénéré avec succès' : 'Token regenerated successfully'
                );
              },
            }
          );
        },
        onError: (err) => {
          console.error('Failed to regenerate token:', err);
          toast.error(locale === 'fr' ? 'Échec de la régénération' : 'Token regeneration failed');
        },
      }
    );
  };

  const isGenerating = createToken.isPending || deleteToken.isPending;

  if (!activeTenantId) return null;

  return (
    <div className="space-y-5">
      {/* Step 1: Choose channel */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.55_0.18_250/0.08)] border border-[oklch(0.55_0.18_250/0.12)]">
            <Mail className="h-5 w-5 text-[oklch(0.55_0.18_250)]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {locale === 'fr' ? "Widget d'abonnement" : 'Subscribe Widget'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {locale === 'fr'
                ? "Générez un bloc de code à coller sur n'importe quel site web"
                : 'Generate a code block to paste on any website'}
            </p>
          </div>
        </div>

        {activeChannels.length === 0 ? (
          <div className="rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5 p-4 text-center">
            <p className="text-sm text-amber-600">
              {locale === 'fr'
                ? "Aucun canal actif. Créez d'abord un canal dans Diffusion → Channels."
                : 'No active channels. Create one first in Distribution → Channels.'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-4">
              <Label className="text-sm">
                {locale === 'fr' ? 'Canal de diffusion' : 'Distribution channel'}
              </Label>
              <ScrollArea className="max-h-[200px] rounded-lg border">
                <div className="p-1">
                  {activeChannels.map((channel) => (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => setSelectedChannelId(channel.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors',
                        selectedChannelId === channel.id
                          ? 'bg-[oklch(0.55_0.18_250/0.08)] text-[oklch(0.55_0.18_250)] font-medium'
                          : 'text-foreground hover:bg-muted/50'
                      )}
                    >
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate">{channel.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {channel.subscriberCount}{' '}
                        {locale === 'fr' ? 'abonnés' : 'subscribers'}
                      </span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Security note */}
            {widgetToken && (
              <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                <p className="text-xs text-emerald-700">
                  {locale === 'fr'
                    ? "L'identifiant interne du canal est masqué dans le code public. Un token opaque est utilisé à la place."
                    : 'The internal channel ID is hidden from public code. An opaque token is used instead.'}
                </p>
              </div>
            )}

            {/* Preview */}
            <div className="space-y-3 rounded-lg border border-dashed border-[oklch(0.55_0.18_250/0.25)] bg-[oklch(0.55_0.18_250/0.03)] p-4">
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {locale === 'fr' ? 'Code à copier-coller' : 'Copy-paste code'}
                </span>
              </div>

              {/* Preview of what the widget will look like */}
              {selectedChannel && (
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                  <p className="text-xs text-muted-foreground mb-3">
                    {locale === 'fr' ? 'Aperçu du rendu sur le site :' : 'Widget preview:'}
                  </p>
                  <div
                    className="itm-subscribe-widget"
                    style={{
                      fontFamily:
                        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
                      maxWidth: '380px',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <input
                        type="email"
                        placeholder="votre@email.com"
                        readOnly
                        style={{
                          flex: '1 1 200px',
                          minWidth: 0,
                          padding: '10px 14px',
                          border: '1.5px solid #d1d5db',
                          borderRadius: 10,
                          fontSize: 15,
                          outline: 'none',
                          background: '#fff',
                          color: '#111827',
                        }}
                      />
                      <button
                        type="button"
                        style={{
                          flexShrink: 0,
                          padding: '10px 22px',
                          background: '#3b82f6',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 10,
                          fontSize: 15,
                          fontWeight: 600,
                          cursor: 'default',
                        }}
                      >
                        {locale === 'fr' ? "S'abonner" : 'Subscribe'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* The actual code */}
              <div className="relative">
                {isGenerating ? (
                  <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/60 border">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {locale === 'fr' ? 'Génération du token...' : 'Generating token...'}
                    </span>
                  </div>
                ) : (
                  <pre className="text-sm leading-relaxed p-3 pr-12 rounded-lg bg-muted/60 border overflow-x-auto font-mono whitespace-pre-wrap break-all">
                    {widgetScript}
                  </pre>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  {widgetToken && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
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
                    className="h-7 text-xs gap-1"
                    onClick={copyScript}
                    disabled={isGenerating || !widgetScript}
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    {copied
                      ? locale === 'fr'
                        ? 'Copié !'
                        : 'Copied!'
                      : locale === 'fr'
                        ? 'Copier'
                        : 'Copy'}
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                <Code2 className="inline h-3 w-3 mr-1" />
                {locale === 'fr'
                  ? "Collez cette balise &lt;script&gt; n'importe où dans le &lt;body&gt; de votre site. Le formulaire s'affichera automatiquement."
                  : "Paste this &lt;script&gt; tag anywhere in your site's &lt;body&gt;. The form will render automatically."}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
