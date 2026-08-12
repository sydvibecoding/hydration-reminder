import { CSSProperties, useMemo, useState } from 'react';
import { Settings } from '../types/settings';
import { ToggleSwitch } from './ToggleSwitch';
import { IntervalSelector } from './IntervalSelector';
import { TimePicker } from './TimePicker';
import { ThemePicker } from './ThemePicker';
import { ThemeState } from '../hooks/useTheme';
import { getRemainingNotificationsToday } from '../services/notificationScheduler';

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
}

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
  droplet: {
    width: 'var(--font-size-large-title)',
    height: 'var(--font-size-large-title)',
    color: 'var(--color-accent)',
    display: 'block',
  },
  title: {
    fontSize: 'var(--font-size-large-title)',
    fontWeight: 'var(--font-weight-semibold)',
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
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: 'var(--font-size-footnote)',
    fontWeight: 'var(--font-weight-regular)',
    color: 'var(--color-text-tertiary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '-0.08px',
    marginBottom: '8px',
    paddingLeft: 'var(--spacing-md)',
    marginLeft: 'var(--card-inline-margin)',
  },
  sectionHeaderIcon: {
    width: '13px',
    height: '13px',
    display: 'block',
  },
  sectionFooter: {
    fontSize: 'var(--font-size-footnote)',
    fontWeight: 'var(--font-weight-regular)',
    color: 'var(--color-text-tertiary)',
    marginTop: '8px',
    padding: '6px var(--spacing-lg)',
    marginLeft: 'var(--card-inline-margin)',
    marginRight: 'var(--card-inline-margin)',
    lineHeight: 1.38,
    letterSpacing: '-0.08px',
  },

  // Cards (right column) — no overflow:hidden so TimePicker popover can escape
  card: {
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-surface-border)',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
    marginLeft: 'var(--card-inline-margin)',
    marginRight: 'var(--card-inline-margin)',
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
    fontWeight: 'var(--font-weight-regular)',
    color: 'var(--color-text-primary)',
    letterSpacing: '-0.4px',
  },
  // Sub-group header inside a card (visually groups nested rows)
  subGroupHeader: {
    fontSize: 'var(--font-size-caption1)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-text-tertiary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
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
  intervalLabel: {
    fontSize: 'var(--font-size-subhead)',
    fontWeight: 'var(--font-weight-regular)',
    color: 'var(--color-text-secondary)',
    marginBottom: '12px',
    letterSpacing: '-0.24px',
  },

  // Summary card (left column)
  summaryCard: {
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-surface-border)',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
    padding: '20px',
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
    color: 'var(--color-text-primary)',
  },
  statusHint: {
    display: 'block',
    marginTop: '2px',
    fontSize: 'var(--font-size-footnote)',
    color: 'var(--color-text-tertiary)',
  },
  summaryEyebrow: {
    fontSize: 'var(--font-size-footnote)',
    fontWeight: 'var(--font-weight-regular)',
    color: 'var(--color-text-tertiary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  summaryHero: {
    fontSize: 'var(--font-size-title1)',
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--color-text-primary)',
    letterSpacing: '-0.4px',
    lineHeight: 1.15,
    marginTop: '6px',
  },
  summarySub: {
    fontSize: 'var(--font-size-subhead)',
    fontWeight: 'var(--font-weight-regular)',
    color: 'var(--color-text-tertiary)',
    marginTop: '16px',
    letterSpacing: '-0.24px',
  },
  summaryDivider: {
    height: '1px',
    backgroundColor: 'var(--color-separator)',
    margin: '20px 0 14px',
  },
  quickLabel: {
    fontSize: 'var(--font-size-caption1)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-text-tertiary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
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
  pauseButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    minHeight: '44px',
    padding: '8px 4px',
    fontSize: 'var(--font-size-footnote)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-text-primary)',
    backgroundColor: 'var(--color-bg-tertiary)',
    borderRadius: 'var(--radius-full)',
    letterSpacing: '-0.08px',
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
    color: 'var(--color-accent)',
    backgroundColor: 'var(--color-accent-subtle)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--font-size-subhead)',
    fontWeight: 'var(--font-weight-medium)',
  },
};

const DropletMark = () => (
  <svg aria-hidden="true" style={styles.droplet} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3 C12 3 5 11 5 16 C5 20 8 22 12 22 C16 22 19 20 19 16 C19 11 12 3 12 3 Z" />
  </svg>
);

