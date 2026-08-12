export type IntervalMinutes = 30 | 45 | 60 | 90 | 120;

export interface Settings {
  enabled: boolean;
  intervalMinutes: IntervalMinutes;
  activeHoursStart: string; // "08:00"
  activeHoursEnd: string;   // "23:00"
  weekendHoursEnabled: boolean;
  weekendStart: string;
  weekendEnd: string;
  soundEnabled: boolean;
  pausedUntil: string | null; // ISO timestamp
}

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  intervalMinutes: 60,
  activeHoursStart: '08:00',
  activeHoursEnd: '23:00',
  weekendHoursEnabled: false,
  weekendStart: '10:00',
  weekendEnd: '23:00',
  soundEnabled: true,
  pausedUntil: null,
};

export const INTERVAL_OPTIONS: IntervalMinutes[] = [30, 45, 60, 90, 120];
