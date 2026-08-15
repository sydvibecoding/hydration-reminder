import { useState, useRef, useEffect, useId, CSSProperties } from 'react';
import { Theme } from '../hooks/useTheme';
import type { Messages } from '../i18n';

interface Props {
  themes: Theme[];
  currentTheme: Theme;
  setTheme: (id: string) => void;
  t: Messages;
}

// Theme ids are the stable key: they are what localStorage persists, so the
// display name can change with the language without orphaning a saved theme.
// A missing translation falls back to the name baked into the theme itself.
function themeName(theme: Theme, t: Messages): string {
  return t.themeNames[theme.id] ?? theme.name;
}

const styles: Record<string, CSSProperties> = {
  container: {
    position: 'relative',
    display: 'inline-block',
  },
  // Trigger — M3 assist chip idiom: shape-full, surface-container-low bg,
  // outline-variant border, label-large.
  trigger: {
    minHeight: '40px',
    borderRadius: 'var(--md-sys-shape-corner-full)',
    border: '1px solid var(--md-sys-color-outline-variant)',
    padding: '6px 12px 6px 14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'var(--md-sys-color-on-surface)',
    backgroundColor: 'var(--md-sys-color-surface-container-low)',
  },
  triggerSwatch: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  triggerLabel: {
    fontSize: 'var(--font-size-subhead)',
    fontWeight: 'var(--font-weight-medium)',
    letterSpacing: '0.1px',
    whiteSpace: 'nowrap',
  },
  triggerIcon: {
    width: '18px',
    height: '18px',
    color: 'var(--md-sys-color-on-surface-variant)',
    display: 'block',
    flexShrink: 0,
  },
  // Popover — M3 menu / bottom-sheet on desktop. surface-container-high,
  // extra-large corner, elevation level 3 shadow.
  popover: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '10px',
    padding: '16px',
    backgroundColor: 'var(--md-sys-color-surface-container-high)',
    borderRadius: 'var(--md-sys-shape-corner-extra-large)',
    boxShadow:
      '0 4px 8px 3px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.30)',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(148px, 1fr))',
    gap: '4px',
    width: 'min(340px, calc(100vw - 32px))',
    zIndex: 100,
  },
  // Item — behaves like a list-item: full radius, no border, hover uses
  // state-layer via CSS class, selected swaps to primary-container.
  swatch: {
    width: '100%',
    minHeight: '48px',
    borderRadius: 'var(--md-sys-shape-corner-full)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 14px 8px 8px',
    color: 'var(--md-sys-color-on-surface)',
    backgroundColor: 'transparent',
    textAlign: 'left',
  },
  swatchActive: {
    backgroundColor: 'var(--selected-option-bg)',
    color: 'var(--selected-option-fg)',
  },
  swatchColor: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  swatchName: {
    fontSize: 'var(--font-size-subhead)',
    fontWeight: 'var(--font-weight-medium)',
    letterSpacing: '0.1px',
    lineHeight: 1.25,
  },
  popoverHeader: {
    gridColumn: '1 / -1',
    color: 'var(--md-sys-color-on-surface-variant)',
    fontSize: 'var(--font-size-footnote)',
    fontWeight: 'var(--font-weight-medium)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
    lineHeight: 1.3,
    padding: '4px 8px 8px',
  },
};

export function ThemePicker({ themes, currentTheme, setTheme, t }: Props) {
  const currentName = themeName(currentTheme, t);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
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
        return;
      }
      if (e.key === 'Tab' && popoverRef.current) {
        const buttons = [...popoverRef.current.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
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
        aria-label={t.themeChange(currentName)}
        title={t.themeCurrent(currentName)}
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
        <span className="theme-trigger-label" style={styles.triggerLabel}>{currentName}</span>
        <span aria-hidden="true" style={{ ...styles.triggerSwatch, background: currentTheme.gradient }} />
      </button>
      {open && (
        <div ref={popoverRef} id={popoverId} className="theme-picker-popover" style={styles.popover} role="dialog" aria-label={t.themeSelect}>
          <div style={styles.popoverHeader}>{t.themeHeader(currentName)}</div>
          {themes.map((theme) => {
            const name = themeName(theme, t);
            return (
              <button
                key={theme.id}
                ref={theme.id === currentTheme.id ? selectedThemeRef : undefined}
                className="theme-swatch"
                style={{
                  ...styles.swatch,
                  ...(theme.id === currentTheme.id ? styles.swatchActive : {}),
                }}
                onClick={() => {
                  setTheme(theme.id);
                  setOpen(false);
                  requestAnimationFrame(() => triggerRef.current?.focus());
                }}
                title={name}
                aria-pressed={theme.id === currentTheme.id}
              >
                <span aria-hidden="true" style={{ ...styles.swatchColor, background: theme.gradient }} />
                <span style={styles.swatchName}>{name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
