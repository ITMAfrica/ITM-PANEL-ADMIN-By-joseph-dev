import crypto from 'crypto';
import { SignJWT, jwtVerify } from 'jose';
import { z } from 'zod';
import { db } from '../lib/prisma';
import { getSecret } from '../lib/auth';
import { encryptSecret } from '../lib/crypto';
import { getApiOrigin } from './site.service';

/**
 * Connexion OAuth Meta (Facebook Login) → SocialConnection + DistributionChannel.
 * Ne stocke que des tokens CHIFFRÉS et ne renvoie jamais pageAccessToken.
 */

const STATE_TTL_SECONDS = 10 * 60; // 10 min, le temps de faire le dialogue Meta
export const META_OAUTH_SCOPES = ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts'];

type FetchImpl = (
  url: string,
  init?: { method?: string }
) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

export interface MetaOAuthConfig {
  appId: string;
  appSecret: string;
  apiVersion: string;
}

export function getMetaOAuthConfig(): MetaOAuthConfig | null {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) return null;
  return {
    appId,
    appSecret,
    apiVersion: process.env.META_GRAPH_API_VERSION ?? 'v23.0',
  };
}

export function getMetaRedirectUri(): string {
  return `${getApiOrigin()}/api/meta/oauth/callback`;
}

// ---------------------------------------------------------------------------
// State OAuth (anti-CSRF) : JWT court signé avec AUTH_SECRET, lié au tenant.
// ---------------------------------------------------------------------------

const statePayloadSchema = z.object({
  tenantId: z.string(),
  userId: z.string(),
  nonce: z.string(),
});

export async function createOAuthState(tenantId: string, userId: string): Promise<string> {
  return new SignJWT({ tenantId, userId, nonce: crypto.randomBytes(8).toString('hex') })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${STATE_TTL_SECONDS}s`)
    .sign(getSecret());
}

export async function verifyOAuthState(
  state: string
): Promise<{ tenantId: string; userId: string } | null> {
  try {
    const { payload } = await jwtVerify(state, getSecret());
    const parsed = statePayloadSchema.parse(payload);
    return { tenantId: parsed.tenantId, userId: parsed.userId };
  } catch {
    return null;
  }
}

export function buildOAuthDialogUrl(config: MetaOAuthConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: config.appId,
    redirect_uri: getMetaRedirectUri(),
    state,
    scope: META_OAUTH_SCOPES.join(','),
    response_type: 'code',
  });
  return `https://www.facebook.com/${config.apiVersion}/dialog/oauth?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Callback : échange du code → token longue durée → Pages de l'utilisateur.
// ---------------------------------------------------------------------------

interface GraphTokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: { message?: string };
}

interface GraphPagesResponse {
  data?: { id: string; name: string; access_token?: string }[];
  error?: { message?: string };
}

export interface ConnectedPage {
  pageId: string;
  pageName: string;
  channelId: string;
}

export async function handleOAuthCallback(
  code: string,
  state: { tenantId: string; userId: string },
  opts: { fetchImpl?: FetchImpl } = {}
): Promise<ConnectedPage[]> {
  const config = getMetaOAuthConfig();
  if (!config) throw new Error('meta_not_configured');
  const fetchImpl = opts.fetchImpl ?? (globalThis.fetch as unknown as FetchImpl);
  const graphBase = `https://graph.facebook.com/${config.apiVersion}`;

  const getJson = async (url: string) => {
    const res = await fetchImpl(url);
    const data = (await res.json().catch(() => ({}))) as GraphTokenResponse;
    if (!res.ok || data.error) {
      throw new Error(`Meta OAuth error (${res.status}): ${data.error?.message ?? 'unknown'}`);
    }
    return data;
  };

  // 1. Code → user access token court.
  const shortToken = await getJson(
    `${graphBase}/oauth/access_token?` +
      new URLSearchParams({
        client_id: config.appId,
        client_secret: config.appSecret,
        redirect_uri: getMetaRedirectUri(),
        code,
      }).toString()
  );
  if (!shortToken.access_token) throw new Error('Meta OAuth: missing short-lived token');

  // 2. Token court → user token longue durée (~60 j). Les Page tokens qui en
  //    dérivent sont alors durables (pas d'expiration pratique).
  const longToken = await getJson(
    `${graphBase}/oauth/access_token?` +
      new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: config.appId,
        client_secret: config.appSecret,
        fb_exchange_token: shortToken.access_token,
      }).toString()
  );
  const userToken = longToken.access_token ?? shortToken.access_token;

  // 3. Pages administrées par l'utilisateur, avec leur Page access token.
  const pages = (await getJson(
    `${graphBase}/me/accounts?` +
      new URLSearchParams({
        fields: 'id,name,access_token',
        limit: '100',
        access_token: userToken,
      }).toString()
  )) as GraphPagesResponse;

  const result: ConnectedPage[] = [];
  for (const page of pages.data ?? []) {
    if (!page.access_token) continue;
    const connection = await db.socialConnection.upsert({
      where: {
        tenantId_platform_pageId: {
          tenantId: state.tenantId,
          platform: 'facebook',
          pageId: page.id,
        },
      },
      create: {
        tenantId: state.tenantId,
        platform: 'facebook',
        pageId: page.id,
        pageName: page.name,
        pageAccessToken: encryptSecret(page.access_token),
        scopes: META_OAUTH_SCOPES,
        status: 'connected',
        connectedBy: state.userId,
      },
      update: {
        pageName: page.name,
        pageAccessToken: encryptSecret(page.access_token),
        scopes: META_OAUTH_SCOPES,
        status: 'connected',
        connectedBy: state.userId,
        lastError: null,
      },
    });

    // Le canal est le pointeur affichable dans l'UI (composer, calendrier).
    const existingChannel = await db.distributionChannel.findFirst({
      where: { socialConnectionId: connection.id },
    });
    const channel = existingChannel
      ? await db.distributionChannel.update({
          where: { id: existingChannel.id },
          data: { name: page.name, isActive: true, type: 'social', icon: 'facebook' },
        })
      : await db.distributionChannel.create({
          data: {
            tenantId: state.tenantId,
            name: page.name,
            type: 'social',
            icon: 'facebook',
            socialConnectionId: connection.id,
          },
        });

    result.push({ pageId: page.id, pageName: page.name, channelId: channel.id });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Lecture / déconnexion (mapping public : aucun secret).
// ---------------------------------------------------------------------------

export async function listConnections(tenantId: string) {
  const rows = await db.socialConnection.findMany({
    where: { tenantId },
    include: { channels: { select: { id: true, isActive: true } } },
    orderBy: { pageName: 'asc' },
  });
  return rows.map((row) => ({
    id: row.id,
    platform: row.platform,
    pageId: row.pageId,
    pageName: row.pageName,
    status: row.status,
    scopes: row.scopes,
    tokenExpiresAt: row.tokenExpiresAt?.toISOString() ?? null,
    lastPublishAt: row.lastPublishAt?.toISOString() ?? null,
    lastError: row.lastError,
    channelId: row.channels[0]?.id ?? null,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function disconnectPage(tenantId: string, connectionId: string): Promise<boolean> {
  const connection = await db.socialConnection.findFirst({
    where: { id: connectionId, tenantId },
  });
  if (!connection) return false;
  // Désactive le canal plutôt que de le supprimer : les contenus existants
  // gardent leurs metadata.channelIds cohérents. La FK SetNull nettoie le lien.
  await db.distributionChannel.updateMany({
    where: { socialConnectionId: connection.id },
    data: { isActive: false },
  });
  await db.socialConnection.delete({ where: { id: connection.id } });
  return true;
}
