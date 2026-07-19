import type { Request, Response, NextFunction } from 'express';

/**
 * Security headers middleware (helmet-free replacement).
 * Sets standard hardening headers without adding a dependency.
 * Safe behind a reverse proxy (Caddy/Render) — does not override HSTS
 * which is better handled at the TLS terminator.
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '0'); // modern browsers; let CSP do the job
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
}
