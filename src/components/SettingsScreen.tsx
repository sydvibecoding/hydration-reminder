import { CSSProperties, useMemo, useState } from 'react';
import { Settings } from '../types/settings';
import { ToggleSwitch } from './ToggleSwitch';
import { IntervalSelector } from './IntervalSelector';
import { TimePicker } from './TimePicker';
import { ThemePicker } from './ThemePicker';
import { LanguagePicker } from './LanguagePicker';
import { ThemeState } from '../hooks/useTheme';
import { DarkModeState } from '../hooks/useDarkMode';
import { LocaleState } from '../hooks/useLocale';
import { formatClockString, formatTime } from '../i18n';
import { getNextNotificationTime, getRemainingNotificationsToday } from '../services/notificationScheduler';

interface SettingsScreenProps {
  settings: Settings;
  onUpdateSettings: (updates: Partial<Settings>) => void;
  permission: NotificationPermission;
  onRequestPermission: () => void;
  nextNotificationTime: Date | null;
  onSendTestNotification: () => Promise<boolean>;
  isPaused: boolean;
  onPauseFor: (minutes: number) => void;
  onPauseForRestOfDay: () => void;
  onResume: () => void;
  themeState: ThemeState;
  darkMode: DarkModeState;
  localeState: LocaleState;
}

// Icons stay in code rather than in the catalogues: they are presentational and
// identical across languages. Indexed to match the FAQ entry order.
const FAQ_ICONS = ['tune', 'person_off', 'lock'];

