import type { Request, Response, NextFunction } from 'express';

/**
 * Lightweight in-memory rate limiter (express-rate-limit-free).
 *
 * Uses a fixed-window counter keyed by IP (or a custom key extractor).
 * Suitable for single-instance deployments. For multi-instance setups,
 * swap the store for Redis later — the middleware contract stays the same.
 *
 * Safe for the tracking endpoints: only counts failed/auth attempts are
 * strictly limited; the response is JSON so legitimate clients degrade
 * gracefully (429) instead of being silently dropped.
 */

interface RateBucket {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  /** Maximum number of requests allowed within the window. */
  limit: number;
  /** Window duration in milliseconds. */
  windowMs: number;
  /** Extract the key used to bucket requests (default: client IP). */
  keyExtractor?: (req: Request) => string;
  /** Optional message returned when the limit is exceeded. */
  message?: string;
}

function defaultKey(req: Request): string {
  // Honour X-Forwarded-For from a trusted reverse proxy.
  const forwarded = req.headers['x-forwarded-for'];
  const ip =
    (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded?.[0]) ||
    req.socket?.remoteAddress ||
    'unknown';
  return ip.trim();
}

/**
 * Creates a rate-limiting Express middleware.
 * Entries are periodically pruned to avoid unbounded memory growth.
 */
export function rateLimit(options: RateLimitOptions) {
  const { limit, windowMs, keyExtractor = defaultKey, message } = options;
  const buckets = new Map<string, RateBucket>();

  // Prune expired buckets every window to bound memory.
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, windowMs).unref();

  return function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
    const key = keyExtractor(req);
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    bucket.count += 1;
    if (bucket.count > limit) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      res.status(429).json({
        error: message ?? 'Too many requests, please try again later.',
      });
      return;
    }

    next();
  };
}
