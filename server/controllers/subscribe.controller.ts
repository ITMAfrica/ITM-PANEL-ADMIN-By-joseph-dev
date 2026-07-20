import type { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import { db } from '../lib/prisma';
import { parseBody } from '../lib/validate';
import { CONSENT_TEXT_VERSION, publicSubscribeSchema } from '../lib/schemas';
import { locateRequest } from '../lib/geo';

async function findTenantForChannel(channelId: string): Promise<string | null> {
  const channel = await db.distributionChannel.findUnique({
    where: { id: channelId },
    select: { tenantId: true, type: true },
  });
  // Un canal social (Page Facebook) ne supporte pas l'inscription email.
  if (!channel || channel.type === 'social') return null;
  return channel.tenantId;
}

async function resolveToken(
  token: string
): Promise<{ channelId: string; tenantId: string } | null> {
  const widgetToken = await db.widgetToken.findUnique({
    where: { token },
    select: { channelId: true, tenantId: true, expiresAt: true },
  });
  if (!widgetToken) return null;
  if (widgetToken.expiresAt && widgetToken.expiresAt < new Date()) return null;
  return { channelId: widgetToken.channelId, tenantId: widgetToken.tenantId };
}

function buildSubscriptionMetadata(
  body: {
    siteSlug?: string;
    context?: {
      pageUrl?: string;
      referrer?: string;
      siteSlug?: string;
      utm?: {
        source?: string;
        medium?: string;
        campaign?: string;
        term?: string;
        content?: string;
      };
    };
    technical?: {
      language?: string;
      timezone?: string;
      userAgent?: string;
    };
  },
  req: Request
): Prisma.InputJsonValue {
  const uaHeader = req.get('user-agent') ?? undefined;
  return {
    context: {
      pageUrl: body.context?.pageUrl,
      referrer: body.context?.referrer,
      siteSlug: body.context?.siteSlug ?? body.siteSlug,
      utm: body.context?.utm ?? {},
    },
    technical: {
      language: body.technical?.language,
      timezone: body.technical?.timezone,
      userAgent: body.technical?.userAgent ?? uaHeader,
    },
  };
}

export async function subscribe(req: Request, res: Response) {
  try {
    const body = parseBody(publicSubscribeSchema, req, res);
    if (!body) return;

    let channelId: string;
    let tenantId: string | null;

    if (body.token) {
      const resolved = await resolveToken(body.token);
      if (!resolved) {
        res.status(404).json({ error: 'Invalid or expired token' });
        return;
      }
      channelId = resolved.channelId;
      tenantId = resolved.tenantId;
    } else {
      channelId = body.channelId!;
      tenantId = await findTenantForChannel(channelId);
    }

    if (!tenantId) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    const siteSlug = body.context?.siteSlug ?? body.siteSlug;
    const site = siteSlug
      ? await db.site.findFirst({
          where: { slug: siteSlug, tenantId },
        })
      : null;
    // siteSlug is optional provenance. An unknown/mismatched slug must not
    // block public subscribe (common when testing embeds on localhost).

    const subscriber = await db.subscriber.upsert({
      where: { tenantId_email: { tenantId, email: body.email } },
      update: { name: body.name ?? undefined },
      create: { email: body.email, name: body.name ?? null, tenantId },
    });

    const formKey = body.formKey ?? 'default';
    const source = await db.subscriptionSource.upsert({
      where: { channelId_formKey: { channelId, formKey } },
      update: {},
      create: {
        id: `src_${channelId}_${formKey}`,
        tenantId,
        channelId,
        siteId: site?.id ?? null,
        formKey,
        type: site ? 'site' : 'direct',
      },
    });

    const geo = locateRequest(req);
    const metadata = buildSubscriptionMetadata(body, req);
    const consentTextVersion = body.consent.textVersion ?? CONSENT_TEXT_VERSION;
    const trackingData = {
      status: 'subscribed' as const,
      consentedAt: new Date(),
      consentNewsletter: true,
      consentPrivacy: true,
      consentTextVersion,
      ipAddress: req.ip ? String(req.ip) : null,
      city: geo.city,
      country: geo.country,
      metadata,
      sourceId: source.id,
    };

    const subscription = await db.subscription.upsert({
      where: {
        subscriberId_channelId: {
          subscriberId: subscriber.id,
          channelId,
        },
      },
      update: trackingData,
      create: {
        subscriberId: subscriber.id,
        channelId,
        ...trackingData,
      },
    });

    const subscriberCount = await db.subscription.count({
      where: { channelId, status: 'subscribed' },
    });
    await db.distributionChannel.update({
      where: { id: channelId },
      data: { subscriberCount },
    });

    // The unsubscribe token must NEVER be returned on a public (unauthenticated)
    // endpoint: it would let anyone who knows an email unsubscribe on behalf of
    // a subscriber. It is delivered only by email link.
    res.status(201).json({
      ok: true,
      subscriptionId: subscription.id,
    });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      res.status(409).json({ error: 'Subscriber already exists' });
      return;
    }
    console.error('POST /api/public/subscribe', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
}

export async function unsubscribe(req: Request, res: Response) {
  try {
    const token = (req.query.token as string) || (req.body?.token as string);
    if (!token) {
      res.status(400).json({ error: 'token is required' });
      return;
    }
    const subscriber = await db.subscriber.findUnique({ where: { unsubscribeToken: token } });
    if (!subscriber) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    await db.subscription.updateMany({
      where: { subscriberId: subscriber.id },
      data: { status: 'unsubscribed' },
    });
    res.json({ ok: true });
  } catch (error) {
    console.error('GET /api/public/unsubscribe', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
}
