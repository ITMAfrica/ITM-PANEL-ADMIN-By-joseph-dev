import { dispatchDueNewsletters } from '../services/newsletter.service';

const DEFAULT_INTERVAL_MS = 15 * 60 * 1000;

let timer: NodeJS.Timeout | null = null;
let running = false;

export function getDispatchIntervalMs(): number {
  const raw = Number(process.env.DISPATCH_INTERVAL_MS);
  if (Number.isFinite(raw) && raw >= 10_000) return raw;
  return DEFAULT_INTERVAL_MS;
}

async function runOnce(): Promise<void> {
  if (running) return;
  running = true;
  try {
    const result = await dispatchDueNewsletters();
    if (result.dispatched > 0) {
      console.log(
        `[scheduler] Dispatched ${result.dispatched} newsletter(s) to ${result.recipients} recipient(s)`
      );
    }
  } catch (error) {
    console.error('[scheduler] newsletter dispatch failed:', error);
  } finally {
    running = false;
  }
}

export function startNewsletterScheduler(): void {
  if (timer) return;
  const interval = getDispatchIntervalMs();
  console.log(`[scheduler] Newsletter dispatch every ${interval}ms`);
  timer = setInterval(() => {
    void runOnce();
  }, interval);
}

export function stopNewsletterScheduler(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
