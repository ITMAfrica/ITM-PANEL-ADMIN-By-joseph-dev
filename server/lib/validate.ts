import type { Request, Response } from 'express';
import { z, type ZodType } from 'zod';

export function validationErrorResponse(res: Response, error: z.ZodError): void {
  const details = error.issues.map((issue) => ({
    field: issue.path.join('.') || 'body',
    message: issue.message,
  }));

  res.status(400).json({
    error: details[0]?.message ?? 'Validation failed',
    details,
  });
}

export function parseBody<T>(schema: ZodType<T>, req: Request, res: Response): T | null {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    validationErrorResponse(res, result.error);
    return null;
  }
  return result.data;
}
