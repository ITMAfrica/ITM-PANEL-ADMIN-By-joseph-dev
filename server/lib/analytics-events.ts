/** Stable ContentEvent.eventType values (string column — no migration required). */
export const CONTENT_EVENT_TYPES = {
  view: 'view',
  click: 'click',
  acknowledge: 'acknowledge',
} as const;

export type ContentEventType = (typeof CONTENT_EVENT_TYPES)[keyof typeof CONTENT_EVENT_TYPES];
