import type { Request, Response } from 'express';
import { metaOAuthCallbackSchema } from '../lib/schemas';
import * as metaConnectionService from '../services/meta-connection.service';

function getAppUrl(): string {
  return (process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3002').replace(
    /\/$/,
    ''
  );
}

function settingsUrl(params: Record<string, string>): string {
  const search = new URLSearchParams({ tab: 'integrations', ...params });
  return `${getAppUrl()}/settings?${search.toString()}`;
}

/**
 * GET /api/meta/oauth/start — lance le dialogue OAuth Meta (session requise).
 * Redirige vers facebook.com ; l'utilisateur revient sur /oauth/callback.
 */
export async function oauthStart(req: Request, res: Response) {
  try {
    const config = metaConnectionService.getMetaOAuthConfig();
    if (!config) {
      res.status(400).json({
        error: 'meta_not_configured',
        message: 'META_APP_ID / META_APP_SECRET are not configured on the server.',
      });
      return;
    }
    const tenantId = req.authorizedTenantId!;
    const state = await metaConnectionService.createOAuthState(tenantId, req.user!.id);
    res.redirect(metaConnectionService.buildOAuthDialogUrl(config, state));
  } catch (error) {
    console.error('GET /api/meta/oauth/start:', error);
    res.status(500).json({ error: 'Failed to start Meta OAuth' });
  }
}

/**
 * GET /api/meta/oauth/callback — retour public du dialogue Meta (rate-limité).
 * Toujours une redirection vers Settings : jamais de JSON ni de token exposé.
 */
export async function oauthCallback(req: Request, res: Response) {
  const parsed = metaOAuthCallbackSchema.safeParse(req.query);
  if (!parsed.success) {
    res.redirect(settingsUrl({ meta: 'error' }));
    return;
  }
  const { code, state, error, error_description } = parsed.data;

  if (error) {
    console.warn(`[meta] OAuth denied by user: ${error} (${error_description ?? 'n/a'})`);
    res.redirect(settingsUrl({ meta: 'denied' }));
    return;
  }
  if (!code || !state) {
    res.redirect(settingsUrl({ meta: 'error' }));
    return;
  }

  const statePayload = await metaConnectionService.verifyOAuthState(state);
  if (!statePayload) {
    console.warn('[meta] OAuth callback with invalid/expired state');
    res.redirect(settingsUrl({ meta: 'error' }));
    return;
  }

  try {
    const pages = await metaConnectionService.handleOAuthCallback(code, statePayload);
    res.redirect(settingsUrl({ meta: 'connected', pages: String(pages.length) }));
  } catch (err) {
    console.error('GET /api/meta/oauth/callback:', err);
    res.redirect(settingsUrl({ meta: 'error' }));
  }
}

export async function list(req: Request, res: Response) {
  try {
    const tenantId = req.authorizedTenantId!;
    const rows = await metaConnectionService.listConnections(tenantId);
    res.json(rows);
  } catch (error) {
    console.error('GET /api/meta/connections:', error);
    res.status(500).json({ error: 'Failed to fetch Meta connections' });
  }
}

export async function disconnect(req: Request, res: Response) {
  try {
    const tenantId = req.authorizedTenantId!;
    const removed = await metaConnectionService.disconnectPage(tenantId, req.params.id as string);
    if (!removed) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/meta/connections/:id:', error);
    res.status(500).json({ error: 'Failed to disconnect Meta page' });
  }
}
