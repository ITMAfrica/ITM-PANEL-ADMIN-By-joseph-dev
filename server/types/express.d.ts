import type { SessionUser } from '../lib/auth';

declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
      authorizedTenantId?: string;
    }
  }
}

export {};
