import type { Request, Response } from 'express';
import { db } from '../lib/prisma';
import { getUserTenantRole, isSuperAdmin, roleMeetsOrExceeds, userCanAccessTenant } from '../lib/tenant-access';
import { parseBody } from '../lib/validate';
import { subscriberCreateSchema } from '../lib/schemas';

function mapSubscriber(
  s: {
    id: string;
    email: string;
    name: string | null;
    tenantId: string;
    status: string;
    createdAt: Date;
  },
  subscription?: {
    city: string | null;
    country: string | null;
    consentNewsletter: boolean;
    consentPrivacy: boolean;
    consentTextVersion: string | null;
    consentedAt: Date;
    metadata: unknown;
  } | null
) {
  return {
    id: s.id,
    email: s.email,
    name: s.name,
    tenantId: s.tenantId,
    status: s.status,
    createdAt: s.createdAt.toISOString(),
    ...(subscription
      ? {
          city: subscription.city,
          country: subscription.country,
          consentNewsletter: subscription.consentNewsletter,
          consentPrivacy: subscription.consentPrivacy,
          consentTextVersion: subscription.consentTextVersion,
          consentedAt: subscription.consentedAt.toISOString(),
          metadata: subscription.metadata ?? {},
        }
      : {}),
  };
}

export async function list(req: Request, res: Response) {
  try {
    const tenantId = req.authorizedTenantId!;
    const channelId = req.query.channelId as string | undefined;
    const rows = await db.subscriber.findMany({
      where: {
        tenantId,
        ...(channelId
          ? { subscriptions: { some: { channelId, status: 'subscribed' } } }
          : {}),
      },
      include: channelId
        ? {
            subscriptions: {
              where: { channelId, status: 'subscribed' },
              take: 1,
              select: {
                city: true,
                country: true,
                consentNewsletter: true,
                consentPrivacy: true,
                consentTextVersion: true,
                consentedAt: true,
                metadata: true,
              },
            },
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
    });
    res.json(
      rows.map((row) => {
        const sub = 'subscriptions' in row ? row.subscriptions[0] : null;
        return mapSubscriber(row, sub);
      })
    );
  } catch (error) {
    console.error('GET /api/subscribers', error);
    res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
}

async function getAuthorizedSubscriber(req: Request, id: string) {
  const row = await db.subscriber.findUnique({ where: { id } });
  if (!row || !req.user) return null;
  if (!(await userCanAccessTenant(req.user, row.tenantId))) return null;
  return row;
}

async function getAuthorizedSubscriberWithRole(
  req: Request,
  id: string,
  requiredRole: string
) {
  const row = await getAuthorizedSubscriber(req, id);
  if (!row || !req.user) return null;
  const effectiveRole = await getUserTenantRole(req.user, row.tenantId);
  if (!effectiveRole) return null;
  if (isSuperAdmin(req.user) || roleMeetsOrExceeds(effectiveRole, requiredRole)) return row;
  return null;
}

export async function count(req: Request, res: Response) {
  try {
    const tenantId = req.authorizedTenantId!;
    const total = await db.subscriber.count({ where: { tenantId } });
    res.json({ total });
  } catch (error) {
    console.error('GET /api/subscribers/count', error);
    res.status(500).json({ error: 'Failed to count subscribers' });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const body = parseBody(subscriberCreateSchema, req, res);
    if (!body) return;

    const tenantId = req.authorizedTenantId!;
    const channel = await db.distributionChannel.findUnique({ where: { id: body.channelId } });
    if (!channel || channel.tenantId !== tenantId) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }
    // Un canal social (Page Facebook) n'a pas d'abonnés email.
    if (channel.type === 'social') {
      res.status(400).json({ error: 'Social channels do not accept subscribers' });
      return;
    }

    const row = await db.subscriber.upsert({
      where: { tenantId_email: { tenantId, email: body.email } },
      update: {},
      create: { email: body.email, name: body.name ?? null, tenantId },
    });

    await db.subscription.upsert({
      where: {
        subscriberId_channelId: { subscriberId: row.id, channelId: body.channelId },
      },
      update: { status: 'subscribed' },
      create: {
        subscriberId: row.id,
        channelId: body.channelId,
        sourceId: `src_${body.channelId}`,
        status: 'subscribed',
      },
    });

    const subscriberCount = await db.subscription.count({
      where: { channelId: body.channelId, status: 'subscribed' },
    });
    await db.distributionChannel.update({
      where: { id: body.channelId },
      data: { subscriberCount },
    });
    res.status(201).json(mapSubscriber(row));
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2002') {
      res.status(409).json({ error: 'Subscriber already exists for this channel' });
      return;
    }
    console.error('POST /api/subscribers', error);
    res.status(500).json({ error: 'Failed to create subscriber' });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const existing = await getAuthorizedSubscriberWithRole(req, req.params.id as string, 'editor');
    if (!existing) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const channelIds = (
      await db.subscription.findMany({
        where: { subscriberId: existing.id },
        select: { channelId: true },
      })
    ).map((s) => s.channelId);
    await db.subscriber.delete({ where: { id: existing.id } });
    await Promise.all(
      [...new Set(channelIds)].map(async (channelId) => {
        const subscriberCount = await db.subscription.count({
          where: { channelId, status: 'subscribed' },
        });
        await db.distributionChannel.update({
          where: { id: channelId },
          data: { subscriberCount },
        });
      })
    );
    res.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/subscribers', error);
    res.status(500).json({ error: 'Failed to delete subscriber' });
  }
}
