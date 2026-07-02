import { createApp } from './app';

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';

if (!process.env.AUTH_SECRET) {
  console.error('FATAL: AUTH_SECRET environment variable is required');
  process.exit(1);
}

if (process.env.NODE_ENV === 'production' && !process.env.PUBLIC_API_KEY) {
  console.error('FATAL: PUBLIC_API_KEY environment variable is required in production');
  process.exit(1);
}

const app = createApp();

app.listen(PORT, HOST, () => {
  console.log(`Express API server running at http://${HOST}:${PORT}`);
});
