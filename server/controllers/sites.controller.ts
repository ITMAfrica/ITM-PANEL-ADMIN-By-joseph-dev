import type { Request, Response } from 'express';
import { db } from '../lib/prisma';
import {
  activateSite,
  buildConnectScript,
  connectSiteFromUrl,
  getApiOrigin,
  listSitesByTenant,
  verifySiteInstallation,
} from '../services/site.service';
import { userCanAccessTenant } from '../lib/tenant-access';

export async function list(req: Request, res: Response) {
  const tenantId = req.authorizedTenantId!;

  try {
    const sites = await listSitesByTenant(tenantId);
    res.json({ sites });
  } catch (error) {
    console.error('GET /api/sites', error);
    res.status(500).json({ error: 'Failed to list sites' });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const url = (req.body.url as string)?.trim();
    const tenantId = req.authorizedTenantId!;

    if (!url) {
      res.status(400).json({ error: 'url is required' });
      return;
    }

    const result = await connectSiteFromUrl(url, tenantId);
    res.status(201).json(result);
  } catch (error) {
    console.error('POST /api/sites', error);
    res.status(500).json({ error: 'Failed to connect site' });
  }
}

export async function verify(req: Request, res: Response) {
  const { slug } = req.params;

  try {
    const site = await db.site.findUnique({ where: { slug: slug as string } });
    if (!site || !req.user || !(await userCanAccessTenant(req.user, site.tenantId))) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const result = await verifySiteInstallation(slug as string);
    if (!result.ok) {
      res.status(422).json({ ok: false, reason: result.reason });
      return;
    }

    const origin = getApiOrigin();
    res.json({
      ok: true,
      site: {
        slug: result.site.slug,
        status: result.site.status,
        verifiedAt: result.site.verifiedAt?.toISOString() ?? null,
        embedScript: `<script src="${origin}/api/connect/${result.site.slug}" async></script>`,
      },
    });
  } catch (error) {
    console.error('POST /api/sites/[slug]/verify', error);
    res.status(500).json({ error: 'Failed to verify site' });
  }
}

export async function activate(req: Request, res: Response) {
  const { slug } = req.params;

  try {
    const apiKey = (req.headers['x-api-key'] as string) || '';
    const site = await activateSite(slug as string, apiKey);
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    res.json({
      ok: true,
      status: site.status,
      verifiedAt: site.verifiedAt?.toISOString() ?? null,
    });
  } catch (error) {
    console.error('POST /api/sites/[slug]/activate', error);
    res.status(500).json({ error: 'Failed to activate site' });
  }
}

export async function connectScript(req: Request, res: Response) {
  const { slug } = req.params;

  try {
    const site = await db.site.findUnique({ where: { slug: slug as string } });
    if (!site) {
      res.status(404).type('application/javascript').send('// Site not found');
      return;
    }

    const panelOrigin = getApiOrigin();
    const script = buildConnectScript(panelOrigin, site.slug, site.apiKey);

    res
      .type('application/javascript; charset=utf-8')
      .set('Cache-Control', 'public, max-age=300')
      .set('Access-Control-Allow-Origin', '*')
      .send(script);
  } catch (error) {
    console.error('GET /api/connect/[slug]', error);
    res.status(500).type('application/javascript').send('// Error');
  }
}
