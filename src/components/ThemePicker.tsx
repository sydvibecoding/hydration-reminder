import { useState, useRef, useEffect, useId, CSSProperties } from 'react';
import { Theme } from '../hooks/useTheme';

interface Props {
  themes: Theme[];
  currentTheme: Theme;
  setTheme: (id: string) => void;
}

const styles: Record<string, CSSProperties> = {
  container: {
    position: 'relative',
    display: 'inline-block',
  },
  trigger: {
    minHeight: '44px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--color-separator-opaque)',
    padding: '6px 7px 6px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--color-text-primary)',
    backgroundColor: 'var(--color-bg-secondary)',
  },
  triggerSwatch: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '1px solid var(--color-separator-opaque)',
    flexShrink: 0,
  },
  triggerLabel: {
    fontSize: 'var(--font-size-footnote)',
    fontWeight: 'var(--font-weight-medium)',
    whiteSpace: 'nowrap',
  },
  triggerIcon: {
    width: '16px',
    height: '16px',
    color: 'var(--color-text-secondary)',
    display: 'block',
    flexShrink: 0,
  },
  popover: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '10px',
    padding: '12px',
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 6px 24px rgba(0, 0, 0, 0.12)',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(138px, 1fr))',
    gap: '6px',
    width: 'min(300px, calc(100vw - 32px))',
    zIndex: 100,
  },
  swatch: {
    width: '100%',
    minHeight: '44px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-separator-opaque)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 8px',
    color: 'var(--color-text-primary)',
    backgroundColor: 'transparent',
    textAlign: 'left',
  },
  swatchActive: {
    backgroundColor: 'var(--color-accent-subtle)',
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
  },
  swatchColor: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '1px solid var(--color-separator-opaque)',
    flexShrink: 0,
  },
  swatchName: {
    fontSize: 'var(--font-size-caption1)',
    fontWeight: 'var(--font-weight-medium)',
    lineHeight: 1.2,
  },
  popoverHeader: {
    gridColumn: '1 / -1',
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--font-size-caption1)',
    fontWeight: 'var(--font-weight-medium)',
    lineHeight: 1.3,
    marginBottom: '2px',
  },
};

export function ThemePicker({ themes, currentTheme, setTheme }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedThemeRef = useRef<HTMLButtonElement>(null);
  const popoverId = useId();

  useEffect(() => {
    if (!open) return;
    const focusFrame = requestAnimationFrame(() => selectedThemeRef.current?.focus());
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} style={styles.container}>
      <button
        ref={triggerRef}
        className="theme-trigger"
        style={styles.trigger}
        onClick={() => setOpen(!open)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        aria-label={`Cambiar tema (actual: ${currentTheme.name})`}
        title={`Tema: ${currentTheme.name}`}
      >
        <svg
          className="theme-trigger-icon"
          aria-hidden="true"
          style={styles.triggerIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9z" />
        </svg>
        <span className="theme-trigger-label" style={styles.triggerLabel}>{currentTheme.name}</span>
        <span aria-hidden="true" style={{ ...styles.triggerSwatch, background: currentTheme.gradient }} />
      </button>
      {open && (
        <div id={popoverId} className="theme-picker-popover" style={styles.popover} role="group" aria-label="Seleccionar tema">
          <div style={styles.popoverHeader}>Tema · {currentTheme.name}</div>
          {themes.map((t) => (
            <button
              key={t.id}
              ref={t.id === currentTheme.id ? selectedThemeRef : undefined}
              className="theme-swatch"
              style={{
                ...styles.swatch,
                ...(t.id === currentTheme.id ? styles.swatchActive : {}),
              }}
              onClick={() => {
                setTheme(t.id);
                setOpen(false);
                requestAnimationFrame(() => triggerRef.current?.focus());
              }}
              title={t.name}
              aria-pressed={t.id === currentTheme.id}
            >
              <span aria-hidden="true" style={{ ...styles.swatchColor, background: t.gradient }} />
              <span style={styles.swatchName}>{t.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