const ClockIcon = () => (
  <svg aria-hidden="true" style={styles.sectionHeaderIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CalendarIcon = () => (
  <svg aria-hidden="true" style={styles.sectionHeaderIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const BellIcon = () => (
  <svg aria-hidden="true" style={styles.sectionHeaderIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const MoonIcon = () => (
  <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
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
}: SettingsScreenProps) {
  const [testState, setTestState] = useState<'idle' | 'sending'>('idle');

  const formatNextTime = (date: Date | null) => {
    if (!date) return null;
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 1) return 'En cualquier momento';
    if (diffMins < 60) return `Dentro de ${diffMins} min`;
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    if (minutes === 0) return `Dentro de ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    if (hours === 0) return `Dentro de ${minutes} min`;
    return `Dentro de ${hours} h ${minutes} min`;
  };

  const formatClock = (d: Date) => {
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const summary = useMemo(() => {
    if (!settings.enabled) {
      return {
        eyebrow: 'Estado',
        hero: 'Desactivados',
        sub: 'No recibirás recordatorios.',
      };
    }
    if (permission === 'denied') {
      return {
        eyebrow: 'Notificaciones',
        hero: 'Bloqueadas',
        sub: 'Cámbialo en los ajustes del navegador.',
      };
    }
    if (permission === 'default') {
      return {
        eyebrow: 'Notificaciones',
        hero: 'Sin permiso',
        sub: 'Actívalas para empezar a recibir avisos.',
      };
    }
    if (isPaused) {
      const pausedUntil = settings.pausedUntil ? new Date(settings.pausedUntil) : null;
      const pausedForToday = pausedUntil?.getHours() === 23 && pausedUntil.getMinutes() === 59;
      return {
        eyebrow: 'Estado',
        hero: 'En pausa',
        sub: pausedForToday
          ? 'Los recordatorios volverán mañana.'
          : pausedUntil
            ? `En pausa hasta las ${formatClock(pausedUntil)}.`
            : 'Reanuda cuando quieras.',
      };
    }

    const remaining = getRemainingNotificationsToday(settings);

    if (remaining.count === 0) {
      return {
        eyebrow: 'Descanso',
        hero: `Mañana desde las ${settings.activeHoursStart}`,
        sub: 'Nada más por hoy.',
      };
    }

    const relativeTime = formatNextTime(nextNotificationTime) ?? 'Pronto';
    let sub: string;
    if (remaining.count === 1) {
      sub = `${relativeTime} · Último recordatorio del día`;
    } else {
      const moreCount = remaining.count - 1;
      sub = `${relativeTime} · ${moreCount} ${moreCount === 1 ? 'recordatorio' : 'recordatorios'} más hoy`;
    }

    return {
      eyebrow: 'Próximo aviso',
      hero: nextNotificationTime ? formatClock(nextNotificationTime) : 'Pronto',
      sub,
    };
  }, [settings, permission, isPaused, nextNotificationTime]);

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

  const handleTestNotification = async () => {
    setTestState('sending');
    await onSendTestNotification();
    setTestState('idle');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div style={styles.headerInner}>
          <div style={styles.headerLeft}>
            <DropletMark />
            <h1 style={styles.title}>Hidratación</h1>
          </div>
          <div style={styles.headerRight}>
            <ThemePicker {...themeState} />
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* LEFT — status + primary action */}
        <aside className="app-left">
          <div style={styles.summaryCard}>
            <div style={styles.statusRow}>
              <div>
                <span style={styles.statusLabel}>Recordatorios</span>
                <span style={styles.statusHint}>
                  {!settings.enabled
                    ? 'Desactivados'
                    : permission !== 'granted'
                      ? 'Necesitan permiso'
                      : isPaused
                        ? 'En pausa'
                        : 'Activos'}
                </span>
              </div>
              <ToggleSwitch
                checked={settings.enabled}
                onChange={handleEnabledChange}
                ariaLabel="Activar recordatorios"
              />
            </div>
            <div style={styles.summaryEyebrow}>{summary.eyebrow}</div>
            <div style={styles.summaryHero}>{summary.hero}</div>
            <div style={styles.summarySub}>{summary.sub}</div>
            {settings.enabled && permission === 'granted' && (
              <>
                <div style={styles.summaryDivider} />
                {isPaused ? (
                  <button className="secondary-action" style={styles.secondaryAction} onClick={onResume}>
                    Reanudar recordatorios
                  </button>
                ) : (
                  <>
                    <p style={styles.quickLabel}>Pausar temporalmente</p>
                    <div style={styles.pauseGrid}>
                      <button className="pause-chip" style={styles.pauseButton} onClick={() => onPauseFor(30)}>
                        30 min
                      </button>
                      <button className="pause-chip" style={styles.pauseButton} onClick={() => onPauseFor(60)}>
                        1 hora
                      </button>
                      <button className="pause-chip" style={styles.pauseButton} onClick={() => onPauseFor(120)}>
                        2 horas
                      </button>
                      <button className="pause-chip" style={styles.pauseButton} onClick={onPauseForRestOfDay}>
                        <MoonIcon /> Hasta mañana
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {settings.enabled && permission === 'default' && (
            <div style={styles.ctaWrapper}>
              <button className="primary-cta" style={styles.primaryCta} onClick={onRequestPermission}>
                Activar notificaciones
              </button>
            </div>
          )}
          {settings.enabled && permission === 'denied' && (
            <div style={styles.notice}>
              Las notificaciones están bloqueadas en este navegador. Actívalas desde los
              ajustes del sitio para recibir recordatorios.
            </div>
          )}
        </aside>

        {/* RIGHT — visible config */}
        <section className="app-right">
          {/* Frecuencia */}
          <div style={{ ...styles.section, ...styles.sectionFirst }}>
            <h2 style={styles.sectionHeader}><ClockIcon />Frecuencia</h2>
            <div style={styles.card}>
              <div style={styles.intervalContainer}>
                <p style={styles.intervalLabel}>Recordar cada</p>
                <IntervalSelector
                  value={settings.intervalMinutes}
                  onChange={(intervalMinutes) => onUpdateSettings({ intervalMinutes })}
                />
              </div>
            </div>
          </div>

          {/* Horario (weekday + weekend merged) */}
          <div style={styles.section}>
            <h2 style={styles.sectionHeader}><CalendarIcon />Horario</h2>
            <div style={styles.card}>
              <div style={styles.row}>
                <span style={styles.rowLabel}>Desde</span>
                <TimePicker
                  value={settings.activeHoursStart}
                  onChange={(v) => onUpdateSettings({ activeHoursStart: v })}
                  ariaLabel="Hora de inicio de los recordatorios"
                />
              </div>
              <div style={styles.row}>
                <span style={styles.rowLabel}>Hasta</span>
                <TimePicker
                  value={settings.activeHoursEnd}
                  onChange={(v) => onUpdateSettings({ activeHoursEnd: v })}
                  ariaLabel="Hora de finalización de los recordatorios"
                />
              </div>
              <div
                style={{
                  ...styles.row,
                  ...(settings.weekendHoursEnabled ? {} : styles.rowLast),
                }}
              >
                <span style={styles.rowLabel}>Horario de fin de semana</span>
                <ToggleSwitch
                  checked={settings.weekendHoursEnabled}
                  onChange={(weekendHoursEnabled) =>
                    onUpdateSettings({ weekendHoursEnabled })
                  }
                  ariaLabel="Usar un horario diferente durante el fin de semana"
                />
              </div>
              {settings.weekendHoursEnabled && (
                <>
                  <div style={styles.subGroupHeader}>Fin de semana</div>
                  <div style={{ ...styles.row, ...styles.rowIndented }}>
                    <span style={styles.rowLabel}>Desde</span>
                    <TimePicker
                      value={settings.weekendStart}
                      onChange={(v) => onUpdateSettings({ weekendStart: v })}
                      ariaLabel="Hora de inicio durante el fin de semana"
                    />
                  </div>
                  <div style={{ ...styles.row, ...styles.rowIndented, ...styles.rowLast }}>
                    <span style={styles.rowLabel}>Hasta</span>
                    <TimePicker
                      value={settings.weekendEnd}
                      onChange={(v) => onUpdateSettings({ weekendEnd: v })}
                      ariaLabel="Hora de finalización durante el fin de semana"
                    />
                  </div>
                </>
              )}
            </div>
            <p style={styles.sectionFooter}>
              Solo recibirás recordatorios durante estas horas.
            </p>
          </div>

          {/* Alertas */}
          <div style={styles.section}>
            <h2 style={styles.sectionHeader}><BellIcon />Alertas</h2>
            <div style={styles.card}>
              <div style={styles.row}>
                <span style={styles.rowLabel}>Sonido</span>
                <ToggleSwitch
                  checked={settings.soundEnabled}
                  onChange={(soundEnabled) => onUpdateSettings({ soundEnabled })}
                  ariaLabel="Sonido"
                />
              </div>
              <div style={{ ...styles.row, ...styles.rowLast }}>
                <span style={styles.rowLabel}>Notificación de prueba</span>
                <button
                  className="alert-test-action"
                  style={styles.rowAction}
                  onClick={handleTestNotification}
                  disabled={testState === 'sending'}
                >
                  {testState === 'sending' ? 'Enviando…' : 'Probar'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
