import { CSSProperties } from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Optional id — set when the switch is externally labelled via <label htmlFor>. */
  id?: string;
  /** Screen-reader label. Prefer aria-labelledby when a visible label exists. */
  ariaLabel?: string;
  /** IDs of elements that visually label the switch (e.g. the row title). */
  ariaLabelledBy?: string;
  /** IDs of elements that describe the switch's current state or hint. */
  ariaDescribedBy?: string;
}

const styles: Record<string, CSSProperties> = {
  container: {
    position: 'relative',
    width: '51px',
    height: '44px',
    flexShrink: 0,
  },
  input: {
    opacity: 0,
    width: '100%',
    height: '100%',
    position: 'absolute',
    inset: 0,
    zIndex: 2,
    cursor: 'pointer',
    margin: 0,
  },
  slider: {
    position: 'absolute',
    cursor: 'pointer',
    top: '6.5px',
    left: 0,
    right: 0,
    height: '31px',
    backgroundColor: 'var(--color-toggle-bg)',
    transition: 'background-color 250ms var(--ease-out)',
    borderRadius: '15.5px',
  },
  sliderChecked: {
    backgroundColor: 'var(--color-accent)',
  },
  sliderDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  knob: {
    position: 'absolute',
    height: '27px',
    width: '27px',
    left: '2px',
    top: '2px',
    backgroundColor: '#FFFFFF',
    transition: 'transform 250ms var(--ease-out)',
    borderRadius: '50%',
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15), 0 1px 1px rgba(0, 0, 0, 0.16), 0 3px 1px rgba(0, 0, 0, 0.1)',
  },
  knobChecked: {
    transform: 'translateX(20px)',
  },
};

export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  id,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
}: ToggleSwitchProps) {
  return (
    <label style={styles.container}>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        id={id}
        aria-label={ariaLabelledBy ? undefined : ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        className="toggle-input"
        style={styles.input}
      />
      <span
        className="toggle-slider"
        style={{
          ...styles.slider,
          ...(checked ? styles.sliderChecked : {}),
          ...(disabled ? styles.sliderDisabled : {}),
        }}
      >
        <span
          style={{
            ...styles.knob,
            ...(checked ? styles.knobChecked : {}),
          }}
        />
      </span>
    </label>
  );
}
