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
    padding: '6px 10px 6px 7px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
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
    transition: 'transform 0.1s ease',
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
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        title={`Tema: ${currentTheme.name}`}
      >
        <span aria-hidden="true" style={{ ...styles.triggerSwatch, background: currentTheme.gradient }} />
        <span className="theme-trigger-label" style={styles.triggerLabel}>{currentTheme.name}</span>
      </button>
      {open && (
        <div id={popoverId} style={styles.popover} role="group" aria-label="Seleccionar tema">
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
              aria-label={t.name}
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
