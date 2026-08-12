import { CSSProperties } from 'react';
import { IntervalMinutes, INTERVAL_OPTIONS } from '../types/settings';

interface IntervalSelectorProps {
  value: IntervalMinutes;
  onChange: (value: IntervalMinutes) => void;
}

const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    gap: '6px',
    backgroundColor: 'transparent',
    borderRadius: 'var(--radius-sm)',
    padding: '2px 0',
  },
  option: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 2px',
    minHeight: '44px',
    fontSize: 'var(--font-size-footnote)',
    fontWeight: 'var(--font-weight-medium)',
    textAlign: 'center' as const,
    borderRadius: '8px',
    backgroundColor: 'var(--color-bg-tertiary)',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    border: 'none',
    letterSpacing: '-0.08px',
  },
  optionSelected: {
    backgroundColor: 'var(--color-accent-subtle)',
    color: 'var(--color-accent)',
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
    fontWeight: 'var(--font-weight-semibold)',
  },
};

function formatInterval(minutes: IntervalMinutes): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = minutes / 60;
  if (Number.isInteger(hours)) {
    return hours === 1 ? '1 h' : `${hours} h`;
  }
  return '1 h 30 min';
}

export function IntervalSelector({ value, onChange }: IntervalSelectorProps) {
  return (
    <div style={styles.container} role="group" aria-label="Frecuencia de los recordatorios">
      {INTERVAL_OPTIONS.map((option) => (
        <button
          key={option}
          className={`interval-option${value === option ? ' is-selected' : ''}`}
          onClick={() => onChange(option)}
          aria-pressed={value === option}
          style={{
            ...styles.option,
            ...(value === option ? styles.optionSelected : {}),
          }}
        >
          {formatInterval(option)}
        </button>
      ))}
    </div>
  );
}