const styles: Record<string, CSSProperties> = {
  // Header
  headerInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoMark: {
    width: '40px',
    height: '40px',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    color: 'var(--md-sys-color-primary)',
    backgroundColor: 'var(--md-sys-color-primary-container)',
    borderRadius: 'var(--md-sys-shape-corner-full)',
  },
  logoIcon: {
    width: '24px',
    height: '24px',
    fontSize: '24px',
    fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24",
  },
  title: {
    fontFamily: 'var(--font-family)',
    fontSize: 'var(--font-size-large-title)',
    fontWeight: 'var(--font-weight-regular)',
    color: 'var(--color-text-primary)',
    letterSpacing: '-0.4px',
    lineHeight: 1.15,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  // Sections (right column)
  section: {
    marginTop: 'var(--spacing-xl)',
  },
  sectionFirst: {
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 'var(--font-size-body)',
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--md-sys-color-on-surface)',
    letterSpacing: '-0.1px',
    marginBottom: '10px',
    paddingLeft: 'var(--spacing-md)',
    marginLeft: 'var(--card-inline-margin)',
  },
  sectionFooter: {
    fontSize: 'var(--font-size-footnote)',
    fontWeight: 'var(--font-weight-regular)',
    color: 'var(--md-sys-color-on-surface-variant)',
    marginTop: '8px',
    padding: '6px var(--spacing-lg)',
    marginLeft: 'var(--card-inline-margin)',
    marginRight: 'var(--card-inline-margin)',
    lineHeight: 1.38,
    letterSpacing: '-0.08px',
  },

  // Cards (right column) — no overflow:hidden so TimePicker popover can escape
  card: {
    backgroundColor: 'var(--md-sys-color-surface-container-high)',
    borderRadius: 'var(--md-sys-shape-corner-extra-large)',
    marginLeft: 'var(--card-inline-margin)',
    marginRight: 'var(--card-inline-margin)',
    overflow: 'hidden',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 'var(--row-height)',
    paddingLeft: 'var(--spacing-md)',
    paddingRight: 'var(--spacing-md)',
    borderBottom: '1px solid var(--color-separator)',
  },
  rowLast: {
    borderBottom: 'none',
  },
  rowLabel: {
    fontSize: 'var(--font-size-body)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-text-primary)',
    letterSpacing: '-0.4px',
  },
  rowLeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: 0,
  },
  rowIcon: {
    color: 'var(--md-sys-color-on-surface-variant)',
    fontSize: '20px',
    width: '20px',
    height: '20px',
    flexShrink: 0,
  },
  // Sub-group header inside a card (visually groups nested rows)
  subGroupHeader: {
    fontSize: 'var(--font-size-caption1)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--md-sys-color-on-surface-variant)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.35px',
    padding: '14px var(--spacing-md) 6px',
    borderTop: '1px solid var(--color-separator)',
    marginTop: '4px',
  },
  rowIndented: {
    paddingLeft: 'var(--spacing-xxl)',
  },
  intervalContainer: {
    padding: 'var(--spacing-md)',
  },

  // Summary card (left column)
  summaryCard: {
    backgroundColor: 'var(--md-sys-color-primary-container)',
    borderRadius: 'var(--md-sys-shape-corner-extra-large)',
    padding: '24px',
    marginLeft: 'var(--card-inline-margin)',
    marginRight: 'var(--card-inline-margin)',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '20px',
  },
  statusLabel: {
    fontSize: 'var(--font-size-body)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--md-sys-color-on-primary-container)',
  },
  statusHint: {
    display: 'block',
    marginTop: '2px',
    fontSize: 'var(--font-size-footnote)',
    color: 'var(--md-sys-color-on-primary-container)',
  },
  summaryEyebrow: {
    fontSize: 'var(--font-size-footnote)',
    fontWeight: 'var(--font-weight-regular)',
    color: 'var(--md-sys-color-on-primary-container)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.35px',
  },
  summaryHero: {
    fontFamily: 'var(--font-family-display)',
    fontSize: 'var(--font-size-title1)',
    fontWeight: 'var(--font-weight-regular)',
    color: 'var(--md-sys-color-on-primary-container)',
    letterSpacing: '-1.2px',
    lineHeight: 1.1,
    marginTop: '6px',
  },
  summarySub: {
    fontSize: 'var(--font-size-subhead)',
    fontWeight: 'var(--font-weight-regular)',
    color: 'var(--md-sys-color-on-primary-container)',
    marginTop: '16px',
    letterSpacing: '-0.24px',
  },
  summaryDivider: {
    height: '1px',
    backgroundColor: 'var(--md-sys-color-on-primary-container)',
    margin: '20px 0 14px',
  },
  quickLabel: {
    fontSize: 'var(--font-size-caption1)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--md-sys-color-on-primary-container)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.35px',
    marginBottom: '10px',
  },

  // Primary CTA
  primaryCta: {
    width: '100%',
    minHeight: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 20px',
    fontSize: 'var(--font-size-body)',
    fontWeight: 'var(--font-weight-semibold)',
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-accent)',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    letterSpacing: '-0.4px',
  },
  ctaWrapper: {
    marginLeft: 'var(--card-inline-margin)',
    marginRight: 'var(--card-inline-margin)',
  },
  notice: {
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-surface-border)',
    marginLeft: 'var(--card-inline-margin)',
    marginRight: 'var(--card-inline-margin)',
    padding: '14px var(--spacing-md)',
    fontSize: 'var(--font-size-subhead)',
    color: 'var(--color-text-secondary)',
    letterSpacing: '-0.24px',
    lineHeight: 1.4,
  },

  // Pause chips
  pauseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
    padding: 0,
  },
  // Pen treatment: translucent on-primary pills over the primary-container
  // summary card, with on-primary-container labels and no outline.
  pauseButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    width: '100%',
    minHeight: '40px',
    padding: '0 12px',
    fontSize: 'var(--font-size-subhead)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--md-sys-color-on-primary-container)',
    backgroundColor: 'var(--pause-button-bg, color-mix(in srgb, var(--md-sys-color-on-primary) 50%, transparent))',
    border: 'none',
    borderRadius: 'var(--radius-full)',
    letterSpacing: '-0.08px',
    cursor: 'pointer',
  },
  secondaryAction: {
    minHeight: '44px',
    padding: '0 14px',
    color: 'var(--color-accent)',
    backgroundColor: 'var(--color-accent-subtle)',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--font-size-subhead)',
    fontWeight: 'var(--font-weight-semibold)',
  },
  rowAction: {
    minHeight: '40px',
    padding: '0 12px',
    margin: '4px 0',
    color: 'var(--md-sys-color-on-primary-container)',
    backgroundColor: 'var(--color-accent-subtle)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--font-size-subhead)',
    fontWeight: 'var(--font-weight-medium)',
  },
  testActionCluster: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  testStatus: {
    fontSize: 'var(--font-size-footnote)',
    color: 'var(--md-sys-color-on-surface-variant)',
    letterSpacing: '-0.08px',
    minWidth: 0,
  },
};

