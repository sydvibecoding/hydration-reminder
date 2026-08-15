// Emits one indexable HTML entry point per language, plus robots.txt and a
// sitemap, after `vite build`.
//
// Why this exists: the app is a client-rendered SPA on static hosting, so the
// served HTML body is just <div id="root"></div>. Google runs JavaScript and
// eventually sees the content, but the crawlers behind answer engines (GPTBot,
// ClaudeBot, PerplexityBot, OAI-SearchBot) generally do not. They would index a
// blank page.
//
// So this injects the parts worth reading — the intro and the FAQ — directly
// into #root as initial markup. React discards it on mount, which costs nothing
// because it renders the same copy from the same catalogue. Crawlers and
// no-JS visitors read it as served.
//
// The strings come from src/i18n via esbuild rather than being duplicated here,
// so translations have exactly one home.

import { build } from 'esbuild';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://sydvibecoding.github.io';
const BASE = '/hydration-reminder/';
const SITE = ORIGIN + BASE;

// Spanish is served from the base; every other language gets a subdirectory.
const pathFor = (locale) => (locale === 'es' ? BASE : `${BASE}${locale}/`);
const urlFor = (locale) => ORIGIN + pathFor(locale);

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

async function loadCatalogues() {
  const tmp = join(ROOT, '.seo-catalogues.mjs');
  await build({
    entryPoints: [join(ROOT, 'src/i18n/index.ts')],
    outfile: tmp,
    bundle: true,
    format: 'esm',
    platform: 'node',
    logLevel: 'error',
    // The catalogues are plain data, but index.ts also reads import.meta.env
    // for the base path. Supply it so the bundle evaluates outside Vite.
    define: { 'import.meta.env.BASE_URL': JSON.stringify(BASE) },
  });
  const mod = await import(pathToFileURL(tmp).href + `?t=${Date.now()}`);
  await rm(tmp, { force: true });
  return mod.CATALOGUES;
}

function head(locale, t, locales) {
  const url = urlFor(locale);
  const alternates = locales
    .map((l) => `    <link rel="alternate" hreflang="${l}" href="${urlFor(l)}" />`)
    .join('\n');

  const webApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t.seo.ogSiteName,
    description: t.seo.metaDescription,
    url,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    browserRequirements: t.seo.browserRequirements,
    inLanguage: locale,
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  };

  // The three questions already exist as copy in both languages. Marking them
  // up is the cheapest thing on this page that an answer engine can quote.
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: locale,
    mainEntity: t.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return `    <title>${esc(t.seo.htmlTitle)}</title>
    <meta name="description" content="${esc(t.seo.metaDescription)}" />
    <meta name="theme-color" content="#0A0A0A" />
    <meta name="robots" content="index, follow" />
    <meta name="color-scheme" content="light dark" />
    <link rel="canonical" href="${url}" />
${alternates}
    <link rel="alternate" hreflang="x-default" href="${urlFor('es')}" />

    <link rel="icon" type="image/svg+xml" href="${BASE}favicon.svg" />
    <link rel="apple-touch-icon" href="${BASE}icon.svg" />
    <link rel="manifest" href="${pathFor(locale)}manifest.json" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${esc(t.seo.ogSiteName)}" />
    <meta property="og:title" content="${esc(t.seo.ogTitle)}" />
    <meta property="og:description" content="${esc(t.seo.ogDescription)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${SITE}${t.seo.ogImage}" />
    <meta property="og:image:secure_url" content="${SITE}${t.seo.ogImage}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(t.seo.ogImageAlt)}" />
    <meta property="og:locale" content="${t.seo.ogLocale}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(t.seo.ogTitle)}" />
    <meta name="twitter:description" content="${esc(t.seo.ogDescription)}" />
    <meta name="twitter:image" content="${SITE}${t.seo.ogImage}" />
    <meta name="twitter:image:alt" content="${esc(t.seo.ogImageAlt)}" />

    <script type="application/ld+json">${JSON.stringify(webApp)}</script>
    <script type="application/ld+json">${JSON.stringify(faq)}</script>`;
}

