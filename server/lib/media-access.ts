import fs from 'fs';
import path from 'path';
import { SignJWT, jwtVerify } from 'jose';
import { getTenantUploadDir } from './uploads-dir';

const UPLOAD_TOKEN_TTL = '7d';

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is not configured');
  return new TextEncoder().encode(secret);
}

export async function createUploadAccessToken(
  tenantId: string,
  filename: string
): Promise<string> {
  return new SignJWT({ tenantId, filename })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(UPLOAD_TOKEN_TTL)
    .sign(getSecret());
}

export async function verifyUploadAccessToken(
  token: string,
  tenantId: string,
  filename: string
): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.tenantId === tenantId && payload.filename === filename;
  } catch {
    return false;
  }
}

export async function signUploadUrl(url: string): Promise<string> {
  const match = url.match(/\/api\/uploads\/([^/]+)\/([^/?]+)/);
  if (!match) return url;

  const [, tenantId, filename] = match;
  const baseUrl = url.split('?')[0];
  const token = await createUploadAccessToken(tenantId, filename);
  return `${baseUrl}?token=${encodeURIComponent(token)}`;
}

export async function buildSignedUploadUrl(
  req: { protocol: string; get(name: string): string | undefined },
  tenantId: string,
  filename: string
): Promise<string> {
  const protocol = req.protocol;
  const host = req.get('host');
  const baseUrl = `${protocol}://${host}/api/uploads/${tenantId}/${filename}`;
  return signUploadUrl(baseUrl);
}

export function resolveUploadFilePath(tenantId: string, filename: string): string | null {
  const safeName = path.basename(filename);
  if (!safeName || safeName !== filename) return null;

  const tenantDir = path.resolve(getTenantUploadDir(tenantId));
  const filePath = path.resolve(tenantDir, safeName);

  if (!filePath.startsWith(`${tenantDir}${path.sep}`) && filePath !== tenantDir) {
    return null;
  }

  if (!fs.existsSync(filePath)) return null;
  return filePath;
}
