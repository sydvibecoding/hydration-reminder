import { useState, useEffect, useCallback } from 'react';
import { Settings, DEFAULT_SETTINGS } from '../types/settings';

const STORAGE_KEY = 'hydration-reminder-settings';

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettingsState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettingsState(DEFAULT_SETTINGS);
  }, []);

  const isPaused = useCallback(() => {
    if (!settings.pausedUntil) return false;
    return new Date(settings.pausedUntil) > new Date();
  }, [settings.pausedUntil]);

  const pauseFor = useCallback((minutes: number) => {
    const pausedUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    updateSettings({ pausedUntil });
  }, [updateSettings]);

  const pauseForRestOfDay = useCallback(() => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    updateSettings({ pausedUntil: endOfDay.toISOString() });
  }, [updateSettings]);

  const resumeNotifications = useCallback(() => {
    updateSettings({ pausedUntil: null });
  }, [updateSettings]);

  return {
    settings,
    updateSettings,
    resetSettings,
    isPaused,
    pauseFor,
    pauseForRestOfDay,
    resumeNotifications,
  };
}
