# Deploy — Hidratación

Guía práctica para publicar esta app. Está pensada para leerse antes de tocar
nada en el hosting: primero se aclara lo de las cookies (spoiler: no hacen
falta banners), luego cómo construir y desplegar.

---

## 1. Cookies, LocalStorage y RGPD — ¿banner de consentimiento?

**Conclusión: NO se necesita banner de cookies.**

### Lo que la app hace hoy

- **Cookies HTTP**: cero. Ninguna llamada a `document.cookie` en el código.
- **LocalStorage**: dos claves y solo dos:
  - `hydration-reminder-settings` — tus ajustes (intervalo, horario, sonido,
    pausa, flag de onboarding completo).
  - `hydration-reminder-theme` — el tema visual elegido.
- **SessionStorage / IndexedDB**: nada.
- **Analítica / píxeles / SDKs de terceros**: nada.
- **Peticiones de red salientes**: ninguna. La app es 100 % cliente.
- **Notificaciones**: usan la API del navegador (`Notification` +
  `serviceWorker.showNotification`). Requieren permiso explícito del usuario
  a través del propio navegador — ese consentimiento no lo gestionamos
  nosotros, lo pide Chrome/Firefox/Safari con su UI nativa.

### Por qué no hace falta banner

El marco aplicable en España es **la Directiva ePrivacy (2002/58/CE)**
transpuesta en el **artículo 22.2 de la LSSI-CE (Ley 34/2002)** más el **RGPD
(UE 2016/679)** y la **LOPDGDD (Ley Orgánica 3/2018)**.

- El artículo 22.2 de la LSSI-CE obliga a pedir consentimiento antes de
  **almacenar o acceder a información** en el equipo del usuario, **excepto**
  cuando sea "estrictamente necesaria para la prestación de un servicio
  expresamente solicitado por el usuario".
