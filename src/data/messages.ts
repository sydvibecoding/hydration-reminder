import { CATALOGUES, readStoredLocale } from '../i18n';
import type { NotificationMessage } from '../i18n';

export type { NotificationMessage };

/**
 * Notification copy now lives in the message catalogues, one set per language.
 *
 * These fire from a timer rather than from React, so the locale is read from
 * storage at call time instead of being passed down. That also means a language
 * change takes effect on the next reminder without restarting the scheduler.
 */
export function getMessages(): NotificationMessage[] {
  return CATALOGUES[readStoredLocale()].notificationMessages;
}

export function getRandomMessage(): NotificationMessage {
  const messages = getMessages();
  return messages[Math.floor(Math.random() * messages.length)];
}
