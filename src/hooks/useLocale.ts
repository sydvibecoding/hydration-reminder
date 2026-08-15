import { useCallback, useEffect, useState } from 'react';
import { CATALOGUES, LOCALES, STORAGE_KEY, readStoredLocale } from '../i18n';
import type { LocaleId, Messages } from '../i18n';

export interface LocaleState {
  locale: LocaleId;
  locales: LocaleId[];
  t: Messages;
  setLocale: (id: LocaleId) => void;
}

export function useLocale(): LocaleState {
  const [locale, setLocaleId] = useState<LocaleId>(readStoredLocale);
  const t = CATALOGUES[locale];

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // Storage can be unavailable in privacy modes; the in-memory choice still works.
    }
    // Keep the document in sync so assistive tech announces the right language
    // and the browser picks matching hyphenation and quotes.
    document.documentElement.lang = locale;
    document.title = t.appTitle;
  }, [locale, t.appTitle]);

  const setLocale = useCallback((id: LocaleId) => setLocaleId(id), []);

  return { locale, locales: LOCALES, t, setLocale };
}
