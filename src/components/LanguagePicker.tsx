import { useEffect, useId, useRef, useState } from 'react';
import { CATALOGUES } from '../i18n';
import type { LocaleId, Messages } from '../i18n';

interface Props {
  locale: LocaleId;
  locales: LocaleId[];
  onChange: (locale: LocaleId) => void;
  t: Messages;
}

export function LanguagePicker({ locale, locales, onChange, t }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const popoverId = useId();
  const languageName = CATALOGUES[locale].languageName;

  useEffect(() => {
    if (!open) return;
    const focusFrame = requestAnimationFrame(() => selectedRef.current?.focus());
    const onClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
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

  return (
    <div ref={containerRef} className="language-picker-root">
      <button
        ref={triggerRef}
        type="button"
        className="language-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-label={`${t.languagePickerLabel}: ${languageName}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        title={`${t.languagePickerLabel}: ${languageName}`}
      >
        <md-icon aria-hidden="true">language</md-icon>
      </button>
      {open && (
        <div
          ref={popoverRef}
          id={popoverId}
          className="language-picker-popover"
          role="dialog"
          aria-label={t.languagePickerDialog}
        >
          {locales.map((id) => (
            <button
              key={id}
              ref={id === locale ? selectedRef : undefined}
              type="button"
              className="language-option"
              aria-pressed={id === locale}
              onClick={() => {
                onChange(id);
                setOpen(false);
                requestAnimationFrame(() => triggerRef.current?.focus());
              }}
            >
              <span>{CATALOGUES[id].languageName}</span>
              {id === locale && <md-icon aria-hidden="true">check</md-icon>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
