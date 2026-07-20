'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { apiFetch } from '@/lib/api-client';
import { useTranslation } from '@/lib/i18n';
import { useMetaConnections, useDisconnectMetaConnection } from '@/hooks/use-meta-connections';
import { cn } from '@/lib/utils';
import { AlertCircle, Check, Facebook, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function MetaConnectSection() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const [starting, setStarting] = useState(false);
  const { data: connections, isLoading } = useMetaConnections(activeTenantId ?? '');
  const disconnect = useDisconnectMetaConnection();

  // Retour du dialogue OAuth : /settings?tab=integrations&meta=connected|denied|error
  useEffect(() => {
    const meta = searchParams.get('meta');
    if (!meta) return;
    if (meta === 'connected') {
      toast.success(t.settings.metaConnectSuccess);
    } else if (meta === 'denied') {
      toast.info(t.settings.metaConnectDenied);
    } else {
      toast.error(t.settings.metaConnectError);
    }
    // Nettoie le paramètre pour éviter de rejouer le toast au rafraîchissement.
    router.replace('/settings?tab=integrations');
  }, [searchParams, router, t]);

  const handleConnect = async () => {
    if (!activeTenantId) {
      toast.error(t.settings.siteConnectTenantRequired);
      return;
    }
    setStarting(true);
    const startUrl = `/meta/oauth/start?tenantId=${encodeURIComponent(activeTenantId)}`;
    try {
      // Preflight : détecte une app Meta non configurée (400) avant de naviguer.
      const res = await apiFetch(startUrl, { redirect: 'manual' });
      if (res.status === 400) {
        toast.error(t.settings.metaConnectNotConfigured);
        return;
      }
      window.location.assign(`/api${startUrl}`);
    } catch {
      toast.error(t.settings.metaConnectError);
    } finally {
      setStarting(false);
    }
  };

  const handleDisconnect = (id: string) => {
    if (!activeTenantId) return;
    disconnect.mutate(
      { id, tenantId: activeTenantId },
      {
        onSuccess: () => toast.success(t.settings.metaConnectDisconnected),
        onError: () => toast.error(t.settings.metaConnectDisconnectError),
      }
    );
  };

  return (
    <Card className="shadow-sm overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[oklch(0.55_0.18_250/0.1)] border border-[oklch(0.55_0.18_250/0.15)]">
            <Facebook className="h-4 w-4 text-[oklch(0.55_0.18_250)]" />
          </div>
          <div>
            <CardTitle className="text-base">{t.settings.metaConnectTitle}</CardTitle>
            <CardDescription>{t.settings.metaConnectDesc}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-xl border border-dashed border-[oklch(0.55_0.18_250/0.25)] bg-[oklch(0.55_0.18_250/0.03)] p-4">
          <p className="text-xs text-muted-foreground mb-3">{t.settings.metaConnectPermissions}</p>
          <Button
            onClick={handleConnect}
            disabled={starting || !activeTenantId}
            className="gap-1.5 bg-gradient-to-r from-[oklch(0.55_0.18_250)] to-[oklch(0.50_0.18_250)] text-white"
          >
            {starting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Facebook className="h-4 w-4" />
            )}
            {t.settings.metaConnectButton}
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t.common.loading}...</p>
        ) : !connections?.length ? (
          <p className="text-sm text-muted-foreground">{t.settings.metaConnectNoPages}</p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium">{t.settings.metaConnectPages}</p>
            {connections.map((connection) => (
              <div
                key={connection.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-lg border"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Facebook className="h-4 w-4 shrink-0 text-[oklch(0.55_0.18_250)]" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{connection.pageName}</p>
                    {connection.lastPublishAt && (
                      <p className="text-xs text-muted-foreground">
                        {t.settings.metaConnectLastPublish}:{' '}
                        {new Date(connection.lastPublishAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      connection.status === 'connected'
                        ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/5'
                        : 'border-amber-500/30 text-amber-600 bg-amber-500/5'
                    )}
                  >
                    {connection.status === 'connected' ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        {t.settings.metaConnectStatusConnected}
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {t.settings.metaConnectStatusError}
                      </>
                    )}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs text-muted-foreground hover:text-destructive"
                    disabled={disconnect.isPending}
                    onClick={() => handleDisconnect(connection.id)}
                  >
                    {disconnect.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                    {t.settings.metaConnectDisconnect}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
