import { useEffect, useRef } from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

/**
 * Thin React wrapper over <md-switch>. Keeps the original component API so
 * SettingsScreen call sites don't change. React 18 + Lit interop: we set
 * `selected` imperatively (the Lit reflection needs the property, not the
 * attribute) and listen to the switch's `input` event.
 */
export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  id,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
}: ToggleSwitchProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current as (HTMLElement & { selected?: boolean; ariaLabel?: string }) | null;
    if (!el) return;
    if (el.selected !== checked) el.selected = checked;
    // Material Web exposes ARIA reflection as element properties. React's
    // attribute assignment alone does not reliably reach ElementInternals,
    // which otherwise leaves the rendered switch unnamed in the AX tree.
    const referencedLabel = ariaLabelledBy
      ? document.getElementById(ariaLabelledBy)?.textContent?.trim()
      : undefined;
    el.ariaLabel = ariaLabel ?? referencedLabel ?? '';
  }, [checked, ariaLabel, ariaLabelledBy, ariaDescribedBy]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = (e: Event) => {
      const target = e.target as HTMLElement & { selected?: boolean };
      onChange(!!target.selected);
    };
    el.addEventListener('input', handle);
    return () => el.removeEventListener('input', handle);
  }, [onChange]);

  return (
    <md-switch
      ref={ref}
      id={id}
      disabled={disabled || undefined}
      aria-label={ariaLabelledBy ? undefined : ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
    />
  );
}
