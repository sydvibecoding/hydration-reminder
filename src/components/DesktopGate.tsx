import type { Messages } from '../i18n';

/**
 * Small-viewport gate. Rendered always, but CSS shows it only below the
 * desktop breakpoint (see index.css `.desktop-gate` / `.app-shell`). The app
 * targets desktop, so on phones we hide the UI and explain where to open it.
 */
export function DesktopGate({ t }: { t: Messages }) {
  return (
    <div className="desktop-gate" role="status" aria-live="polite">
      <div className="desktop-gate__card">
        <md-icon aria-hidden="true" className="desktop-gate__icon">
          computer
        </md-icon>
        <p className="desktop-gate__eyebrow">{t.desktopOnlyEyebrow}</p>
        <h1 className="desktop-gate__title">{t.desktopOnlyTitle}</h1>
        <p className="desktop-gate__body">{t.desktopOnlyBody}</p>
      </div>
    </div>
  );
}
