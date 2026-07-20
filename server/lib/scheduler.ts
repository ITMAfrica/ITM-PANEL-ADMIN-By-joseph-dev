import { dispatchDueNewsletters } from '../services/newsletter.service';
import { dispatchDueSocial } from '../services/social.service';
import { syncAllInboxes } from '../services/social-inbox-sync.service';

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
  }
  // Publication sociale (Pages Facebook) — isolée du dispatch newsletter :
  // un échec de l'un ne doit pas empêcher l'autre.
  try {
    const social = await dispatchDueSocial();
    if (social.dispatched > 0) {
      console.log(`[scheduler] Published ${social.dispatched} social post(s) to Facebook`);
    }
    if (social.errors.length > 0) {
      console.warn(
        `[scheduler] Social dispatch errors: ${social.errors.map((e) => `${e.id} (${e.reason})`).join(', ')}`
      );
    }
  } catch (error) {
    console.error('[scheduler] social dispatch failed:', error);
  }
  // Synchro des commentaires (inbox) — isolée, throttlée par connexion.
  try {
    const inbox = await syncAllInboxes();
    if (inbox.newMessages > 0) {
      console.log(
        `[scheduler] Inbox sync: ${inbox.newMessages} new message(s) across ${inbox.newConversations} conversation(s)`
      );
    }
  } catch (error) {
    console.error('[scheduler] inbox sync failed:', error);
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
