import { CSSProperties } from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Screen-reader label — the visual label lives in the row, not the control. */
  ariaLabel?: string;
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
    transition: 'background-color 0.25s ease-out',
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
    transition: 'transform 0.25s ease-out',
    borderRadius: '50%',
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15), 0 1px 1px rgba(0, 0, 0, 0.16), 0 3px 1px rgba(0, 0, 0, 0.1)',
  },
  knobChecked: {
    transform: 'translateX(20px)',
  },
};

export function ToggleSwitch({ checked, onChange, disabled = false, ariaLabel }: ToggleSwitchProps) {
  return (
    <label style={styles.container}>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        aria-label={ariaLabel}
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
