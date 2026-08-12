import { useState, useEffect, useCallback, useRef } from 'react';
import { Settings } from '../types/settings';
import {
  requestNotificationPermission,
  registerServiceWorker,
  showNotification,
  showTestNotification,
  getTimeUntilNextNotification,
  getNextNotificationTime,
} from '../services/notificationScheduler';

export function useNotifications(settings: Settings) {
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const [nextNotificationTime, setNextNotificationTime] = useState<Date | null>(null);
  const timerRef = useRef<number | null>(null);

  // Request permission
  const requestPermission = useCallback(async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    return result;
  }, []);

  // Schedule next notification
  const scheduleNext = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!settings.enabled || permission !== 'granted') {
      setNextNotificationTime(null);
      return;
    }

    const timeUntil = getTimeUntilNextNotification(settings);
    const nextTime = getNextNotificationTime(settings);

    setNextNotificationTime(nextTime);

    if (timeUntil !== null && timeUntil >= 0) {
      // Cap at 2 hours to handle browser timer limits, then reschedule
      const maxDelay = 2 * 60 * 60 * 1000;
      const delay = Math.min(timeUntil, maxDelay);

      timerRef.current = window.setTimeout(() => {
        if (timeUntil <= maxDelay) {
          showNotification(settings);
        }
        scheduleNext();
      }, delay);
    }
  }, [settings, permission]);

  // Register service worker on mount
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // Update permission state when it changes externally
  useEffect(() => {
    if (!('Notification' in window)) return;

    const checkPermission = () => {
      setPermission(Notification.permission);
    };

    // Check periodically in case user changes permission in browser settings
    const interval = setInterval(checkPermission, 5000);
    return () => clearInterval(interval);
  }, []);

  // Schedule notifications when settings change
  useEffect(() => {
    scheduleNext();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [scheduleNext]);

  // Test notification
  const sendTestNotification = useCallback(async () => {
    if (permission !== 'granted') {
      const result = await requestPermission();
      if (result !== 'granted') return false;
    }
    return showTestNotification(settings);
  }, [permission, requestPermission, settings]);

  return {
    permission,
    requestPermission,
    nextNotificationTime,
    sendTestNotification,
  };
}
