import { useEffect, useRef, useState, CSSProperties } from 'react';
import { formatClockString, parseClock, toClockString, usesTwelveHourClock } from '../i18n';
import type { Messages } from '../i18n';

interface Props {
  value: string; // stored format, always 24-hour "HH:MM"
  onChange: (value: string) => void;
  minuteStep?: number;
  ariaLabel: string;
  t: Messages;
}

// Material 3 time picker, input (keyboard) variant.
//
// M3 specifies two time pickers: dial and input. @material/web ships neither,
// so this composes the input variant from the components it does ship —
// md-dialog for the container, focus trap and scrim, md-outlined-text-field for
// the hour and minute entries, md-outlined-segmented-button-set for AM/PM.
//
// The fields are uncontrolled: values are seeded imperatively when the dialog
// opens and read back on confirm. React state per keystroke would fight the
// web components' own value property.

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
  fieldRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: '12px',
    paddingTop: '8px',
  },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  fieldCaption: {
    fontSize: 'var(--font-size-caption1)',
    color: 'var(--md-sys-color-on-surface-variant)',
    paddingLeft: '2px',
  },
  separator: {
    fontSize: '38px',
    lineHeight: '68px',
    color: 'var(--md-sys-color-on-surface)',
    fontVariantNumeric: 'tabular-nums',
  },
  periodSet: { display: 'flex', flexDirection: 'column', paddingTop: '4px' },
};

// M3 input variant: 96x72 fields showing display-medium numerals.
const FIELD_STYLE: CSSProperties = {
  width: '96px',
  ['--md-outlined-text-field-container-shape' as string]: '8px',
  ['--md-outlined-text-field-input-text-size' as string]: '38px',
  ['--md-outlined-text-field-input-text-line-height' as string]: '44px',
};

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function TimePicker({ value, onChange, minuteStep = 1, ariaLabel, t }: Props) {
  const [open, setOpen] = useState(false);
  const [isPm, setIsPm] = useState(false);

  const dialogRef = useRef<HTMLElement>(null);
  const hourRef = useRef<HTMLElement>(null);
  const minuteRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const twelveHour = usesTwelveHourClock(t.localeTag);
  const display = formatClockString(value, t.localeTag);

  // Seed the fields from the stored value each time the dialog opens, so a
  // cancelled edit leaves no residue behind.
  useEffect(() => {
    if (!open) return;
    const { hour, minute } = parseClock(value);
    const shownHour = twelveHour ? hour % 12 || 12 : hour;
    setIsPm(hour >= 12);
    const frame = requestAnimationFrame(() => {
      const h = hourRef.current as (HTMLElement & { value: string }) | null;
      const m = minuteRef.current as (HTMLElement & { value: string }) | null;
      if (h) h.value = twelveHour ? String(shownHour) : String(shownHour).padStart(2, '0');
      if (m) m.value = String(minute).padStart(2, '0');
      (h as HTMLElement | null)?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open, value, twelveHour]);

  // md-dialog owns its own open state and animations; drive it imperatively and
  // mirror its `closed` event back into React so Escape and scrim clicks agree.
  useEffect(() => {
    const dialog = dialogRef.current as
      | (HTMLElement & { open: boolean })
      | null;
    if (!dialog) return;
    dialog.open = open;
    const onClosed = () => {
      setOpen(false);
      triggerRef.current?.focus();
    };
    dialog.addEventListener('closed', onClosed);
    return () => dialog.removeEventListener('closed', onClosed);
  }, [open]);

  const confirm = () => {
    const h = hourRef.current as (HTMLElement & { value: string }) | null;
    const m = minuteRef.current as (HTMLElement & { value: string }) | null;
    let hour = clamp(Number(h?.value), twelveHour ? 1 : 0, twelveHour ? 12 : 23);
    let minute = clamp(Number(m?.value), 0, 59);

    if (minuteStep > 1) {
      minute = Math.min(59, Math.round(minute / minuteStep) * minuteStep);
    }
    if (twelveHour) {
      hour = hour % 12 + (isPm ? 12 : 0);
    }
    onChange(toClockString(hour, minute));
    setOpen(false);
  };

  return (
    <div style={styles.container}>
      <button
        ref={triggerRef}
        className="time-trigger"
        style={styles.trigger}
        onClick={() => setOpen(true)}
        aria-label={`${ariaLabel}: ${display}`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {display}
      </button>

      <md-dialog ref={dialogRef} aria-label={ariaLabel}>
        <div slot="headline">{t.timePickerHeadline}</div>
        <form slot="content" method="dialog" onSubmit={(e) => e.preventDefault()}>
          <div style={styles.fieldRow}>
            <div style={styles.fieldGroup}>
              <md-outlined-text-field
                ref={hourRef}
                style={FIELD_STYLE}
                type="number"
                inputmode="numeric"
                min={twelveHour ? '1' : '0'}
                max={twelveHour ? '12' : '23'}
                aria-label={t.hour}
                no-spinner
              />
              <span style={styles.fieldCaption}>{t.hour}</span>
            </div>

            <span aria-hidden="true" style={styles.separator}>:</span>

            <div style={styles.fieldGroup}>
              <md-outlined-text-field
                ref={minuteRef}
                style={FIELD_STYLE}
                type="number"
                inputmode="numeric"
                min="0"
                max="59"
                aria-label={t.minute}
                no-spinner
              />
              <span style={styles.fieldCaption}>{t.minute}</span>
            </div>

            {twelveHour && (
              <div style={styles.periodSet}>
                <md-outlined-segmented-button-set aria-label={`${t.am} / ${t.pm}`}>
                  <md-outlined-segmented-button
                    label={t.am}
                    selected={!isPm}
                    onClick={() => setIsPm(false)}
                  />
                  <md-outlined-segmented-button
                    label={t.pm}
                    selected={isPm}
                    onClick={() => setIsPm(true)}
                  />
                </md-outlined-segmented-button-set>
              </div>
            )}
          </div>
        </form>
        <div slot="actions">
          <md-text-button onClick={() => setOpen(false)}>{t.cancel}</md-text-button>
          <md-text-button onClick={confirm}>{t.ok}</md-text-button>
        </div>
      </md-dialog>
    </div>
  );
}
