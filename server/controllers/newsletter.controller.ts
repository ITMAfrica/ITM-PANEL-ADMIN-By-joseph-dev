import type { Request, Response } from 'express';
import { dispatchDueNewsletters, sendNewsletterById, computeRates } from '../services/newsletter.service';
import { db } from '../lib/prisma';
import { getUserTenantRole, isSuperAdmin, roleMeetsOrExceeds, userCanAccessTenant } from '../lib/tenant-access';
import { locateRequest } from '../lib/geo';

const TRANSPARENT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

function dispatchFailureMessage(reason: string | undefined, channelCount: number): string {
  switch (reason) {
    case 'no_channels_in_metadata':
      return 'Aucun canal configuré sur cette newsletter (metadata.channelIds vide).';
    case 'no_active_channels':
      return 'Les canaux liés sont inexistants ou inactifs (isActive=false).';
    case 'no_recipients':
      return 'Canaux trouvés mais aucun abonné actif (Subscription) dessus.';
    case 'already_sent':
      return 'Newsletter déjà envoyée (des NewsletterSend existent déjà).';
    case 'not_newsletter':
      return 'Contenu introuvable ou de type non newsletter.';
    default:
      return channelCount > 0
        ? 'Aucun destinataire ou envoi déjà effectué.'
        : 'Aucun canal ou déjà envoyé.';
  }
}

async function updateContentRates(contentId: string): Promise<void> {
  const sends = await db.newsletterSend.findMany({ where: { contentId } });
  const meta = await db.content
    .findUnique({ where: { id: contentId }, select: { metadata: true } })
    .then((row) => (row?.metadata && typeof row.metadata === 'object' ? (row.metadata as Record<string, unknown>) : {}));
  const { recipientCount, openRate, clickRate } = computeRates(sends);
  await db.content.update({
    where: { id: contentId },
    data: {
      metadata: {
        ...meta,
        recipientCount,
        openRate,
        clickRate,
      },
    },
  });
}

export async function dispatch(req: Request, res: Response) {
  try {
    const result = await dispatchDueNewsletters();
    res.json({ ok: true, ...result });
  } catch (error) {
    console.error('POST /api/newsletters/dispatch', error);
    res.status(500).json({
      error: 'Failed to dispatch newsletters',
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function sendOne(req: Request, res: Response) {
  const contentId = String(req.params.id);
  try {
    const content = await db.content.findUnique({ where: { id: contentId } });
    if (!content || !req.user) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }
    if (!(await userCanAccessTenant(req.user, content.tenantId))) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // Check workspace role: must be editor or higher in this tenant
    const effectiveRole = await getUserTenantRole(req.user, content.tenantId);
    if (!effectiveRole || (!isSuperAdmin(req.user) && !roleMeetsOrExceeds(effectiveRole, 'editor'))) {
      res.status(403).json({ error: 'Forbidden: insufficient workspace role' });
      return;
    }

    const result = await sendNewsletterById(contentId);
    if (result.recipients === 0) {
      res.json({
        ok: true,
        recipients: 0,
        reason: result.reason ?? 'no_recipients',
        channelIds: result.channelIds,
        message: dispatchFailureMessage(result.reason, result.channelIds.length),
      });
      return;
    }
    res.json({ ok: true, ...result });
  } catch (error) {
    console.error('POST /api/newsletters/:id/send', error);
    res.status(500).json({ error: 'Failed to send newsletter' });
  }
}

export async function trackOpen(req: Request, res: Response) {
  const sendId = String(req.params.sendId);
  try {
    const send = await db.newsletterSend.findUnique({ where: { id: sendId } });
    if (send && !send.openedAt) {
      const geo = locateRequest(req);
      await db.newsletterSend.update({
        where: { id: sendId },
        data: {
          status: send.status === 'clicked' ? 'clicked' : 'opened',
          openedAt: new Date(),
          ipAddress: req.ip ? String(req.ip) : null,
          city: geo.city,
          country: geo.country,
          userAgent: req.headers['user-agent']?.toString() ?? null,
        },
      });
      await updateContentRates(send.contentId);
    }
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'no-store');
    res.send(TRANSPARENT_PNG);
  } catch (error) {
    console.error('GET /api/newsletters/track/open', error);
    res.set('Content-Type', 'image/png');
    res.send(TRANSPARENT_PNG);
  }
}

export async function trackClick(req: Request, res: Response) {
  const sendId = String(req.params.sendId);
  const target = typeof req.query.url === 'string' ? req.query.url : null;
  try {
    const send = await db.newsletterSend.findUnique({ where: { id: sendId } });
    if (send) {
      const wasOpened = send.openedAt ?? null;
      const geo = locateRequest(req);
      await db.newsletterSend.update({
        where: { id: sendId },
        data: {
          status: 'clicked',
          clickedAt: new Date(),
          openedAt: wasOpened ?? new Date(),
          ipAddress: send.ipAddress ?? (req.ip ? String(req.ip) : null),
          city: send.city ?? geo.city,
          country: send.country ?? geo.country,
          userAgent: send.userAgent ?? req.headers['user-agent']?.toString() ?? null,
        },
      });
      await updateContentRates(send.contentId);
    }
  } catch (error) {
    console.error('GET /api/newsletters/track/click', error);
  }

  if (!target || !/^https?:\/\//i.test(target)) {
    res.status(400).json({ error: 'Invalid target url' });
    return;
  }
  res.redirect(302, target);
}

export async function listSends(req: Request, res: Response) {
  const contentId = String(req.params.id);
  try {
    const content = await db.content.findUnique({ where: { id: contentId } });
    if (!content) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }
    if (req.user && !(await userCanAccessTenant(req.user, content.tenantId))) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const sends = await db.newsletterSend.findMany({
      where: { contentId },
      include: { subscriber: { select: { email: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });

    const result = sends.map((send) => ({
      id: send.id,
      status: send.status,
      email: send.subscriber.email,
      name: send.subscriber.name,
      city: send.city,
      country: send.country,
      openedAt: send.openedAt?.toISOString() ?? null,
      clickedAt: send.clickedAt?.toISOString() ?? null,
      createdAt: send.createdAt.toISOString(),
    }));

    res.json({
      contentId,
      total: result.length,
      opened: result.filter((s) => s.openedAt).length,
      clicked: result.filter((s) => s.clickedAt).length,
      sends: result,
    });
  } catch (error) {
    console.error('GET /api/newsletters/:id/sends', error);
    res.status(500).json({ error: 'Failed to fetch newsletter sends' });
  }
}
