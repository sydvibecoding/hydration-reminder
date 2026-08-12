# Hidratación

Recordatorio de hidratación a tu ritmo. PWA cliente, sin backend, sin
analítica, sin cookies de terceros. Los ajustes se guardan solo en el
navegador.

## Qué hace

- Manda una notificación cada X minutos dentro del horario que elijas.
- Pausa temporal (30 min, 1 h, 2 h) o hasta el final del día.
- Onboarding para elegir intervalo, horario y activar notificaciones.
- Tema visual configurable, con soporte claro/oscuro/sistema.
- Instalable como PWA en Android, Windows, macOS y (con matices) iOS.

## Stack

- React 18 + TypeScript
- Vite 5
- Service Worker propio (`public/sw.js`) — solo enruta clicks en
  notificaciones, no cachea la app shell.
- 100 % cliente. Cero peticiones de red salientes.

## Desarrollo

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # tsc + vite build → dist/
npm run preview   # sirve dist/ en http://localhost:4173
```

Las notificaciones y el Service Worker requieren `https://` o
`http://localhost`. En `file://` no funcionan.

## Estructura

```
src/
  components/   # SettingsScreen, OnboardingScreen, controles UI
  hooks/        # useSettings, useNotifications, useTheme
  services/     # lógica de scheduling y notificaciones
  data/         # temas y presets
  types/        # tipos compartidos (Settings, Theme, …)
public/
  sw.js         # service worker
  manifest.json # PWA manifest
  icon.svg      # icono maskable
  favicon.svg
```

## Privacidad

- No hay cookies HTTP.
- LocalStorage: dos claves — `hydration-reminder-settings` y
  `hydration-reminder-theme`. Todo lo elige el usuario en la propia app.
- No hay analítica, ni píxeles, ni SDKs de terceros.
- No sale ningún dato del dispositivo.

Por eso no lleva banner de cookies. Detalle legal completo (LSSI-CE
art. 22.2, RGPD, guía AEPD 2023) en [`DEPLOY.md`](DEPLOY.md) §1.

## Desplegar

Ver [`DEPLOY.md`](DEPLOY.md) — cubre checklist previo, build, y cuatro
opciones de hosting (Cloudflare Pages, Vercel, Netlify, GitHub Pages).
