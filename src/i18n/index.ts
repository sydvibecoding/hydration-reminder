import { es } from './es';
import { en } from './en';
import type { LocaleId, Messages } from './types';

export type { LocaleId, Messages, NotificationMessage } from './types';

export const CATALOGUES: Record<LocaleId, Messages> = { es, en };

export const LOCALES: LocaleId[] = ['es', 'en'];

export const STORAGE_KEY = 'hydration-reminder-locale';

const DEFAULT_LOCALE: LocaleId = 'es';

function isLocaleId(value: string | null): value is LocaleId {
  return value === 'es' || value === 'en';
}

/** Browser preference, first match wins. Falls back to Spanish. */
export function detectLocale(): LocaleId {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;
  for (const tag of navigator.languages ?? [navigator.language]) {
    const base = tag.toLowerCase().split('-')[0];
    if (isLocaleId(base)) return base;
  }
  return DEFAULT_LOCALE;
}

/** Stored choice wins over browser detection; detection only seeds first run. */
export function readStoredLocale(): LocaleId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLocaleId(stored)) return stored;
  } catch {
    // Storage can be unavailable in privacy modes.
  }
  return detectLocale();
}

// Settings persist as "HH:MM" 24-hour strings. That stays the storage format —
// only the render boundary is localised, so switching language never rewrites
// stored data.
export function parseClock(value: string): { hour: number; minute: number } {
  const [h, m] = value.split(':');
  return { hour: Number(h) || 0, minute: Number(m) || 0 };
}

export function toClockString(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** True when the locale conventionally uses a 12-hour clock with AM/PM. */
export function usesTwelveHourClock(localeTag: string): boolean {
  return Boolean(
    new Intl.DateTimeFormat(localeTag, { hour: 'numeric' }).resolvedOptions().hour12
  );
}

function clockFormatter(localeTag: string): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(localeTag, { hour: 'numeric', minute: '2-digit' });
}

/** Formats a Date for display. es-ES gives "08:05", en-US gives "8:05 AM". */
export function formatTime(date: Date, localeTag: string): string {
  return clockFormatter(localeTag).format(date);
}

/** Formats a stored "HH:MM" string for display, without touching the stored value. */
export function formatClockString(value: string, localeTag: string): string {
  const { hour, minute } = parseClock(value);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return clockFormatter(localeTag).format(date);
}
