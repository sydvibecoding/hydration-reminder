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

function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

function getActiveHours(settings: Settings): { start: string; end: string } {
  if (settings.weekendHoursEnabled && isWeekend()) {
    return { start: settings.weekendStart, end: settings.weekendEnd };
  }
  return { start: settings.activeHoursStart, end: settings.activeHoursEnd };
}

export function isWithinActiveHours(settings: Settings): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const { start, end } = getActiveHours(settings);
  const startTime = parseTime(start);
  const endTime = parseTime(end);

  const startMinutes = startTime.hours * 60 + startTime.minutes;
  const endMinutes = endTime.hours * 60 + endTime.minutes;

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

export function getNextNotificationTime(settings: Settings): Date | null {
  if (!settings.enabled) return null;

  // Check if paused
  if (settings.pausedUntil && new Date(settings.pausedUntil) > new Date()) {
    return new Date(settings.pausedUntil);
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const { start, end } = getActiveHours(settings);
  const startTime = parseTime(start);
  const endTime = parseTime(end);

  const startMinutes = startTime.hours * 60 + startTime.minutes;
  const endMinutes = endTime.hours * 60 + endTime.minutes;

  if (currentMinutes < startMinutes) {
    // Before active hours - schedule for start time
    const next = new Date(now);
    next.setHours(startTime.hours, startTime.minutes, 0, 0);
    return next;
  } else if (currentMinutes >= endMinutes) {
    // After active hours - schedule for tomorrow's start
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    next.setHours(startTime.hours, startTime.minutes, 0, 0);
    return next;
  } else {
    // Within active hours - schedule for interval from now
    const next = new Date(now.getTime() + settings.intervalMinutes * 60 * 1000);

    // But don't go past end time
    const nextMinutes = next.getHours() * 60 + next.getMinutes();
    if (nextMinutes >= endMinutes) {
      // Schedule for tomorrow's start instead
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(startTime.hours, startTime.minutes, 0, 0);
      return tomorrow;
    }

    return next;
  }
}

export function getTimeUntilNextNotification(settings: Settings): number | null {
  const nextTime = getNextNotificationTime(settings);
  if (!nextTime) return null;
  return Math.max(0, nextTime.getTime() - Date.now());
}

// Count reminders still scheduled for today, and when the last one fires.
// Returns { count: 0, last: null } if we're past active hours (next is tomorrow),
// disabled, or paused.
export function getRemainingNotificationsToday(settings: Settings): {
  count: number;
  last: Date | null;
} {
  if (!settings.enabled) return { count: 0, last: null };
  if (settings.pausedUntil && new Date(settings.pausedUntil) > new Date()) {
    return { count: 0, last: null };
  }

  const next = getNextNotificationTime(settings);
  if (!next) return { count: 0, last: null };

  const now = new Date();
  const isSameDay =
    next.getFullYear() === now.getFullYear() &&
    next.getMonth() === now.getMonth() &&
    next.getDate() === now.getDate();
  if (!isSameDay) return { count: 0, last: null };

  const { end } = getActiveHours(settings);
  const [endH, endM] = end.split(':').map(Number);
  const endTime = new Date(now);
  endTime.setHours(endH, endM, 0, 0);

  const remainingMs = endTime.getTime() - next.getTime();
  if (remainingMs <= 0) return { count: 1, last: next };

  const intervalMs = settings.intervalMinutes * 60 * 1000;
  const count = Math.floor((remainingMs - 1) / intervalMs) + 1;
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
