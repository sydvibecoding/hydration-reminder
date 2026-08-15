# Hydration reminders

A water reminder that runs entirely in the browser. No backend, no analytics,
no third-party cookies. Settings stay in local storage on the device.

Live at [sydvibecoding.github.io/hydration-reminder](https://sydvibecoding.github.io/hydration-reminder/)
(Spanish) and [/en/](https://sydvibecoding.github.io/hydration-reminder/en/) (English).

## What it does

- Sends a notification every 30, 45, 60, 90 or 120 minutes, within the hours you set.
- Uses a separate schedule at the weekend, if you turn that on.
- Pauses for 30 minutes, 1 hour, 2 hours, or until tomorrow.
- Ships 16 colour themes, with light, dark and system modes.
- Runs in Spanish and English. The picker overrides the browser language.
- Installs as a PWA on Android, Windows and macOS. iOS support is partial.

## Stack

- React 18 + TypeScript
- Vite 5
- [Material Web](https://github.com/material-components/material-web) 2.5 for M3 components
- Own service worker (`public/sw.js`). It routes notification clicks only, and
  does not cache the app shell.
- Fully client-side. The app makes no outbound network requests.

## Development

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # tsc + vite build + SEO generation → dist/
npm run preview   # serves dist/ on http://localhost:4173
```

Notifications and the service worker need `https://` or `http://localhost`.
Neither works from `file://`.

## Internationalisation

Message catalogues live in `src/i18n/`. Each locale is a `Messages` object,
and `Messages` is an interface, so a key added to one language and missed in
the other fails typecheck.

Parameterised entries are functions rather than template strings. Spanish needs
gender agreement — `Desactivados` for *recordatorios*, `Bloqueadas` for
*notificaciones* — and each language picks plural forms its own way. A flat
key-value catalogue would force Spanish grammar onto every other locale.

Clocks and durations render through `Intl`. Storage keeps 24-hour `"HH:MM"`
strings, and only the render boundary is localised, so switching language never
rewrites saved settings.

To add a language: create the catalogue, add its id to `LOCALES`, and rebuild.
The build generates its page, manifest and sitemap entry.

## SEO and answer engines

The app renders on the client, so the served body is `<div id="root"></div>`.
Google executes JavaScript and reaches the content. The crawlers behind answer
engines — GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot — generally do not.

`scripts/generate-seo.mjs` runs after `vite build` and writes:

- One entry point per language: `/` for Spanish, `/en/` for English. Each carries
  its own title, description, canonical, Open Graph, manifest, and reciprocal
  `hreflang` plus `x-default`.
- The intro and FAQ as initial markup inside `#root`. React discards it on mount
  and renders the same copy from the same catalogue, so crawlers and visitors
  without JavaScript read what everyone else sees.
- `FAQPage` and `WebApplication` JSON-LD, per language.
- `robots.txt`, naming answer-engine crawlers explicitly.
- `sitemap.xml`, with both URLs and their alternates.

The script reads `src/i18n` through esbuild instead of duplicating copy, so the
translations have one home.

## Structure

```
src/
  components/   SettingsScreen, ThemePicker, LanguagePicker, TimePicker,
                IntervalSelector, ToggleSwitch
  hooks/        useSettings, useNotifications, useTheme, useDarkMode, useLocale
  i18n/         message catalogues, locale detection, Intl formatters
  services/     notification scheduling
  data/         notification copy, sourced from the catalogues
  types/        shared types (Settings, Material Web JSX intrinsics)
scripts/
  generate-seo.mjs   post-build page, sitemap and robots generation
public/
  sw.js         service worker
  og-card*.svg  social cards, one per language, with text baked in
  icon.svg      maskable icon
```

The social card PNGs are rasterised by hand and committed. Editing an
`og-card*.svg` does not regenerate its PNG.

## Privacy

- No HTTP cookies.
- Three local storage keys: `hydration-reminder-settings`,
  `hydration-reminder-theme` and `hydration-reminder-locale`. The user sets all
  three inside the app.
- No analytics, no pixels, no third-party SDKs.
- No data leaves the device.

That is why the app carries no cookie banner. [`DEPLOY.md`](DEPLOY.md) §1 sets
out the legal reasoning in full, under Spanish LSSI-CE art. 22.2, the GDPR and
the AEPD 2023 cookie guidance.

## Deploying

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and
publishes to GitHub Pages. [`DEPLOY.md`](DEPLOY.md) covers the pre-flight
checklist and other hosting options.