// The fallback sits inside #root and stays painted until React mounts, which
// reads as a flash of unstyled text on every load. This runs while the head is
// still parsing, so browsers never paint it. Crawlers that skip JavaScript keep
// seeing it, which is the whole point of generating it. The timer restores it if
// the bundle never mounts, so a broken deploy degrades to text, not a blank page.
const FALLBACK_GUARD = `    <script>
      (function () {
        var root = document.documentElement;
        root.classList.add('js');
        setTimeout(function () {
          if (document.getElementById('seo-content')) root.classList.remove('js');
        }, 4000);
      })();
    </script>
    <style>.js #seo-content { display: none; }</style>`;

// Rendered inside #root. React replaces it on mount; until then it is what
// crawlers and no-JS visitors get.
function body(t) {
  const faq = t.faq
    .map((item) => `<article><h3>${esc(item.q)}</h3><p>${esc(item.a)}</p></article>`)
    .join('');
  return (
    `<div id="seo-content">` +
    `<h1>${esc(t.appTitle)}</h1>` +
    `<p>${esc(t.aboutEyebrow)}</p>` +
    `<h2>${esc(t.aboutTitle)}</h2>` +
    `<p>${esc(t.aboutBody)}</p>` +
    faq +
    `<p>${esc(t.footer)}</p>` +
    `</div>`
  );
}

function manifest(locale, t) {
  return {
    name: t.seo.manifestName,
    short_name: t.seo.manifestShortName,
    description: t.seo.manifestDescription,
    start_url: pathFor(locale),
    scope: BASE,
    display: 'standalone',
    orientation: 'any',
    theme_color: '#0A0A0A',
    background_color: '#F5F5F7',
    lang: locale,
    categories: ['health', 'lifestyle', 'productivity'],
    icons: [
      { src: `${BASE}icon.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: `${BASE}icon.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
      { src: `${BASE}favicon.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
}

function sitemap(locales, today) {
  const entries = locales
    .map((locale) => {
      const alts = locales
        .map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${urlFor(l)}"/>`)
        .join('\n');
      return `  <url>
    <loc>${urlFor(locale)}</loc>
    <lastmod>${today}</lastmod>
${alts}
    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor('es')}"/>
  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`;
}

// Answer-engine crawlers are named explicitly so the intent is on the record
// rather than inferred from a blanket allow.
function robots() {
  const agents = [
    'Googlebot',
    'Bingbot',
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-User',
    'PerplexityBot',
    'Google-Extended',
    'Applebot-Extended',
  ];
  const blocks = agents.map((a) => `User-agent: ${a}\nAllow: /`).join('\n\n');
  return `${blocks}

User-agent: *
Allow: /

Sitemap: ${SITE}sitemap.xml
`;
}

async function main() {
  const catalogues = await loadCatalogues();
  const locales = Object.keys(catalogues);
  const template = await readFile(join(DIST, 'index.html'), 'utf8');

  // Vite emits absolute asset URLs under `base`, so the same script and style
  // tags work from any directory depth. Match those tags specifically: slicing
  // from the first <script> would also drag in the template's own ld+json and
  // stamp Spanish schema onto the English page.
  const assets = [
    ...template.matchAll(/<script[^>]*type="module"[^>]*><\/script>/g),
    ...template.matchAll(/<link[^>]*rel="(?:stylesheet|modulepreload)"[^>]*>/g),
  ]
    .map((match) => match[0])
    .join('\n    ');

  if (!assets.includes('type="module"')) {
    throw new Error('no module script found in dist/index.html — asset injection would break');
  }

  for (const locale of locales) {
    const t = catalogues[locale];
    const html = `<!DOCTYPE html>
<html lang="${locale}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
${FALLBACK_GUARD}
${head(locale, t, locales)}
    ${assets}
  </head>
  <body>
    <div id="root">${body(t)}</div>
  </body>
</html>
`;
    const dir = locale === 'es' ? DIST : join(DIST, locale);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'index.html'), html, 'utf8');
    await writeFile(
      join(dir, 'manifest.json'),
      JSON.stringify(manifest(locale, t), null, 2),
      'utf8'
    );
    console.log(`[seo] ${locale} -> ${pathFor(locale)}`);
  }

  const today = new Date().toISOString().slice(0, 10);
  await writeFile(join(DIST, 'sitemap.xml'), sitemap(locales, today), 'utf8');
  await writeFile(join(DIST, 'robots.txt'), robots(), 'utf8');
  console.log(`[seo] sitemap.xml, robots.txt`);
}

main().catch((error) => {
  console.error('[seo] failed:', error);
  process.exit(1);
});
