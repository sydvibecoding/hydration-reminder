import { useEffect, useId, useLayoutEffect, useRef, useState, CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { formatClockString, parseClock, toClockString, usesTwelveHourClock } from '../i18n';
import type { Messages } from '../i18n';

interface Props {
  value: string; // stored format, always 24-hour "HH:MM"
  onChange: (value: string) => void;
  minuteStep?: number;
  ariaLabel: string;
  t: Messages;
}

// Time picker: every hour and minute exposed as a grid, no typing, no modal.
//
// M3 specifies dial and input variants, both modal dialogs. Neither is used
// here — picking from a visible grid takes one tap, where the spec variants
// take a dialog plus a confirm. What is borrowed from M3 is the styling: cells
// are list-item shaped with a state layer, the selected cell uses the
// primary-container role pair, and the surface is surface-container-high at
// extra-large corner radius.
//
// On 12-hour locales the grid shows 1-12 with an AM/PM toggle; on 24-hour
// locales it shows 00-23. Stored values stay 24-hour either way.

const styles: Record<string, CSSProperties> = {
  container: { position: 'relative', display: 'inline-block' },
  trigger: {
    backgroundColor: 'var(--md-sys-color-secondary-container)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: '6px 12px',
    fontSize: 'var(--font-size-body)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--md-sys-color-on-secondary-container)',
    cursor: 'pointer',
    letterSpacing: '-0.4px',
    fontFamily: 'inherit',
    fontVariantNumeric: 'tabular-nums',
    minWidth: '84px',
    textAlign: 'center',
  },
  // Rendered through a portal on document.body with position: fixed. Inside the
  // settings card an ancestor contains it, so the dropdown grew the card and
  // produced a scrollbar instead of floating above it.
  popover: {
    position: 'fixed',
    padding: '16px',
    backgroundColor: 'var(--md-sys-color-surface-container-high)',
    borderRadius: 'var(--md-sys-shape-corner-extra-large)',
    boxShadow: '0 4px 8px 3px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.30)',
    display: 'flex',
    gap: '12px',
    zIndex: 1000,
  },
  column: { display: 'flex', flexDirection: 'column' },
  columnLabel: {
    fontSize: 'var(--font-size-footnote)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--md-sys-color-on-surface-variant)',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '8px',
    paddingLeft: '2px',
  },
  // 6 columns keeps 24 hours to 4 rows. At 4 columns it needed 6 rows, which
  // made the dropdown taller than the settings card it opens inside.
  hourGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 40px)', gap: '4px' },
  hourGrid12: { display: 'grid', gridTemplateColumns: 'repeat(6, 40px)', gap: '4px' },
  minuteGrid: { display: 'grid', gridTemplateColumns: '44px', gap: '4px' },
  divider: {
    width: '1px',
    backgroundColor: 'var(--md-sys-color-outline-variant)',
    margin: '24px 0 4px',
  },
  periodColumn: { display: 'flex', flexDirection: 'column', gap: '4px' },
};

// M3 list-item idiom at cell scale: full corner, label-large, state layer and
// selected colours supplied by the .time-cell rules in index.css.
const CELL: CSSProperties = {
  minHeight: '36px',
  padding: '4px 6px',
  fontSize: 'var(--font-size-subhead)',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--md-sys-color-on-surface)',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: 'var(--md-sys-shape-corner-full)',
  cursor: 'pointer',
  textAlign: 'center',
  fontVariantNumeric: 'tabular-nums',
  letterSpacing: '0.1px',
  fontFamily: 'inherit',
};

const CELL_ACTIVE: CSSProperties = {
  backgroundColor: 'var(--selected-option-bg)',
  color: 'var(--selected-option-fg)',
  fontWeight: 'var(--font-weight-semibold)',
};

