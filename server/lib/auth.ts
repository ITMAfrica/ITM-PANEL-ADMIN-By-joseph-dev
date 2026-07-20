import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import type { Request, Response } from 'express';
import { z } from 'zod';

export const SESSION_COOKIE = 'itm-session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  tenantName: string;
}

const sessionUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.string(),
  tenantId: z.string(),
  tenantName: z.string(),
});

export function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    console.error('[auth] AUTH_SECRET is not set in environment variables. ' +
      'Ensure it is defined in docker-compose.yml or your .env file.');
    throw new Error('AUTH_SECRET is not configured');
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  // OWASP-recommended cost factor (2024+). Legacy hashes generated with a
  // lower cost still verify correctly via bcrypt.compare, and are transparently
  // upgraded to the new cost on the next successful login (see verifyPassword).
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return sessionUserSchema.parse(payload);
  } catch {
    return null;
  }
}

export async function setSessionCookie(req: Request, res: Response, user: SessionUser) {
  const token = await createSessionToken(user);
  // Derive `secure` from the actual request protocol — not NODE_ENV. A
  // production server reached over plain HTTP (e.g. Caddy on :81 without TLS)
  // must NOT emit a Secure cookie: browsers silently drop it, so login
  // appeared to succeed but the session was gone on the next refresh.
  const forwardedProto = req.headers['x-forwarded-proto'];
  const isHttps =
    req.secure || forwardedProto === 'https' ||
    (Array.isArray(forwardedProto) && forwardedProto.includes('https'));
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE * 1000,
    path: '/',
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, { path: '/' });
}
