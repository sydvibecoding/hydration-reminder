import { useState, useRef, useEffect, useId, CSSProperties } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  minuteStep?: number;
  ariaLabel: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

const styles: Record<string, CSSProperties> = {
  container: {
    position: 'relative',
    display: 'inline-block',
  },
  trigger: {
    backgroundColor: 'var(--color-bg-tertiary)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: '6px 12px',
    fontSize: 'var(--font-size-body)',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    letterSpacing: '-0.4px',
    fontFamily: 'inherit',
    fontVariantNumeric: 'tabular-nums',
    minWidth: '72px',
    textAlign: 'center',
  },
  popover: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '6px',
    backgroundColor: 'var(--color-bg-secondary)',
    border: '1px solid var(--color-surface-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 8px 28px rgba(0, 0, 0, 0.14)',
    padding: '12px',
    display: 'flex',
    gap: '12px',
    zIndex: 100,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
  columnLabel: {
    fontSize: 'var(--font-size-caption1)',
    color: 'var(--color-text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px',
    paddingLeft: '2px',
  },
  hourGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 34px)',
    gap: '2px',
  },
  minuteGrid: {
    display: 'grid',
    gridTemplateColumns: '38px',
    gap: '2px',
  },
  cell: {
    minHeight: '28px',
    padding: '4px 6px',
    fontSize: 'var(--font-size-subhead)',
    color: 'var(--color-text-primary)',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.24px',
    fontFamily: 'inherit',
  },
  cellActive: {
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-accent)',
    fontWeight: 'var(--font-weight-semibold)',
  },
  divider: {
    width: '1px',
    backgroundColor: 'var(--color-separator)',
    margin: '18px 0 4px',
  },
};

export function TimePicker({ value, onChange, minuteStep = 15, ariaLabel }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogId = useId();

  const minutes = Array.from({ length: Math.floor(60 / minuteStep) }, (_, i) =>
    (i * minuteStep).toString().padStart(2, '0')
  );
  const [h, m] = value.split(':');
  const snappedM = minutes.includes(m)
    ? m
    : minutes.reduce((closest, current) =>
        Math.abs(Number(current) - Number(m)) < Math.abs(Number(closest) - Number(m))
          ? current
          : closest,
      minutes[0]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const closeAndRestoreFocus = () => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return (
    <div ref={containerRef} style={styles.container}>
      <button
        ref={triggerRef}
        className="time-trigger"
        style={styles.trigger}
        onClick={() => setOpen(!open)}
        aria-label={`${ariaLabel}: ${h}:${snappedM}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
      >
        {h}:{snappedM}
      </button>
      {open && (
        <div id={dialogId} className="time-picker-popover" style={styles.popover} role="dialog" aria-label={ariaLabel}>
          <div style={styles.column}>
            <div style={styles.columnLabel}>Hora</div>
            <div style={styles.hourGrid} role="group" aria-label="Hora">
              {HOURS.map((hour) => (
                <button
                  key={hour}
                  className="time-cell"
                  style={{ ...styles.cell, ...(hour === h ? styles.cellActive : {}) }}
                  onClick={() => onChange(`${hour}:${snappedM}`)}
                  aria-pressed={hour === h}
                >
                  {hour}
                </button>
              ))}
            </div>
          </div>
          <div aria-hidden="true" style={styles.divider} />
          <div style={styles.column}>
            <div style={styles.columnLabel}>Min</div>
            <div style={styles.minuteGrid} role="group" aria-label="Minutos">
              {minutes.map((minute) => (
                <button
                  key={minute}
                  className="time-cell"
                  style={{ ...styles.cell, ...(minute === snappedM ? styles.cellActive : {}) }}
                  onClick={() => {
                    onChange(`${h}:${minute}`);
                    closeAndRestoreFocus();
                  }}
                  aria-pressed={minute === snappedM}
                >
                  {minute}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
