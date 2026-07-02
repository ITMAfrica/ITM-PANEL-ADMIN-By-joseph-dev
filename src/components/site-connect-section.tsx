'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { apiFetch } from '@/lib/api-client';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  Check,
  Copy,
  Globe,
  Loader2,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Link2,
} from 'lucide-react';
import { toast } from 'sonner';

interface ConnectedSite {
  id: string;
  slug: string;
  name: string;
  url: string;
  status: string;
  embedScript: string;
  metaTag: string;
  reachable: boolean;
  verifiedAt: string | null;
}

export function SiteConnectSection() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const [siteUrl, setSiteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyingSlug, setVerifyingSlug] = useState<string | null>(null);
  const [sites, setSites] = useState<ConnectedSite[]>([]);
  const [latest, setLatest] = useState<ConnectedSite | null>(null);

  const loadSites = useCallback(async () => {
    if (!activeTenantId) return;
    try {
      const res = await apiFetch(`/sites?tenantId=${encodeURIComponent(activeTenantId)}`);
      if (!res.ok) return;
      const data = await res.json();
      setSites(data.sites || []);
    } catch {
      // ignore
    }
  }, [activeTenantId]);

  useEffect(() => {
    loadSites();
  }, [loadSites]);

  const copyText = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(label);
  };

  const handleConnect = async () => {
    if (!siteUrl.trim()) {
      toast.error(t.settings.siteConnectUrlRequired);
      return;
    }
    if (!activeTenantId) {
      toast.error(t.settings.siteConnectTenantRequired);
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/sites', {
        method: 'POST',
        body: JSON.stringify({ url: siteUrl.trim(), tenantId: activeTenantId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      setLatest(data);
      setSiteUrl('');
      await loadSites();
      toast.success(t.settings.siteConnectSuccess);
    } catch {
      toast.error(t.settings.siteConnectError);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (slug: string) => {
    setVerifyingSlug(slug);
    try {
      const res = await apiFetch(`/sites/${encodeURIComponent(slug)}/verify`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        if (data.reason === 'script_missing') {
          toast.error(t.settings.siteConnectScriptMissing);
        } else if (data.reason === 'unreachable') {
          toast.error(t.settings.siteConnectUnreachable);
        } else {
          toast.error(t.settings.siteConnectVerifyFailed);
        }
        return;
      }
      toast.success(t.settings.siteConnectVerified);
      await loadSites();
      if (latest?.slug === slug) {
        setLatest((prev) => (prev ? { ...prev, status: 'connected' } : prev));
      }
    } catch {
      toast.error(t.settings.siteConnectVerifyFailed);
    } finally {
      setVerifyingSlug(null);
    }
  };

  const displaySite = latest || sites[0];

  return (
    <div className="space-y-5">
      <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[oklch(0.55_0.18_250/0.1)] border border-[oklch(0.55_0.18_250/0.15)]">
              <Globe className="h-4 w-4 text-[oklch(0.55_0.18_250)]" />
            </div>
            <div>
              <CardTitle className="text-base">{t.settings.siteConnectTitle}</CardTitle>
              <CardDescription>{t.settings.siteConnectDesc}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-xl border border-dashed border-[oklch(0.55_0.18_250/0.25)] bg-[oklch(0.55_0.18_250/0.03)] p-4">
            <p className="text-xs text-muted-foreground mb-3">{t.settings.siteConnectSteps}</p>
            <div className="space-y-2">
              <Label htmlFor="site-url">{t.settings.siteConnectUrlLabel}</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="site-url"
                  placeholder="https://www.monsite.com"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                />
                <Button
                  onClick={handleConnect}
                  disabled={loading || !activeTenantId}
                  className="gap-1.5 shrink-0 bg-gradient-to-r from-[oklch(0.55_0.18_250)] to-[oklch(0.50_0.18_250)] text-white"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {t.settings.siteConnectButton}
                </Button>
              </div>
            </div>
          </div>

          {displaySite && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs',
                    displaySite.status === 'connected'
                      ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/5'
                      : 'border-amber-500/30 text-amber-600 bg-amber-500/5'
                  )}
                >
                  {displaySite.status === 'connected' ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      {t.settings.siteConnectStatusConnected}
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {t.settings.siteConnectStatusPending}
                    </>
                  )}
                </Badge>
                <span className="text-xs text-muted-foreground">{displaySite.url}</span>
                <span className="text-xs font-mono text-muted-foreground">slug: {displaySite.slug}</span>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">{t.settings.siteConnectEmbedLabel}</Label>
                <p className="text-xs text-muted-foreground">{t.settings.siteConnectEmbedHelp}</p>
                <div className="relative">
                  <pre className="text-sm leading-relaxed p-3 pr-12 rounded-lg bg-muted/60 border overflow-x-auto font-mono">
                    {displaySite.embedScript}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 h-7 text-xs gap-1"
                    onClick={() => copyText(displaySite.embedScript, t.settings.siteConnectCopied)}
                  >
                    <Copy className="h-3 w-3" />
                    {t.settings.siteConnectCopy}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">{t.settings.siteConnectFeedLabel}</Label>
                <div className="relative">
                  <pre className="text-sm p-3 pr-12 rounded-lg bg-muted/60 border overflow-x-auto font-mono">
                    {'<div data-itm-feed data-itm-type="article"></div>'}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 h-7 text-xs gap-1"
                    onClick={() =>
                      copyText(
                        '<div data-itm-feed data-itm-type="article"></div>',
                        t.settings.siteConnectCopied
                      )
                    }
                  >
                    <Copy className="h-3 w-3" />
                    {t.settings.siteConnectCopy}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  disabled={verifyingSlug === displaySite.slug}
                  onClick={() => handleVerify(displaySite.slug)}
                >
                  {verifyingSlug === displaySite.slug ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                  {t.settings.siteConnectVerify}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs"
                  asChild
                >
                  <a href={displaySite.url} target="_blank" rel="noopener noreferrer">
                    <Link2 className="h-3 w-3" />
                    {t.settings.siteConnectOpenSite}
                  </a>
                </Button>
              </div>
            </div>
          )}

          {sites.length > 1 && (
            <div className="space-y-2 pt-2 border-t">
              <Label className="text-sm">{t.settings.siteConnectAllSites}</Label>
              {sites.map((site) => (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => setLatest(site)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg border text-left hover:bg-muted/40 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{site.name}</p>
                    <p className="text-sm text-muted-foreground">{site.url}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {site.status === 'connected'
                      ? t.settings.siteConnectStatusConnected
                      : t.settings.siteConnectStatusPending}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
