import type { NextFunction, Request, Response } from "express";
import { getSiteByApiKey } from "../services/site.service";

export async function validateApiKey(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const headerKey = req.headers["x-api-key"];
  if (typeof headerKey !== "string") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Global public API key (server-to-server tracking).
  const globalKey = process.env.PUBLIC_API_KEY;
  if (globalKey && headerKey === globalKey) {
    next();
    return;
  }

  // Per-site key: the site resolved from the key must match the siteId/site
  // claimed in the request body, preventing one site from tracking for another.
  const site = await getSiteByApiKey(headerKey);
  if (site) {
    const claimedSite = (req.body?.siteId || req.body?.site) as
      string | undefined;
    if (!claimedSite || claimedSite === site.slug) {
      next();
      return;
    }
    res.status(403).json({ error: "Forbidden: site mismatch" });
    return;
  }

  res.status(401).json({ error: "Unauthorized" });
}
