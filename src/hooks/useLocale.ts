import { useCallback, useEffect, useState } from 'react';
import { CATALOGUES, LOCALES, STORAGE_KEY, pathForLocale, readStoredLocale } from '../i18n';
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
    document.title = t.seo.htmlTitle;

    // Keep the URL on the page that actually serves this language, so copying
    // the address bar shares the right one. replaceState rather than a
    // navigation: the switch is instant and there is no reason to reload.
    const target = pathForLocale(locale);
    if (location.pathname !== target) {
      history.replaceState(null, '', target + location.search + location.hash);
    }
  }, [locale, t.seo.htmlTitle]);

  const setLocale = useCallback((id: LocaleId) => setLocaleId(id), []);

  return { locale, locales: LOCALES, t, setLocale };
}