const DropletMark = () => (
  <span aria-hidden="true" style={styles.logoMark}>
    <md-icon style={styles.logoIcon}>water_drop</md-icon>
  </span>
);

export function SettingsScreen({
  settings,
  onUpdateSettings,
  permission,
  onRequestPermission,
  nextNotificationTime,
  onSendTestNotification,
  isPaused,
  onPauseFor,
  onPauseForRestOfDay,
  onResume,
  themeState,
  darkMode,
  localeState,
}: SettingsScreenProps) {
  const [testState, setTestState] = useState<'idle' | 'sending'>('idle');
  const { t } = localeState;

  const formatNextTime = (date: Date | null) => {
    if (!date) return null;
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 1) return t.anyTime;
    if (diffMins < 60) return t.inMinutes(diffMins);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    if (minutes === 0) return t.inHours(hours);
    if (hours === 0) return t.inMinutes(minutes);
    return t.inHoursMinutes(hours, minutes);
  };

  // Clock rendering goes through Intl so en-US gets "8:05 AM" and es-ES "08:05".
  const formatClock = (d: Date) => formatTime(d, t.localeTag);

  const summary = useMemo(() => {
    if (!settings.enabled) {
      return { eyebrow: t.statusEyebrow, hero: t.remindersOff, sub: t.remindersOffSub };
    }
    if (permission === 'denied') {
      return {
        eyebrow: t.notificationsEyebrow,
        hero: t.notificationsBlocked,
        sub: t.notificationsBlockedSub,
      };
    }
    if (permission === 'default') {
      return {
        eyebrow: t.notificationsEyebrow,
        hero: t.permissionMissing,
        sub: t.permissionMissingSub,
      };
    }
    if (isPaused) {
      const pausedUntil = settings.pausedUntil ? new Date(settings.pausedUntil) : null;
      const pausedForToday = pausedUntil?.getHours() === 23 && pausedUntil.getMinutes() === 59;
      return {
        eyebrow: t.statusEyebrow,
        hero: t.paused,
        sub: pausedForToday
          ? t.pausedUntilTomorrow
          : pausedUntil
            ? t.pausedUntil(formatClock(pausedUntil))
            : t.resumeWhenever,
      };
    }

    const remaining = getRemainingNotificationsToday(settings);

    if (remaining.count === 0) {
      // Read the clock off the scheduled time, not off activeHoursStart — tomorrow
      // may run on the weekend schedule.
      const resumesAt = nextNotificationTime ?? getNextNotificationTime(settings);
      return {
        eyebrow: t.restEyebrow,
        hero: t.tomorrowFrom(
          resumesAt
            ? formatClock(resumesAt)
            : formatClockString(settings.activeHoursStart, t.localeTag)
        ),
        sub: t.nothingMoreToday,
      };
    }

    const relativeTime = formatNextTime(nextNotificationTime) ?? t.soon;
    const sub =
      remaining.count === 1
        ? t.lastReminderOfDay(relativeTime)
        : t.moreToday(relativeTime, remaining.count - 1);

    return {
      eyebrow: t.nextEyebrow,
      hero: nextNotificationTime ? formatClock(nextNotificationTime) : t.soon,
      sub,
    };
  }, [settings, permission, isPaused, nextNotificationTime, t]);

  const handleStart = () => {
    onUpdateSettings({ enabled: true });
    if (permission === 'default') {
      onRequestPermission();
    }
  };

  const handleEnabledChange = (enabled: boolean) => {
    if (enabled) {
      handleStart();
    } else {
      onUpdateSettings({ enabled: false, pausedUntil: null });
    }
  };

  const [testResult, setTestResult] = useState<'idle' | 'success' | 'failure'>('idle');

  const handleTestNotification = async () => {
    setTestState('sending');
    setTestResult('idle');
    const ok = await onSendTestNotification();
    setTestState('idle');
    setTestResult(ok ? 'success' : 'failure');
    // Clear the status message after a few seconds so it doesn't linger stale.
    window.setTimeout(() => setTestResult('idle'), 4000);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner" style={styles.headerInner}>
          <div className="app-header-left" style={styles.headerLeft}>
            <DropletMark />
            <h1 style={styles.title}>{t.appTitle}</h1>
          </div>
          <div className="app-header-actions" style={styles.headerRight}>
            <LanguagePicker
              locale={localeState.locale}
              locales={localeState.locales}
              onChange={localeState.setLocale}
              t={t}
            />
            <button
              type="button"
              onClick={darkMode.toggle}
              aria-label={darkMode.scheme === 'dark' ? t.switchToLight : t.switchToDark}
              aria-pressed={darkMode.scheme === 'dark'}
              title={darkMode.scheme === 'dark' ? t.lightMode : t.darkMode}
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--md-sys-shape-corner-full)',
                border: '1px solid var(--md-sys-color-outline-variant)',
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                color: 'var(--md-sys-color-on-surface)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <md-icon aria-hidden="true">
                {darkMode.scheme === 'dark' ? 'light_mode' : 'dark_mode'}
              </md-icon>
            </button>
            <ThemePicker {...themeState} t={t} />
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* LEFT — status + primary action */}
        <aside className="app-left" aria-label={t.quickActionsLabel}>
          <div style={styles.summaryCard}>
            <div style={styles.statusRow}>
              <div>
                <label htmlFor="reminders-switch" id="reminders-label" style={styles.statusLabel}>
                  {t.reminders}
                </label>
                <span id="reminders-hint" style={styles.statusHint}>
                  {!settings.enabled
                    ? t.statusOff
                    : permission !== 'granted'
                      ? t.statusNeedsPermission
                      : isPaused
                        ? t.statusPaused
                        : t.statusActive}
                </span>
              </div>
              <ToggleSwitch
                id="reminders-switch"
                checked={settings.enabled}
                onChange={handleEnabledChange}
                ariaLabel={t.reminders}
                ariaLabelledBy="reminders-label"
                ariaDescribedBy="reminders-hint"
              />
            </div>
            <div aria-live="polite" aria-atomic="true">
              <div style={styles.summaryEyebrow}>{summary.eyebrow}</div>
              <div style={styles.summaryHero}>{summary.hero}</div>
              <div style={styles.summarySub}>{summary.sub}</div>
            </div>
            {settings.enabled && permission === 'granted' && (
              <>
                <div style={styles.summaryDivider} />
                {isPaused ? (
                  <md-filled-tonal-button onClick={onResume} style={{ width: '100%' }}>
                    {t.resumeReminders}
                  </md-filled-tonal-button>
                ) : (
                  <>
                    <p id="pause-label" style={styles.quickLabel}>{t.pauseTemporarily}</p>
                    <div style={styles.pauseGrid} role="group" aria-labelledby="pause-label">
                      <button
                        type="button"
                        className="pause-button"
                        onClick={() => onPauseFor(30)}
                        aria-label={t.pauseMinutesLabel(30)}
                        style={styles.pauseButton}
                      >
                        {t.pauseMinutes(30)}
                      </button>
                      <button
                        type="button"
                        className="pause-button"
                        onClick={() => onPauseFor(60)}
                        aria-label={t.pauseHoursLabel(1)}
                        style={styles.pauseButton}
                      >
                        {t.pauseHours(1)}
                      </button>
                      <button
                        type="button"
                        className="pause-button"
                        onClick={() => onPauseFor(120)}
                        aria-label={t.pauseHoursLabel(2)}
                        style={styles.pauseButton}
                      >
                        {t.pauseHours(2)}
                      </button>
                      <button
                        type="button"
                        className="pause-button"
                        onClick={onPauseForRestOfDay}
                        aria-label={t.untilTomorrowLabel}
                        style={styles.pauseButton}
                      >
                        <md-icon style={{ fontSize: '18px' }}>bedtime</md-icon>
                        {t.untilTomorrow}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <a
            className="github-link"
            href="https://github.com/sydvibecoding/hydration-reminder"
            target="_blank"
            rel="noreferrer"
            aria-label={t.githubLinkLabel}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-1.05-.02-1.9-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .08 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.3.1-2.72 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.09a9.4 9.4 0 0 1 2.5.34c1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.76 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.59.69.49A10.25 10.25 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" />
            </svg>
            <span>{t.githubLink}</span>
            <md-icon aria-hidden="true">open_in_new</md-icon>
          </a>

          {settings.enabled && permission === 'default' && (
            <div style={styles.ctaWrapper}>
              <md-filled-button onClick={onRequestPermission} style={{ width: '100%' }}>
                {t.enableNotifications}
              </md-filled-button>
            </div>
          )}
          {settings.enabled && permission === 'denied' && (
            <div style={styles.notice} role="alert">
              {t.blockedAlert}
            </div>
          )}
        </aside>

        {/* RIGHT — visible config */}
        <section className="app-right" aria-label={t.settingsLabel}>
          {/* Frecuencia */}
          <div style={{ ...styles.section, ...styles.sectionFirst }}>
            <h2 style={styles.sectionTitle}>{t.frequency}</h2>
            <div style={styles.card}>
              <div style={styles.intervalContainer}>
                <IntervalSelector
                  value={settings.intervalMinutes}
                  onChange={(intervalMinutes) => onUpdateSettings({ intervalMinutes })}
                  t={t}
                />
              </div>
            </div>
          </div>

          {/* Horario (weekday + weekend merged) */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>{t.schedule}</h2>
            <div style={styles.card}>
              <div style={styles.row}>
                <span style={styles.rowLeading}>
                  <md-icon aria-hidden="true" style={styles.rowIcon}>schedule</md-icon>
                  <span style={styles.rowLabel}>{t.from}</span>
                </span>
                <TimePicker
                  value={settings.activeHoursStart}
                  onChange={(v) => onUpdateSettings({ activeHoursStart: v })}
                  ariaLabel={t.startTimeLabel}
                  t={t}
                />
              </div>
              <div style={styles.row}>
                <span style={styles.rowLeading}>
                  <md-icon aria-hidden="true" style={styles.rowIcon}>schedule</md-icon>
                  <span style={styles.rowLabel}>{t.to}</span>
                </span>
                <TimePicker
                  value={settings.activeHoursEnd}
                  onChange={(v) => onUpdateSettings({ activeHoursEnd: v })}
                  ariaLabel={t.endTimeLabel}
                  t={t}
                />
              </div>
              <div
                style={{
                  ...styles.row,
                  ...(settings.weekendHoursEnabled ? {} : styles.rowLast),
                }}
              >
                <label htmlFor="weekend-switch" id="weekend-label" style={{ ...styles.rowLabel, ...styles.rowLeading }}>
                  <md-icon aria-hidden="true" style={styles.rowIcon}>calendar_today</md-icon>
                  <span>{t.weekendSchedule}</span>
                </label>
                <ToggleSwitch
                  id="weekend-switch"
                  checked={settings.weekendHoursEnabled}
                  onChange={(weekendHoursEnabled) =>
                    onUpdateSettings({ weekendHoursEnabled })
                  }
                  ariaLabel={t.weekendSchedule}
                  ariaLabelledBy="weekend-label"
                />
              </div>
              {settings.weekendHoursEnabled && (
                <>
                  <div style={styles.subGroupHeader}>{t.weekend}</div>
                  <div style={{ ...styles.row, ...styles.rowIndented }}>
                    <span style={styles.rowLeading}>
                      <md-icon aria-hidden="true" style={styles.rowIcon}>schedule</md-icon>
                      <span style={styles.rowLabel}>{t.from}</span>
                    </span>
                    <TimePicker
                      value={settings.weekendStart}
                      onChange={(v) => onUpdateSettings({ weekendStart: v })}
                      ariaLabel={t.weekendStartLabel}
                      t={t}
                    />
                  </div>
                  <div style={{ ...styles.row, ...styles.rowIndented, ...styles.rowLast }}>
                    <span style={styles.rowLeading}>
                      <md-icon aria-hidden="true" style={styles.rowIcon}>schedule</md-icon>
                      <span style={styles.rowLabel}>{t.to}</span>
                    </span>
                    <TimePicker
                      value={settings.weekendEnd}
                      onChange={(v) => onUpdateSettings({ weekendEnd: v })}
                      ariaLabel={t.weekendEndLabel}
                      t={t}
                    />
                  </div>
                </>
              )}
            </div>
            <p style={styles.sectionFooter}>
              {t.scheduleFooter}
            </p>
          </div>

          {/* Alertas */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>{t.alerts}</h2>
            <div style={styles.card}>
              <div style={styles.row}>
                <label htmlFor="sound-switch" id="sound-label" style={{ ...styles.rowLabel, ...styles.rowLeading }}>
                  <md-icon aria-hidden="true" style={styles.rowIcon}>volume_up</md-icon>
                  <span>{t.sound}</span>
                </label>
                <ToggleSwitch
                  id="sound-switch"
                  checked={settings.soundEnabled}
                  onChange={(soundEnabled) => onUpdateSettings({ soundEnabled })}
                  ariaLabel={t.sound}
                  ariaLabelledBy="sound-label"
                />
              </div>
              <div style={{ ...styles.row, ...styles.rowLast }}>
                <span style={styles.rowLeading}>
                  <md-icon aria-hidden="true" style={styles.rowIcon}>notifications</md-icon>
                  <span style={styles.rowLabel}>{t.testNotification}</span>
                </span>
                <div style={styles.testActionCluster}>
                  <span
                    style={styles.testStatus}
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {testResult === 'success'
                      ? t.sent
                      : testResult === 'failure'
                        ? t.sendFailed
                        : ''}
                  </span>
                  <button
                    type="button"
                    style={styles.rowAction}
                    onClick={handleTestNotification}
                    disabled={testState === 'sending'}
                    aria-busy={testState === 'sending'}
                  >
                    {testState === 'sending' ? t.sending : t.test}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <section className="about-app" aria-labelledby="about-app-title">
        <div className="about-app-intro">
          <p className="about-app-eyebrow">{t.aboutEyebrow}</p>
          <h2 id="about-app-title">{t.aboutTitle}</h2>
          <p>{t.aboutBody}</p>
        </div>
        <div className="about-app-grid">
          {t.faq.map((item, index) => (
            <article key={item.q}>
              <md-icon aria-hidden="true">{FAQ_ICONS[index] ?? 'help'}</md-icon>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="privacy-footer">
        {t.footer}
      </footer>
    </div>
  );
}
