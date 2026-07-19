import cors from 'cors';

const allowedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.APP_URL,
  'http://localhost:3002',
  'http://127.0.0.1:3002',
].filter(Boolean) as string[];

const PRIVATE_HOST =
  /^(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})$/;

function isDevFrontendOrigin(origin: string): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  try {
    const { protocol, hostname } = new URL(origin);
    if (protocol !== 'http:' && protocol !== 'https:') return false;
    // Allow any port on private hosts so embedded widgets can be tested
    // on local sites (e.g. http://localhost:8080) against the API (:3001).
    return PRIVATE_HOST.test(hostname);
  } catch {
    return false;
  }
}

function isAllowedOrigin(origin: string): boolean {
  return allowedOrigins.includes(origin) || isDevFrontendOrigin(origin);
}

export const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Api-Key', 'Authorization'],
});

export const publicCorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
};
