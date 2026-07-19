import { Router } from 'express';
import { getApiOrigin, buildSubscribeWidget } from '../services/site.service';
import { db } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireTenantBody } from '../middleware/tenant';

const router = Router();

/**
 * GET /api/widgets/subscribe?token=xxx[&siteSlug=yyy]
 * GET /api/widgets/subscribe?channelId=xxx[&siteSlug=yyy]  (backward compat)
 *
 * Returns a self-contained JS script that renders an email subscription
 * form on any website. The site only needs to paste:
 *   <script src="https://api.../api/widgets/subscribe?token=..."></script>
 *
 * Using `token` (opaque widget token) is recommended to avoid exposing the
 * real channelId in public HTML source. `channelId` remains supported for
 * backward compatibility with existing embedded scripts.
 */
router.get('/subscribe', async (req, res) => {
  const rawToken = (req.query.token as string)?.trim();
  const rawChannelId = (req.query.channelId as string)?.trim();
  const siteSlug = (req.query.siteSlug as string)?.trim() || undefined;

  if (!rawToken && !rawChannelId) {
    res.status(400).type('application/javascript').send('// token or channelId is required');
    return;
  }

  let channelId: string;

  if (rawToken) {
    // Resolve opaque token → channelId
    try {
      const widgetToken = await db.widgetToken.findUnique({
        where: { token: rawToken },
        select: {
          channelId: true,
          expiresAt: true,
          channel: { select: { isActive: true } },
        },
      });
      if (!widgetToken) {
        res.status(404).type('application/javascript').send('// Token not found');
        return;
      }
      if (widgetToken.expiresAt && widgetToken.expiresAt < new Date()) {
        res.status(404).type('application/javascript').send('// Token expired');
        return;
      }
      if (!widgetToken.channel.isActive) {
        res.status(404).type('application/javascript').send('// Channel is inactive');
        return;
      }
      channelId = widgetToken.channelId;
    } catch {
      res.status(500).type('application/javascript').send('// Error');
      return;
    }
  } else {
    // Backward compatibility: plain channelId
    channelId = rawChannelId!;
    try {
      const channel = await db.distributionChannel.findUnique({
        where: { id: channelId },
        select: { id: true, isActive: true },
      });
      if (!channel) {
        res.status(404).type('application/javascript').send('// Channel not found');
        return;
      }
      if (!channel.isActive) {
        res.status(404).type('application/javascript').send('// Channel is inactive');
        return;
      }
    } catch {
      res.status(500).type('application/javascript').send('// Error');
      return;
    }
  }

  const panelOrigin = getApiOrigin();
  // Pass the widget token so the generated JS embeds the opaque token
  // rather than the real channelId.
  const script = buildSubscribeWidget(panelOrigin, channelId, siteSlug, rawToken || undefined);

  res
    .type('application/javascript; charset=utf-8')
    .set('Cache-Control', 'public, max-age=300')
    .set('Access-Control-Allow-Origin', '*')
    .send(script);
});

/**
 * POST /api/widgets/token
 * Body: { channelId: string }
 *
 * Creates (or retrieves existing) an opaque widget token for a distribution
 * channel. The token can be used in the <script> tag URL instead of the
 * raw channelId, preventing exposure of internal identifiers.
 *
 * Authentication: required (any authenticated user with access to the tenant)
 */
router.post('/token', requireAuth, requireTenantBody, async (req, res) => {
  try {
    const { channelId } = req.body || {};
    if (!channelId || typeof channelId !== 'string' || !channelId.trim()) {
      res.status(400).json({ error: 'channelId is required' });
      return;
    }

    const tenantId = req.authorizedTenantId!;

    // Verify the channel belongs to the tenant
    const channel = await db.distributionChannel.findUnique({
      where: { id: channelId },
      select: { id: true, tenantId: true, isActive: true },
    });
    if (!channel || channel.tenantId !== tenantId) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    // Reuse existing non-expired token for this channel
    const existing = await db.widgetToken.findFirst({
      where: {
        channelId,
        tenantId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      select: { token: true },
    });

    if (existing) {
      res.json({ token: existing.token, channelId });
      return;
    }

    // Create a new token
    const widgetToken = await db.widgetToken.create({
      data: { channelId, tenantId },
      select: { token: true },
    });

    res.status(201).json({ token: widgetToken.token, channelId });
  } catch (error) {
    console.error('POST /api/widgets/token', error);
    res.status(500).json({ error: 'Failed to create widget token' });
  }
});

/**
 * DELETE /api/widgets/token
 * Body: { channelId: string }
 *
 * Invalidates (deletes) the widget token for a channel so a new one can
 * be generated. Useful when a token may have been leaked.
 */
router.delete('/token', requireAuth, requireTenantBody, async (req, res) => {
  try {
    const { channelId } = req.body || {};
    if (!channelId || typeof channelId !== 'string' || !channelId.trim()) {
      res.status(400).json({ error: 'channelId is required' });
      return;
    }

    const tenantId = req.authorizedTenantId!;

    // Verify the channel belongs to the tenant
    const channel = await db.distributionChannel.findUnique({
      where: { id: channelId },
      select: { id: true, tenantId: true },
    });
    if (!channel || channel.tenantId !== tenantId) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    await db.widgetToken.deleteMany({
      where: { channelId, tenantId },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/widgets/token', error);
    res.status(500).json({ error: 'Failed to delete widget token' });
  }
});

export default router;
