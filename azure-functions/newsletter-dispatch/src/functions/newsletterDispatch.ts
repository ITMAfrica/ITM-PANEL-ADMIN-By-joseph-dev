import { app, InvocationContext } from '@azure/functions';

// Timer NCRONTAB (UTC). Default: every 15 minutes.
// "0 */15 * * * *" => second minute hour day month day-of-week
const SCHEDULE = process.env.DISPATCH_CRON ?? '0 */15 * * * *';

app.timer('newsletterDispatch', {
  schedule: SCHEDULE,
  handler: async (_myTimer, context: InvocationContext) => {
    const baseUrl = process.env.API_BASE_URL?.replace(/\/$/, '');
    const apiKey = process.env.PUBLIC_API_KEY;

    if (!baseUrl || !apiKey) {
      context.error('API_BASE_URL and PUBLIC_API_KEY must be configured in app settings.');
      return;
    }

    const url = `${baseUrl}/api/newsletters/dispatch`;
    context.log(`[newsletterDispatch] POST ${url}`);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
      });
      const body = await res.text();
      context.log(`[newsletterDispatch] responded ${res.status}: ${body}`);
    } catch (err) {
      context.error('[newsletterDispatch] request failed:', err);
    }
  },
});
