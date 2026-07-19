import type { NextFunction, Request, Response } from 'express';

/**
 * Known Prisma error codes we want to map to meaningful HTTP statuses.
 * See https://www.prisma.io/docs/orm/reference/error-reference#prismaclientknownrequesterror
 */
const PRISMA_STATUS_MAP: Record<string, number> = {
  P2002: 409, // Unique constraint failed
  P2025: 404, // Record not found
  P2003: 409, // Foreign key constraint failed
};

function statusForError(err: unknown): number {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code: string }).code;
    if (PRISMA_STATUS_MAP[code]) return PRISMA_STATUS_MAP[code];
  }
  return 500;
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const status = statusForError(err);

  if (status === 500) {
    console.error('Unhandled error:', err);
  } else {
    // Expected/known errors: log at debug level to avoid noise.
    console.warn('Handled error:', (err as { message?: string })?.message ?? err);
  }

  res.status(status).json({
    error: status === 500 ? 'Internal server error' : 'Request failed',
  });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not found' });
}
