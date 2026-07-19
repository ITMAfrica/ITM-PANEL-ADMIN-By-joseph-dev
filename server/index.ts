import { createApp } from './app';
import { isAzureConfigured } from './lib/storage';
import { startNewsletterScheduler } from './lib/scheduler';

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';

if (!process.env.AUTH_SECRET) {
  console.error('FATAL: AUTH_SECRET environment variable is required');
  process.exit(1);
}

const WEAK_DEFAULTS = new Set([
  'change-me-in-production',
  'changeme',
  'secret',
  '',
]);

if (
  process.env.NODE_ENV === 'production' &&
  (WEAK_DEFAULTS.has(process.env.AUTH_SECRET ?? '') ||
   WEAK_DEFAULTS.has(process.env.PUBLIC_API_KEY ?? ''))
) {
  console.error(
    'FATAL: AUTH_SECRET / PUBLIC_API_KEY are still set to a weak default value. ' +
      'Define strong, unique secrets before running in production.'
  );
  process.exit(1);
}

if (process.env.NODE_ENV === 'production' && !process.env.PUBLIC_API_KEY) {
  console.error('FATAL: PUBLIC_API_KEY environment variable is required in production');
  process.exit(1);
}

if (!isAzureConfigured()) {
  console.error(
    'FATAL: Azure Storage non configuré. Définir AZURE_STORAGE_CONNECTION_STRING ' +
      'ou AZURE_STORAGE_ACCOUNT + AZURE_STORAGE_ACCESS_KEY (voir .env.example).'
  );
  process.exit(1);
}

const app = createApp();

app.listen(PORT, HOST, () => {
  console.log(`Express API server running at http://${HOST}:${PORT}`);
  startNewsletterScheduler();
});
