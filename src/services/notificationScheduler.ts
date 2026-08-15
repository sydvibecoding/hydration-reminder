import { Settings } from '../types/settings';
import { getRandomMessage } from '../data/messages';

const NOTIFICATION_TAG = 'hydration-reminder';

// `renotify` is supported by Chrome's ServiceWorkerRegistration.showNotification
// but is missing from lib.dom's NotificationOptions.
type NotifyOptions = NotificationOptions & { renotify?: boolean };

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

// Active hours depend on WHICH day we're asking about, not on today. Scheduling
// "tomorrow's first reminder" on a Friday night must use the weekend window, and
// on a Sunday night must use the weekday one.
function getActiveHoursFor(settings: Settings, date: Date): { start: string; end: string } {
  if (settings.weekendHoursEnabled && isWeekend(date)) {
    return { start: settings.weekendStart, end: settings.weekendEnd };
  }
  return { start: settings.activeHoursStart, end: settings.activeHoursEnd };
}

interface ActiveWindow {
  start: Date;
  end: Date;
}

// The window that `day` opens, as absolute timestamps. An end at or before the
// start means the window runs past midnight and closes on the next day. "00:00"
// is the common case: midnight closes the day that opened it. Comparing raw
// minutes-since-midnight instead would read 00:00 as "already over", which
// silently kills every reminder.
function windowForDay(settings: Settings, day: Date): ActiveWindow {
  const { start, end } = getActiveHoursFor(settings, day);
  const startParts = parseTime(start);
  const endParts = parseTime(end);

  const startDate = new Date(day);
  startDate.setHours(startParts.hours, startParts.minutes, 0, 0);

  const endDate = new Date(day);
  endDate.setHours(endParts.hours, endParts.minutes, 0, 0);
  if (endDate.getTime() <= startDate.getTime()) {
    endDate.setDate(endDate.getDate() + 1);
  }

  return { start: startDate, end: endDate };
}

// The window containing `at`, or null if `at` falls between windows. Checks
// yesterday's window too, because an overnight one may still be open.
function windowAt(settings: Settings, at: Date): ActiveWindow | null {
  const yesterday = new Date(at);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const day of [yesterday, at]) {
    const w = windowForDay(settings, day);
    if (at.getTime() >= w.start.getTime() && at.getTime() < w.end.getTime()) {
      return w;
    }
  }
  return null;
}

// The first window that opens strictly after `at`. Each day carries its own
// schedule, so a Friday night lookup lands on the weekend window.
function windowAfter(settings: Settings, at: Date): ActiveWindow {
  const day = new Date(at);
  for (let i = 0; i < 8; i++) {
    const w = windowForDay(settings, day);
    if (w.start.getTime() > at.getTime()) return w;
    day.setDate(day.getDate() + 1);
  }
  return windowForDay(settings, day);
}

export function isWithinActiveHours(settings: Settings): boolean {
  return windowAt(settings, new Date()) !== null;
}

export function getNextNotificationTime(settings: Settings): Date | null {
  if (!settings.enabled) return null;

  const now = new Date();

  // Check if paused
  if (settings.pausedUntil && new Date(settings.pausedUntil) > now) {
    return new Date(settings.pausedUntil);
  }

  const current = windowAt(settings, now);

  // Between windows - wait for the next one to open
  if (!current) return windowAfter(settings, now).start;

  // Inside a window - one interval from now, unless that overshoots the close
  const next = new Date(now.getTime() + settings.intervalMinutes * 60 * 1000);
  if (next.getTime() >= current.end.getTime()) {
    return windowAfter(settings, now).start;
  }

  return next;
}

export function getTimeUntilNextNotification(settings: Settings): number | null {
  const nextTime = getNextNotificationTime(settings);
  if (!nextTime) return null;
  return Math.max(0, nextTime.getTime() - Date.now());
}

