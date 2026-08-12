import { useState, CSSProperties } from 'react';
import { Settings, IntervalMinutes } from '../types/settings';
import { IntervalSelector } from './IntervalSelector';

interface OnboardingScreenProps {
  onComplete: (settings: Partial<Settings>) => void;
  onRequestPermission: () => Promise<NotificationPermission>;
}

type Step = 'welcome' | 'hours' | 'interval' | 'permission' | 'complete';

const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--color-bg-grouped)',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '48px 24px',
    maxWidth: '390px',
    margin: '0 auto',
    width: '100%',
  },

  // Neutral monochrome mark (no gradient, no shadow, no colored bg)
  mark: {
    width: '48px',
    height: '48px',
    color: 'var(--color-text-primary)',
    marginBottom: '28px',
    display: 'block',
  },

  // Typography
  title: {
    fontSize: 'var(--font-size-large-title)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-text-primary)',
    letterSpacing: '-0.4px',
    lineHeight: 1.15,
    marginBottom: '10px',
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 'var(--font-size-body)',
    fontWeight: 'var(--font-weight-regular)',
    color: 'var(--color-text-secondary)',
    letterSpacing: '-0.4px',
    lineHeight: 1.47,
    textAlign: 'center' as const,
    maxWidth: '300px',
    marginBottom: '32px',
  },

  // Feature list — neutral checks, no cyan bubbles
  featureList: {
    width: '100%',
    marginBottom: '8px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '10px 0',
  },
  featureIconWrapper: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: 'var(--color-text-tertiary)',
  },
  featureIconSvg: {
    width: '16px',
    height: '16px',
    display: 'block',
  },
  featureText: {
    fontSize: 'var(--font-size-body)',
    fontWeight: 'var(--font-weight-regular)',
    color: 'var(--color-text-primary)',
    letterSpacing: '-0.4px',
  },

  // Cards (grouped iOS)
  card: {
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    width: '100%',
    marginBottom: '24px',
  },
  timeRow: {
    display: 'flex',
    alignItems: 'center',
    minHeight: 'var(--row-height)',
    paddingLeft: 'var(--spacing-md)',
    backgroundColor: 'var(--color-bg-secondary)',
  },
  timeRowInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    minHeight: 'var(--row-height)',
    paddingRight: 'var(--spacing-md)',
    borderBottom: '1px solid var(--color-separator)',
  },
  timeRowInnerLast: {
    borderBottom: 'none',
  },
  rowLabel: {
    fontSize: 'var(--font-size-body)',
    fontWeight: 'var(--font-weight-regular)',
    color: 'var(--color-text-primary)',
    letterSpacing: '-0.4px',
  },
  timeInput: {
    fontSize: 'var(--font-size-body)',
    fontWeight: 'var(--font-weight-regular)',
    color: 'var(--color-text-primary)',
    backgroundColor: 'var(--color-bg-tertiary)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: '6px 12px',
    textAlign: 'center' as const,
    letterSpacing: '-0.4px',
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

  // Footer
  footer: {
    padding: '24px',
    paddingBottom: 'env(safe-area-inset-bottom, 32px)',
    width: '100%',
    maxWidth: '390px',
    margin: '0 auto',
  },
  dots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '6px',
    marginBottom: '24px',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-text-quaternary)',
    transition: 'all 0.25s ease',
  },
  dotActive: {
    backgroundColor: 'var(--color-text-primary)',
    width: '20px',
    borderRadius: '3px',
  },
  button: {
    width: '100%',
    minHeight: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 20px',
    fontSize: 'var(--font-size-body)',
    fontWeight: 'var(--font-weight-semibold)',
    backgroundColor: 'var(--color-text-primary)',
    color: 'var(--color-bg-secondary)',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    marginBottom: '8px',
    letterSpacing: '-0.4px',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    color: 'var(--color-text-tertiary)',
    fontWeight: 'var(--font-weight-regular)',
  },
};

const STEPS: Step[] = ['welcome', 'hours', 'interval', 'permission', 'complete'];

