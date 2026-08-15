// Message catalogue contract.
//
// Parameterised entries are functions, not template strings with placeholders.
// That is deliberate: Spanish needs gender agreement ("Desactivados" for
// recordatorios vs "Bloqueadas" for notificaciones) and both languages pick
// plural forms differently. A flat key-value catalogue would force Spanish
// grammar onto every other locale. Each catalogue resolves its own rules.

export type LocaleId = 'es' | 'en';

export interface NotificationMessage {
  title: string;
  body: string;
}

// Everything crawlers read. Kept in the catalogue rather than in index.html so
// the copy has one source: scripts/generate-seo.mjs reads these at build time
// and emits one HTML entry point per language.
export interface Seo {
  htmlTitle: string;
  metaDescription: string;
  ogLocale: string;
  ogSiteName: string;
  ogTitle: string;
  ogDescription: string;
  ogImageAlt: string;
  /** Social card filename in /public. The artwork carries baked-in text. */
  ogImage: string;
  browserRequirements: string;
  manifestName: string;
  manifestShortName: string;
  manifestDescription: string;
}

export interface Messages {
  localeTag: string; // BCP 47 tag passed to Intl.*
  seo: Seo;

  languageName: string;
  languagePickerLabel: string;
  languagePickerDialog: string;

  appTitle: string;

  // Theme
  themeChange: (current: string) => string;
  themeCurrent: (current: string) => string;
  themeSelect: string;
  themeHeader: (current: string) => string;
  themeNames: Record<string, string>;

  // Dark mode toggle
  switchToLight: string;
  switchToDark: string;
  lightMode: string;
  darkMode: string;

  // Status summary
  quickActionsLabel: string;
  reminders: string;
  statusEyebrow: string;
  nextEyebrow: string;
  restEyebrow: string;
  notificationsEyebrow: string;

  remindersOff: string;      // agrees with "recordatorios"
  remindersOffSub: string;
  notificationsBlocked: string; // agrees with "notificaciones"
  notificationsBlockedSub: string;
  permissionMissing: string;
  permissionMissingSub: string;
  paused: string;
  pausedUntilTomorrow: string;
  pausedUntil: (clock: string) => string;
  resumeWhenever: string;
  tomorrowFrom: (clock: string) => string;
  laterFrom: (clock: string) => string;
  outsideActiveHours: string;
  nothingMoreToday: string;
  soon: string;
  anyTime: string;
  lastReminderOfDay: (relative: string) => string;
  moreToday: (relative: string, count: number) => string;

  // Relative time
  inMinutes: (minutes: number) => string;
  inHours: (hours: number) => string;
  inHoursMinutes: (hours: number, minutes: number) => string;

  // Toggle states
  statusOff: string;
  statusNeedsPermission: string;
  statusPaused: string;
  statusActive: string;

  // Pause
  resumeReminders: string;
  pauseTemporarily: string;
  pauseMinutes: (minutes: number) => string;
  pauseMinutesLabel: (minutes: number) => string;
  pauseHours: (hours: number) => string;
  pauseHoursLabel: (hours: number) => string;
  untilTomorrow: string;
  untilTomorrowLabel: string;

  // Permission
  enableNotifications: string;
  blockedAlert: string;

  // Settings
  settingsLabel: string;
  frequency: string;
  frequencyLabel: string;
  schedule: string;
  from: string;
  to: string;
  startTimeLabel: string;
  endTimeLabel: string;
  weekendSchedule: string;
  weekend: string;
  weekendStartLabel: string;
  weekendEndLabel: string;
  scheduleFooter: string;
  alerts: string;
  sound: string;
  testNotification: string;
  sent: string;           // agrees with "notificación"
  sendFailed: string;
  sending: string;
  test: string;

  // Interval labels
  intervalMinutes: (minutes: number) => string;
  intervalHours: (hours: number) => string;
  intervalHoursMinutes: (hours: number, minutes: number) => string;

  // Time picker (M3 input variant)
  timePickerHeadline: string;
  hour: string;
  minute: string;
  hourAbbr: string;
  minuteAbbr: string;
  am: string;
  pm: string;
  cancel: string;
  ok: string;

  githubLink: string;
  githubLinkLabel: string;

  // About
  aboutEyebrow: string;
  aboutTitle: string;
  aboutBody: string;
  faq: Array<{ q: string; a: string }>;
  footer: string;

  // Notifications
  notificationMessages: NotificationMessage[];
}