export function TimePicker({ value, onChange, minuteStep = 15, ariaLabel, t }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedHourRef = useRef<HTMLButtonElement>(null);
  const popoverId = useId();

  const twelveHour = usesTwelveHourClock(t.localeTag);
  const display = formatClockString(value, t.localeTag);

  const { hour, minute } = parseClock(value);

  const minutes = Array.from({ length: Math.floor(60 / minuteStep) }, (_, i) => i * minuteStep);
  // Snap to the nearest offered minute so the grid always shows one cell as
  // selected, even if the stored value came from a different step.
  const snappedMinute = minutes.includes(minute)
    ? minute
    : minutes.reduce((closest, current) =>
        Math.abs(current - minute) < Math.abs(closest - minute) ? current : closest,
      minutes[0]);

  const isPm = hour >= 12;
  const hours = twelveHour
    ? Array.from({ length: 12 }, (_, i) => i + 1)      // 1..12
    : Array.from({ length: 24 }, (_, i) => i);          // 0..23
  const shownHour = twelveHour ? hour % 12 || 12 : hour;

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  // Compose a 24-hour stored value from whichever grid is on screen.
  const commit = (nextHour: number, nextMinute: number, nextIsPm: boolean) => {
    const hour24 = twelveHour ? (nextHour % 12) + (nextIsPm ? 12 : 0) : nextHour;
    onChange(toClockString(hour24, nextMinute));
  };

  // A fixed-position portal does not follow its trigger, so recompute on open,
  // scroll and resize. Right-aligned to the trigger, flipped above when there
  // is not enough room below, and clamped to the viewport.
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const trigger = triggerRef.current?.getBoundingClientRect();
      const el = popoverRef.current;
      if (!trigger || !el) return;
      const { offsetWidth: w, offsetHeight: h } = el;
      const below = trigger.bottom + 8;
      const above = trigger.top - h - 8;
      const top = below + h <= window.innerHeight - 8 || above < 8 ? below : above;
      const left = Math.min(
        Math.max(8, trigger.right - w),
        window.innerWidth - w - 8
      );
      setPos({ top, left });
    };
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // Land focus on the selected hour rather than stranding it on the trigger
    // outside the dialog (WAI-ARIA APG dialog pattern).
    const focusFrame = requestAnimationFrame(() => selectedHourRef.current?.focus());
    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // The popover is portalled out of containerRef, so both subtrees count
      // as "inside".
      if (containerRef.current?.contains(target) || popoverRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
        return;
      }
      if (event.key === 'Tab' && popoverRef.current) {
        const buttons = [...popoverRef.current.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
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

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div ref={containerRef} style={styles.container}>
      <button
        ref={triggerRef}
        className="time-trigger"
        style={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-label={`${ariaLabel}: ${display}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
      >
        {display}
      </button>

      {open && createPortal(
        <div
          ref={popoverRef}
          id={popoverId}
          className="time-picker-popover"
          style={{
            ...styles.popover,
            top: pos?.top ?? -9999,
            left: pos?.left ?? -9999,
            visibility: pos ? 'visible' : 'hidden',
          }}
          role="dialog"
          aria-label={ariaLabel}
        >
          <div style={styles.column}>
            <div style={styles.columnLabel}>{t.hourAbbr}</div>
            <div
              style={twelveHour ? styles.hourGrid12 : styles.hourGrid}
              role="group"
              aria-label={t.hour}
            >
              {hours.map((h) => {
                const active = h === shownHour;
                return (
                  <button
                    key={h}
                    ref={active ? selectedHourRef : undefined}
                    className="time-cell"
                    style={{ ...CELL, ...(active ? CELL_ACTIVE : {}) }}
                    onClick={() => commit(h, snappedMinute, isPm)}
                    aria-pressed={active}
                  >
                    {twelveHour ? h : pad(h)}
                  </button>
                );
              })}
            </div>
          </div>

          <div aria-hidden="true" style={styles.divider} />

          <div style={styles.column}>
            <div style={styles.columnLabel}>{t.minuteAbbr}</div>
            <div style={styles.minuteGrid} role="group" aria-label={t.minute}>
              {minutes.map((m) => {
                const active = m === snappedMinute;
                return (
                  <button
                    key={m}
                    className="time-cell"
                    style={{ ...CELL, ...(active ? CELL_ACTIVE : {}) }}
                    onClick={() => {
                      commit(shownHour, m, isPm);
                      close();
                    }}
                    aria-pressed={active}
                  >
                    {pad(m)}
                  </button>
                );
              })}
            </div>
          </div>

          {twelveHour && (
            <>
              <div aria-hidden="true" style={styles.divider} />
              <div style={styles.column}>
                <div style={styles.columnLabel}>{`${t.am}/${t.pm}`}</div>
                <div style={styles.periodColumn} role="group" aria-label={`${t.am} / ${t.pm}`}>
                  {[false, true].map((pm) => (
                    <button
                      key={String(pm)}
                      className="time-cell"
                      style={{ ...CELL, minWidth: '48px', ...(isPm === pm ? CELL_ACTIVE : {}) }}
                      onClick={() => commit(shownHour, snappedMinute, pm)}
                      aria-pressed={isPm === pm}
                    >
                      {pm ? t.pm : t.am}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
