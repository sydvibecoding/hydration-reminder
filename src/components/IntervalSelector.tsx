import { useEffect, useRef } from 'react';
import { IntervalMinutes, INTERVAL_OPTIONS } from '../types/settings';
import type { Messages } from '../i18n';

interface IntervalSelectorProps {
  value: IntervalMinutes;
  onChange: (value: IntervalMinutes) => void;
  t: Messages;
}

function formatInterval(minutes: IntervalMinutes, t: Messages): string {
  if (minutes < 60) return t.intervalMinutes(minutes);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) return t.intervalHours(hours);
  return t.intervalHoursMinutes(hours, rest);
}

/**
 * M3 segmented button set. Single-select — mirrors radio semantics via
 * `role="radiogroup"` on the set. The Lit component fires `segmented-button-set-selection`
 * on any change; we read the `selected` property of each child to derive the
 * new value.
 */
export function IntervalSelector({ value, onChange, t }: IntervalSelectorProps) {
  const setRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const set = setRef.current;
    if (!set) return;
    const handle = () => {
      const buttons = Array.from(set.querySelectorAll('md-outlined-segmented-button')) as (HTMLElement & { selected?: boolean })[];
      const idx = buttons.findIndex((b) => b.selected);
      if (idx >= 0) {
        const picked = INTERVAL_OPTIONS[idx];
        if (picked !== value) onChange(picked);
      }
    };
    set.addEventListener('segmented-button-set-selection', handle);
    return () => set.removeEventListener('segmented-button-set-selection', handle);
  }, [value, onChange]);

  return (
    <md-outlined-segmented-button-set
      ref={setRef}
      role="radiogroup"
      aria-label={t.frequencyLabel}
      style={{ width: '100%' }}
    >
      {INTERVAL_OPTIONS.map((option) => (
        <md-outlined-segmented-button
          key={option}
          label={formatInterval(option, t)}
          selected={value === option || undefined}
          style={{ flex: 1 }}
        />
      ))}
    </md-outlined-segmented-button-set>
  );
}
