import geoip from 'geoip-lite';

export interface GeoInfo {
  city: string | null;
  country: string | null;
}

function extractIp(req: { ip?: string; headers: Record<string, string | string[] | undefined> }): string | null {
  const forwarded = req.headers['x-forwarded-for'];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]?.trim();
  const ip = raw || req.ip;
  if (!ip) return null;
  return ip === '::1' || ip === '127.0.0.1' ? '8.8.8.8' : ip;
}

export function locateRequest(req: {
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
}): GeoInfo {
  const ip = extractIp(req);
  if (!ip) return { city: null, country: null };
  const lookup = geoip.lookup(ip);
  if (!lookup) return { city: null, country: null };
  return {
    city: typeof lookup.city === 'string' ? lookup.city : null,
    country: typeof lookup.country === 'string' ? lookup.country : null,
  };
}
