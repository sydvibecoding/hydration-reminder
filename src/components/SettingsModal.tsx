import { CSSProperties, useEffect } from 'react';
import { Settings } from '../types/settings';
import { ToggleSwitch } from './ToggleSwitch';
import { IntervalSelector } from './IntervalSelector';
import { TimePicker } from './TimePicker';

interface Props {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdateSettings: (updates: Partial<Settings>) => void;
}

const styles: Record<string, CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    padding: '20px',
  },
  panel: {
    backgroundColor: 'var(--color-bg-grouped)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
    width: '100%',
    maxWidth: '480px',
    maxHeight: 'calc(100vh - 40px)',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 20px 8px',
  },
  title: {
    fontSize: 'var(--font-size-title2)',
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--color-text-primary)',
    letterSpacing: '-0.4px',
    margin: 0,
  },
  close: {
    fontSize: '22px',
    lineHeight: 1,
    color: 'var(--color-text-tertiary)',
    padding: '4px 10px',
  },
  body: {
    padding: '8px 0 24px',
  },
  section: {
    marginTop: '24px',
  },
  sectionFirst: {
    marginTop: 0,
  },
  sectionHeader: {
    fontSize: 'var(--font-size-footnote)',
    fontWeight: 'var(--font-weight-regular)',
    color: 'var(--color-text-tertiary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '-0.08px',
    marginBottom: '8px',
    paddingLeft: '20px',
  },
  sectionFooter: {
    fontSize: 'var(--font-size-footnote)',
    color: 'var(--color-text-tertiary)',
    marginTop: '8px',
    padding: '0 20px',
    lineHeight: 1.4,
    letterSpacing: '-0.08px',
  },
  card: {
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    margin: '0 20px',
    overflow: 'hidden',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 'var(--row-height)',
    padding: '6px 20px',
    borderBottom: '1px solid var(--color-separator)',
  },
  rowLast: {
    borderBottom: 'none',
  },
  rowLabel: {
    fontSize: 'var(--font-size-body)',
    color: 'var(--color-text-primary)',
    letterSpacing: '-0.4px',
  },
  intervalContainer: {
    padding: '16px',
  },
  intervalLabel: {
    fontSize: 'var(--font-size-subhead)',
    color: 'var(--color-text-secondary)',
    marginBottom: '12px',
    letterSpacing: '-0.24px',
  },
};

export function SettingsModal({ open, onClose, settings, onUpdateSettings }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div style={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
        <header style={styles.header}>
          <h2 style={styles.title}>Ajustes</h2>
          <button style={styles.close} onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>
        <div style={styles.body}>
          {/* Frecuencia */}
          <div style={{ ...styles.section, ...styles.sectionFirst }}>
            <p style={styles.sectionHeader}>Frecuencia</p>
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

          {/* Horario */}
          <div style={styles.section}>
            <p style={styles.sectionHeader}>Horario</p>
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
                  <div style={styles.row}>
                    <span style={styles.rowLabel}>Desde</span>
                    <TimePicker
                      value={settings.weekendStart}
                      onChange={(v) => onUpdateSettings({ weekendStart: v })}
                      ariaLabel="Hora de inicio durante el fin de semana"
                    />
                  </div>
                  <div style={{ ...styles.row, ...styles.rowLast }}>
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
            <p style={styles.sectionHeader}>Alertas</p>
            <div style={styles.card}>
              <div style={{ ...styles.row, ...styles.rowLast }}>
                <span style={styles.rowLabel}>Sonido</span>
                <ToggleSwitch
                  checked={settings.soundEnabled}
                  onChange={(soundEnabled) => onUpdateSettings({ soundEnabled })}
                  ariaLabel="Sonido"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