- La [Guía sobre el uso de cookies de la AEPD (edición 2023)](https://www.aepd.es/documento/guia-cookies.pdf)
  desarrolla esa excepción y la ejemplifica en su §3.1 con casos como
  "cookies de personalización de interfaz" cuando el usuario decide
  **activamente** el ajuste (idioma, tema, etc.). Ese es exactamente nuestro
  caso: el intervalo, el horario, el tema y el flag de onboarding son
  preferencias que el usuario introduce él mismo en la propia app.
- El comité europeo EDPB confirma el mismo criterio en sus [Guidelines
  02/2023 sobre el artículo 5(3) de la Directiva ePrivacy](https://www.edpb.europa.eu/system/files/2023-11/edpb_guidelines_202302_technical_scope_art_53_eprivacydirective_en.pdf):
  el almacenamiento estrictamente necesario para prestar el servicio pedido
  por el usuario está exento de consentimiento.
- Y como no se recogen datos personales identificativos ni se transmiten
  fuera del dispositivo, tampoco aplica la base jurídica del RGPD para
  tratamiento (art. 6): no hay tratamiento que legitimar porque no hay dato
  saliendo del navegador.

### Qué sí conviene tener (aunque no sea legalmente obligatorio)

- **Aviso legal / política de privacidad breve** enlazada desde la propia
  app: una línea explicando que los ajustes se guardan **solo en tu
  navegador**, que no hay analítica, y que puedes borrarlos vaciando los
  datos del sitio. Genera confianza y cierra el tema por si algún día
  alguien pregunta.
- **Si en el futuro se añade** cualquiera de estas cosas → **entonces sí**
  tocará banner: Google Analytics, Plausible/Umami autoalojado o no,
  Sentry, Meta Pixel, un CDN de terceros con cookies, embeds de YouTube,
  fuentes de Google Fonts servidas desde `fonts.googleapis.com` (fuga de
  IP a Google), o cualquier login/back-end.

---

## 2. Antes de desplegar — checklist

- [ ] **Descripción de la app**: revisar que "Recordatorio de hidratación a
      tu ritmo" (en `index.html` y `public/manifest.json`) es la copy final.
      Se usa para la meta description, la ficha PWA y las previews de
      Twitter/OG.
- [ ] **Preview social**: hoy `og:image` apunta a `/icon.svg`. Twitter,
      Facebook, LinkedIn y WhatsApp **no renderizan SVG** en las previews.
      Si te importa cómo se ve al compartir el enlace, exporta `icon.svg` a
      PNG **1200×630** (o cuadrado 1200×1200), guárdalo en
      `public/og-image.png`, y sustituye las cuatro etiquetas `og:image` /
      `twitter:image` en `index.html`. Si no compartes el enlace en redes,
      da igual.
- [ ] **Icono maskable**: `icon.svg` ya deja margen de seguridad (~64 %
      central) para que los launchers de Android/Windows lo recorten en
      círculo sin comerse la gota. Suficiente para lanzar. Si más adelante
      quieres máxima nitidez en pantallas de alta densidad, genera PNGs a
      192×192 y 512×512 y añádelos al `manifest.json`.
- [ ] **Base path**: si vas a servir desde subdirectorio (típico en GitHub
      Pages, `https://usuario.github.io/hydration-reminder/`), añade
      `base: '/hydration-reminder/'` en `vite.config.ts` **antes** de
      construir. Para dominio raíz (Cloudflare Pages, Vercel, Netlify o
      dominio propio) no hace falta tocar nada.
- [ ] **HTTPS**: obligatorio. El Service Worker y la API de Notificaciones
      solo funcionan en `https://` (o `http://localhost` en desarrollo).
      Los tres hostings recomendados abajo dan HTTPS gratis y automático.

---

## 3. Cómo construir

```bash
npm install     # solo la primera vez
npm run build
```

Sale una carpeta `dist/` con todo el sitio estático listo para subir. Peso
actual: ~180 kB de JS (~55 kB gzip), 3 kB de CSS. Se sirve desde cualquier
CDN sin backend.

Para probarlo local antes de desplegar:

```bash
npm run preview
```

Abre `http://localhost:4173`.

---

## 4. Dónde desplegar — tres opciones

Las tres son gratis para este uso, dan HTTPS automático, permiten dominio
propio y soportan el Service Worker sin configuración especial. Elige por
comodidad, no por capacidad.

### Opción A — Cloudflare Pages *(recomendada)*

**A favor**: la CDN más rápida de las tres, ancho de banda ilimitado en el
plan free, sin caducidad de proyectos inactivos, integración limpia con
dominios de Cloudflare Registrar.
**En contra**: la UI es más técnica que las otras dos.

Pasos:
1. `dash.cloudflare.com` → **Workers & Pages** → **Create → Pages**.
2. "Direct Upload" o conectar Git. Con Direct Upload subes la carpeta
   `dist/` y listo.
3. Framework preset: **None**. Build command: `npm run build`. Output:
   `dist`.
4. En **Custom domains** añades tu dominio si tienes uno.

### Opción B — Vercel

**A favor**: la más fácil de configurar, buen dashboard, deploys por PR.
**En contra**: el plan free tiene límite de build hours (irrelevante para
este tamaño de proyecto), y el nombre "vercel.app" aparece en la URL por
defecto.

Pasos:
1. `vercel.com` → **New Project** → conectar repo de GitHub.
2. Detecta Vite automáticamente. **Import**, sin tocar nada.
3. Cada push a `main` redeploya. También hay CLI (`npx vercel`) para subir
   sin Git.

### Opción C — Netlify

**A favor**: interfaz clarísima, drag-and-drop de la carpeta `dist/` en la
web y ya está desplegado en 30 segundos.
**En contra**: ancho de banda limitado a 100 GB/mes en free (más que
suficiente aquí).

Pasos:
1. `app.netlify.com` → **Add new site → Deploy manually**.
2. Arrastras la carpeta `dist/` a la zona de drop. Fin.
3. Para redeploys automáticos: conectar el repo desde **Site settings →
   Build & deploy**.

### Opción D — GitHub Pages (solo si ya usas GitHub)

**A favor**: gratis, integrado con tu repo, sin cuenta nueva.
**En contra**: el sitio vive en subdirectorio (`/hydration-reminder/`), así
que **hay que ajustar `vite.config.ts`** (ver checklist). Menos rápido que
Cloudflare.

Pasos:
1. Añade a `vite.config.ts`:
   ```ts
   export default defineConfig({
     plugins: [react()],
     base: '/hydration-reminder/',
     server: { port: 3000 },
   })
   ```
2. `npm run build`.
3. Sube `dist/` a la rama `gh-pages` (o usa una acción de GitHub Actions).
4. En **Settings → Pages** del repo elige la rama `gh-pages`.

---

## 5. Después de desplegar — comprobar

Abre la URL en el móvil y en desktop:

1. **HTTPS activo** (candado en la barra de direcciones).
2. **Se puede instalar como PWA**: en Chrome desktop debería aparecer un
   icono "+" en la barra de direcciones. En Android sale "Añadir a pantalla
   de inicio".
3. **Notificaciones**: da permiso al pulsar "Activar notificaciones" en el
   onboarding, luego pulsa "Enviar prueba" en la cabecera. Debería aparecer
   la notificación nativa del sistema.
4. **Ajustes persisten**: cambia el tema, recarga, sigue el mismo tema.
5. **Preview social**: pega la URL en [opengraph.xyz](https://www.opengraph.xyz/)
   para ver cómo la mostrarían Twitter/Facebook. Si el icono no aparece,
   revisa el checklist (SVG no siempre se renderiza).

---

## 6. Notas técnicas para quien mantenga esto luego

- El Service Worker (`public/sw.js`) **no cachea la app shell** por
  decisión. Solo enruta clicks en notificaciones. Si en el futuro se quiere
  soporte offline, hay que añadir una estrategia stale-while-revalidate y
  subir `SW_VERSION`.
- El manifest declara el icono como `svg+xml`. Chrome y Edge lo aceptan.
  Safari iOS sigue prefiriendo PNGs para el "Add to Home Screen" — para
  máxima calidad ahí, generar PNGs 192/512 y añadirlos al manifest.
- Las rutas de assets (SW, icono de notificación) se construyen con
  `import.meta.env.BASE_URL`, así que funcionan tanto en dominio raíz
  como en subdirectorio (`base` en `vite.config.ts`).