// Count reminders still scheduled for today, and when the last one fires.
// Returns { count: 0, last: null } when the next reminder falls on a later
// calendar day, or when reminders are disabled or paused. Counting runs to the
// end of the window the next reminder belongs to, which may be past midnight.
export function getRemainingNotificationsToday(settings: Settings): {
  count: number;
  last: Date | null;
} {
  if (!settings.enabled) return { count: 0, last: null };

  const now = new Date();
  if (settings.pausedUntil && new Date(settings.pausedUntil) > now) {
    return { count: 0, last: null };
  }

  const next = getNextNotificationTime(settings);
  if (!next) return { count: 0, last: null };

  // `next` always lands inside a window - either the open one or the start of
  // the one after it.
  const window = windowAt(settings, next);
  if (!window) return { count: 0, last: null };

  const isSameDay =
    next.getFullYear() === now.getFullYear() &&
    next.getMonth() === now.getMonth() &&
    next.getDate() === now.getDate();

  // Reminders in the window we're already sitting in still count as "today",
  // even once the clock rolls past midnight on an overnight schedule.
  const current = windowAt(settings, now);
  const isSameWindow = current !== null && current.start.getTime() === window.start.getTime();

  if (!isSameDay && !isSameWindow) return { count: 0, last: null };

  const intervalMs = settings.intervalMinutes * 60 * 1000;
  const remainingMs = window.end.getTime() - next.getTime();
  const count = Math.ceil(remainingMs / intervalMs);
  const last = new Date(next.getTime() + (count - 1) * intervalMs);

  return { count, last };
}

// Gentle Web Audio chime — plays independent of OS notification sounds.
// Two soft descending notes, ~250ms total.
function playChime(): void {
  try {
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const playNote = (freq: number, startAt: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startAt);
      gain.gain.setValueAtTime(0, startAt);
      gain.gain.linearRampToValueAtTime(0.15, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startAt);
      osc.stop(startAt + duration);
    };

    // Two-note chime: E5 then C5 (calm, descending)
    playNote(659.25, now, 0.18);
    playNote(523.25, now + 0.12, 0.22);

    // Clean up context after sound plays
    setTimeout(() => ctx.close().catch(() => {}), 500);
  } catch (error) {
    console.warn('[hydration] Chime playback failed:', error);
  }
}

export async function showNotification(settings: Settings): Promise<void> {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  if (!settings.enabled) return;
  if (!isWithinActiveHours(settings)) return;

  // Check if paused
  if (settings.pausedUntil && new Date(settings.pausedUntil) > new Date()) {
    return;
  }

  const message = getRandomMessage();

  const options: NotifyOptions = {
    body: message.body,
    icon: `${import.meta.env.BASE_URL}favicon.svg`,
    // Reuse the tag so reminders replace each other instead of stacking in the
    // tray, but renotify so the replacement still pops a banner + sound.
    // Without renotify, a same-tag replacement lands silently in the Action
    // Center and the user never sees it.
    tag: NOTIFICATION_TAG,
    renotify: true,
    requireInteraction: false,
    silent: !settings.soundEnabled,
  };

  try {
    // Try using service worker notification for better background support
    const registration = await navigator.serviceWorker?.ready;
    if (registration) {
      await registration.showNotification(message.title, options);
    } else {
      new Notification(message.title, options);
    }

    // Custom chime — only works when the page is foreground.
    // For backgrounded tabs, the OS notification sound (if unmuted) is our only option.
    if (settings.soundEnabled && document.visibilityState === 'visible') {
      playChime();
    }

  } catch (error) {
    console.error('Failed to show notification:', error);
  }
}

// Same as showNotification but bypasses schedule/pause/enabled gates and uses a
// unique tag so the OS shows it even if a real notification is already active.
export async function showTestNotification(settings: Settings): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('[hydration] Notifications API not available in this browser');
    return false;
  }
  if (Notification.permission !== 'granted') {
    console.warn('[hydration] Permission not granted, cannot fire test');
    return false;
  }

  const message = getRandomMessage();

  const options: NotificationOptions = {
    body: message.body,
    icon: `${import.meta.env.BASE_URL}favicon.svg`,
    tag: `hydration-test-${Date.now()}`,
    requireInteraction: false,
    silent: !settings.soundEnabled,
  };

  try {
    const registration = await navigator.serviceWorker?.ready;
    if (registration) {
      await registration.showNotification(message.title, options);
    } else {
      new Notification(message.title, options);
    }
    // Play chime for test — user clicked the button so we have a gesture.
    if (settings.soundEnabled) {
      playChime();
    }
    console.log('[hydration] Test notification fired:', message.title);
    return true;
  } catch (error) {
    console.error('[hydration] Test notification failed:', error);
    return false;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    return await Notification.requestPermission();
  }

  return Notification.permission;
}

export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
      .then((registration) => {
        console.log('Service Worker registered:', registration.scope);
        return registration;
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
        return null;
      });
  }
  return Promise.resolve(null);
}