export function OnboardingScreen({ onComplete, onRequestPermission }: OnboardingScreenProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [activeHoursStart, setActiveHoursStart] = useState('08:00');
  const [activeHoursEnd, setActiveHoursEnd] = useState('23:00');
  const [intervalMinutes, setIntervalMinutes] = useState<IntervalMinutes>(60);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const stepIndex = STEPS.indexOf(step);

  const handleNext = () => {
    const nextIndex = stepIndex + 1;
    if (nextIndex < STEPS.length) {
      setStep(STEPS[nextIndex]);
    }
  };

  const handleRequestPermission = async () => {
    const result = await onRequestPermission();
    setPermissionGranted(result === 'granted');
    handleNext();
  };

  const handleSkipPermission = () => {
    handleNext();
  };

  const handleFinish = () => {
    onComplete({
      activeHoursStart,
      activeHoursEnd,
      intervalMinutes,
      enabled: permissionGranted,
      onboardingComplete: true,
    });
  };

  const renderDots = () => (
    <div style={styles.dots}>
      {STEPS.slice(0, -1).map((s, i) => (
        <div
          key={s}
          style={{
            ...styles.dot,
            ...(i === stepIndex ? styles.dotActive : {}),
          }}
        />
      ))}
    </div>
  );

  const CheckIcon = () => (
    <svg style={styles.featureIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const DropletMark = () => (
    <svg style={styles.mark} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3 C12 3 5 11 5 16 C5 20 8 22 12 22 C16 22 19 20 19 16 C19 11 12 3 12 3 Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const BellMark = () => (
    <svg style={styles.mark} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const CheckMark = () => (
    <svg style={styles.mark} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const renderWelcome = () => (
    <>
      <div style={styles.content}>
        <DropletMark />
        <h1 style={styles.title}>Hidratación</h1>
        <p style={styles.subtitle}>
          Recordatorios amables para tomar agua, a tu ritmo.
        </p>
        <div style={styles.featureList}>
          <div style={styles.featureItem}>
            <div style={styles.featureIconWrapper}>
              <CheckIcon />
            </div>
            <span style={styles.featureText}>Recordatorios a tu ritmo</span>
          </div>
          <div style={styles.featureItem}>
            <div style={styles.featureIconWrapper}>
              <CheckIcon />
            </div>
            <span style={styles.featureText}>Respeta tu horario de descanso</span>
          </div>
          <div style={styles.featureItem}>
            <div style={styles.featureIconWrapper}>
              <CheckIcon />
            </div>
            <span style={styles.featureText}>Pausa cuando lo necesites</span>
          </div>
        </div>
      </div>
      <div style={styles.footer}>
        {renderDots()}
        <button style={styles.button} onClick={handleNext}>
          Comenzar
        </button>
      </div>
    </>
  );

  const renderHours = () => (
    <>
      <div style={styles.content}>
        <h1 style={styles.title}>Tu horario</h1>
        <p style={styles.subtitle}>
          Solo te recordaremos durante estas horas. Respetamos tu descanso.
        </p>
        <div style={styles.card}>
          <div style={styles.timeRow}>
            <div style={styles.timeRowInner}>
              <span style={styles.rowLabel}>Desde</span>
              <input
                type="time"
                aria-label="Hora de inicio de los recordatorios"
                value={activeHoursStart}
                onChange={(e) => setActiveHoursStart(e.target.value)}
                style={styles.timeInput}
              />
            </div>
          </div>
          <div style={styles.timeRow}>
            <div style={{ ...styles.timeRowInner, ...styles.timeRowInnerLast }}>
              <span style={styles.rowLabel}>Hasta</span>
              <input
                type="time"
                aria-label="Hora de finalización de los recordatorios"
                value={activeHoursEnd}
                onChange={(e) => setActiveHoursEnd(e.target.value)}
                style={styles.timeInput}
              />
            </div>
          </div>
        </div>
      </div>
      <div style={styles.footer}>
        {renderDots()}
        <button style={styles.button} onClick={handleNext}>
          Continuar
        </button>
      </div>
    </>
  );

  const renderInterval = () => (
    <>
      <div style={styles.content}>
        <h1 style={styles.title}>Frecuencia</h1>
        <p style={styles.subtitle}>
          ¿Cada cuánto te gustaría recibir un recordatorio?
        </p>
        <div style={styles.card}>
          <div style={styles.intervalContainer}>
            <p style={styles.intervalLabel}>Recordar cada</p>
            <IntervalSelector value={intervalMinutes} onChange={setIntervalMinutes} />
          </div>
        </div>
      </div>
      <div style={styles.footer}>
        {renderDots()}
        <button style={styles.button} onClick={handleNext}>
          Continuar
        </button>
      </div>
    </>
  );

  const renderPermission = () => (
    <>
      <div style={styles.content}>
        <BellMark />
        <h1 style={styles.title}>Notificaciones</h1>
        <p style={styles.subtitle}>
          Para recordarte tomar agua necesitamos tu permiso para enviar notificaciones.
        </p>
      </div>
      <div style={styles.footer}>
        {renderDots()}
        <button style={styles.button} onClick={handleRequestPermission}>
          Activar notificaciones
        </button>
        <button
          style={{ ...styles.button, ...styles.buttonSecondary }}
          onClick={handleSkipPermission}
        >
          Ahora no
        </button>
      </div>
    </>
  );

  const renderComplete = () => (
    <>
      <div style={styles.content}>
        <CheckMark />
        <h1 style={styles.title}>Listo</h1>
        <p style={styles.subtitle}>
          {permissionGranted
            ? 'Recibirás tu primer recordatorio pronto. Sin prisa, a tu ritmo.'
            : 'Puedes activar las notificaciones cuando quieras desde la configuración.'}
        </p>
      </div>
      <div style={styles.footer}>
        <button style={styles.button} onClick={handleFinish}>
          Empezar
        </button>
      </div>
    </>
  );

  return (
    <div style={styles.container}>
      {step === 'welcome' && renderWelcome()}
      {step === 'hours' && renderHours()}
      {step === 'interval' && renderInterval()}
      {step === 'permission' && renderPermission()}
      {step === 'complete' && renderComplete()}
    </div>
  );
}
