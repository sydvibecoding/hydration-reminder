import { useLayoutEffect, useState } from 'react';

interface ThemePalette {
  background: string;
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  surfaceContainer: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
}

export interface Theme {
  id: string;
  name: string;
  gradient: string;
  accent: string;
  bgTint: string;
  palette: ThemePalette;
}

function palette(
  background: string,
  primary: string,
  primaryContainer: string,
  onPrimaryContainer: string,
  surfaceContainer: string,
  secondaryContainer: string,
  onSecondaryContainer: string,
  onSurface: string,
  onSurfaceVariant: string,
  outline: string,
): ThemePalette {
  return {
    background,
    primary,
    onPrimary: '#FFFFFF',
    primaryContainer,
    onPrimaryContainer,
    surfaceContainer,
    secondaryContainer,
    onSecondaryContainer,
    onSurface,
    onSurfaceVariant,
    outline,
  };
}

// Exact semantic colors from the M3 Home frames in hidratacion.pen.
// These are curated palettes, not seeds for a runtime palette generator.
export const THEMES: Theme[] = [
  {
    id: 'neutro', name: 'Neutro',
    gradient: 'linear-gradient(135deg, #6B7280, #0A0A0A)', accent: '#0A0A0A', bgTint: '#F5F5F7',
    palette: palette('#F5F5F7', '#0A0A0A', '#E5E5E7', '#0A0A0A', '#EEEEF0', '#D8D8DC', '#0A0A0A', '#0A0A0A', '#4B5563', '#8E8E93'),
  },
  {
    id: 'cottoncandy', name: 'Algodón de azúcar',
    gradient: 'linear-gradient(135deg, #F472B6 0%, #A855F7 100%)', accent: '#DB2777', bgTint: '#FFF8FC',
    palette: palette('#FFF8FC', '#DB2777', '#FCE7F3', '#500724', '#F5E7EF', '#F4D5E6', '#500724', '#1F0A19', '#5B3746', '#A8829A'),
  },
  {
    id: 'rosequartz', name: 'Cuarzo rosa',
    gradient: 'linear-gradient(135deg, #FDA4AF 0%, #F43F5E 50%, #E11D48 100%)', accent: '#E11D48', bgTint: '#FFF7F8',
    palette: palette('#FFF7F8', '#E11D48', '#FFE1E7', '#4C0519', '#F8EBEE', '#F1CFD6', '#4C0519', '#200811', '#5A3239', '#A67A82'),
  },
  {
    id: 'chicle', name: 'Chicle',
    gradient: 'linear-gradient(135deg, #E879F9 0%, #C026D3 100%)', accent: '#C026D3', bgTint: '#FDF4FF',
    palette: palette('#FDF4FF', '#C026D3', '#F5D0FE', '#4A044E', '#F0E4F5', '#E5C4EE', '#4A044E', '#1F0B21', '#55365C', '#9B7AA1'),
  },
  {
    id: 'coral', name: 'Coral',
    gradient: 'linear-gradient(135deg, #FDBA74 0%, #F87171 100%)', accent: '#C2410C', bgTint: '#FFF8F3',
    palette: palette('#FFF8F3', '#C2410C', '#FFE0CE', '#351100', '#F8EDE5', '#F1D9C6', '#341100', '#1F1108', '#5A4030', '#A88670'),
  },
  {
    id: 'sunset', name: 'Atardecer',
    gradient: 'linear-gradient(135deg, #FBBF24 0%, #F97316 33%, #DC2626 66%, #DB2777 100%)', accent: '#DC2626', bgTint: '#FFF7F7',
    palette: palette('#FFF7F7', '#DC2626', '#FEE2E2', '#450A0A', '#F5E5E5', '#F1D0D0', '#450A0A', '#1F0808', '#5B3232', '#A67878'),
  },
  {
    id: 'goldenhour', name: 'Hora dorada',
    gradient: 'linear-gradient(135deg, #FDE68A 0%, #F97316 50%, #EC4899 100%)', accent: '#92400E', bgTint: '#FFFBED',
    palette: palette('#FFFBED', '#92400E', '#FEF3C7', '#451A03', '#F5EFDB', '#F0E4C2', '#451A03', '#211602', '#57462B', '#9E8B6E'),
  },
  {
    id: 'terracota', name: 'Terracota',
    gradient: 'linear-gradient(135deg, #EA580C 0%, #B45309 50%, #78350F 100%)', accent: '#78350F', bgTint: '#FFF7F0',
    palette: palette('#FFF7F0', '#78350F', '#FED7AA', '#431407', '#F3E9DC', '#EBD5BF', '#431407', '#1D110A', '#57422F', '#9E8873'),
  },
  {
    id: 'mostaza', name: 'Mostaza',
    gradient: 'linear-gradient(135deg, #EAB308 0%, #CA8A04 100%)', accent: '#A16207', bgTint: '#FFFDF0',
    palette: palette('#FFFDF0', '#A16207', '#FEF08A', '#422006', '#F5F1DB', '#EDE5B9', '#422006', '#201C05', '#574F28', '#9E9268'),
  },
  {
    id: 'emerald', name: 'Esmeralda',
    gradient: 'linear-gradient(135deg, #34D399 0%, #059669 50%, #065F46 100%)', accent: '#047857', bgTint: '#F5FDF9',
    palette: palette('#F5FDF9', '#047857', '#C2F1DC', '#002114', '#EAF6EF', '#CFE7D8', '#002114', '#0A1F16', '#39544A', '#749686'),
  },
  {
    id: 'northernlights', name: 'Aurora boreal',
    gradient: 'linear-gradient(135deg, #34D399 0%, #06B6D4 50%, #A78BFA 100%)', accent: '#0E7490', bgTint: '#F3FBFE',
    palette: palette('#F3FBFE', '#0E7490', '#CFFAFE', '#082F49', '#E5F1F6', '#C4E0EA', '#082F49', '#061420', '#24404E', '#6B8A98'),
  },
  {
    id: 'cielo', name: 'Cielo',
    gradient: 'linear-gradient(135deg, #7DD3FC 0%, #0EA5E9 100%)', accent: '#0369A1', bgTint: '#F7FCFF',
    palette: palette('#F7FCFF', '#0369A1', '#DCEEFF', '#001D33', '#EEF5FA', '#D3E5F5', '#0C1D29', '#111827', '#4B5563', '#7B909E'),
  },
  {
    id: 'blueprint', name: 'Azul técnico',
    gradient: 'linear-gradient(135deg, #60A5FA 0%, #2563EB 50%, #1E40AF 100%)', accent: '#2563EB', bgTint: '#F7FAFF',
    palette: palette('#F7FAFF', '#2563EB', '#DBEAFE', '#1E3A8A', '#E7EFFB', '#CAD8F0', '#1E3A8A', '#0F172A', '#334155', '#7C8FB0'),
  },
  {
    id: 'deepocean', name: 'Océano profundo',
    gradient: 'linear-gradient(135deg, #22D3EE 0%, #0891B2 50%, #164E63 100%)', accent: '#164E63', bgTint: '#F6FBFD',
    palette: palette('#F6FBFD', '#164E63', '#A5F3FC', '#072027', '#E5F1F5', '#C6E1EA', '#072027', '#071620', '#26424D', '#6C8993'),
  },
  {
    id: 'lavanda', name: 'Lavanda',
    gradient: 'linear-gradient(135deg, #C4B5FD 0%, #8B5CF6 100%)', accent: '#6D28D9', bgTint: '#FAF9FF',
    palette: palette('#FAF9FF', '#6D28D9', '#EBDDFF', '#250067', '#F1EEF9', '#E0D8EE', '#251A44', '#171225', '#4C4460', '#8B82A0'),
  },
  {
    id: 'twilight', name: 'Crepúsculo',
    gradient: 'linear-gradient(135deg, #C084FC 0%, #6D28D9 50%, #4C1D95 100%)', accent: '#4C1D95', bgTint: '#FAF8FF',
    palette: palette('#FAF8FF', '#4C1D95', '#DDD6FE', '#1E0A5E', '#EEE9F7', '#D8CDEF', '#1E0A5E', '#171225', '#4C4460', '#8B82A0'),
  },
];

const STORAGE_KEY = 'hydration-reminder-theme';

export interface ThemeState {
  themes: Theme[];
  currentTheme: Theme;
  setTheme: (id: string) => void;
}

function lightRoles(p: ThemePalette): Record<string, string> {
  return {
    primary: p.primary,
    'on-primary': p.onPrimary,
    'primary-container': p.primaryContainer,
    'on-primary-container': p.onPrimaryContainer,
    secondary: p.primary,
    'on-secondary': p.onPrimary,
    'secondary-container': p.secondaryContainer,
    'on-secondary-container': p.onSecondaryContainer,
    tertiary: p.primary,
    'on-tertiary': p.onPrimary,
    'tertiary-container': p.primaryContainer,
    'on-tertiary-container': p.onPrimaryContainer,
    error: '#BA1A1A',
    'on-error': '#FFFFFF',
    'error-container': '#FFDAD6',
    'on-error-container': '#410002',
    background: p.background,
    'on-background': p.onSurface,
    surface: p.background,
    'surface-dim': p.secondaryContainer,
    'surface-bright': p.background,
    'surface-container-lowest': '#FFFFFF',
    'surface-container-low': p.surfaceContainer,
    'surface-container': p.surfaceContainer,
    'surface-container-high': p.surfaceContainer,
    'surface-container-highest': p.secondaryContainer,
    'on-surface': p.onSurface,
    'surface-variant': p.secondaryContainer,
    'on-surface-variant': p.onSurfaceVariant,
    outline: p.outline,
    'outline-variant': p.secondaryContainer,
    'inverse-surface': p.onSurface,
    'inverse-on-surface': p.background,
    'inverse-primary': p.primaryContainer,
    'surface-tint': p.primary,
    shadow: '#000000',
    scrim: '#000000',
  };
}

// The pen only specifies light palettes. Dark mode keeps the hue identity but
// uses restrained, near-neutral surfaces and low-chroma accent containers.
// Directly swapping the light primary into a large dark container made the
// themes feel neon and much more intense than Material dark schemes.
function darkRoles(p: ThemePalette): Record<string, string> {
  const surface = `color-mix(in srgb, ${p.onSurface} 18%, #121316)`;
  const surfaceLowest = `color-mix(in srgb, ${p.onSurface} 10%, #090A0C)`;
  const surfaceLow = `color-mix(in srgb, ${p.onSurface} 16%, #1B1C20)`;
  const surfaceContainer = `color-mix(in srgb, ${p.onSurface} 18%, #202126)`;
  const surfaceHigh = `color-mix(in srgb, ${p.onSurface} 20%, #27282E)`;
  const surfaceHighest = `color-mix(in srgb, ${p.onSurfaceVariant} 20%, #303137)`;
  const primary = `color-mix(in srgb, ${p.primaryContainer} 78%, #FFFFFF)`;
  const onPrimary = `color-mix(in srgb, ${p.onPrimaryContainer} 75%, #000000)`;
  const primaryContainer = `color-mix(in srgb, ${p.primary} 28%, ${surfaceHigh})`;
  const onPrimaryContainer = `color-mix(in srgb, ${p.primaryContainer} 85%, #FFFFFF)`;
  const secondary = `color-mix(in srgb, ${p.secondaryContainer} 72%, #FFFFFF)`;
  const secondaryContainer = `color-mix(in srgb, ${p.primary} 18%, ${surfaceHighest})`;
  const onSecondaryContainer = `color-mix(in srgb, ${p.primaryContainer} 78%, #FFFFFF)`;
  const onSurfaceVariant = `color-mix(in srgb, ${p.surfaceContainer} 78%, #FFFFFF)`;
  return {
    primary,
    'on-primary': onPrimary,
    'primary-container': primaryContainer,
    'on-primary-container': onPrimaryContainer,
    secondary,
    'on-secondary': p.onSecondaryContainer,
    'secondary-container': secondaryContainer,
    'on-secondary-container': onSecondaryContainer,
    tertiary: primary,
    'on-tertiary': onPrimary,
    'tertiary-container': primaryContainer,
    'on-tertiary-container': onPrimaryContainer,
    error: '#FFB4AB',
    'on-error': '#690005',
    'error-container': '#93000A',
    'on-error-container': '#FFDAD6',
    background: surface,
    'on-background': p.background,
    surface,
    'surface-dim': surface,
    'surface-bright': surfaceHighest,
    'surface-container-lowest': surfaceLowest,
    'surface-container-low': surfaceLow,
    'surface-container': surfaceContainer,
    'surface-container-high': surfaceHigh,
    'surface-container-highest': surfaceHighest,
    'on-surface': p.background,
    'surface-variant': surfaceHighest,
    'on-surface-variant': onSurfaceVariant,
    outline: `color-mix(in srgb, ${p.outline} 65%, #FFFFFF)`,
    'outline-variant': `color-mix(in srgb, ${p.onSurfaceVariant} 35%, ${surfaceHigh})`,
    'inverse-surface': p.background,
    'inverse-on-surface': p.onSurface,
    'inverse-primary': p.primary,
    'surface-tint': primary,
    shadow: '#000000',
    scrim: '#000000',
  };
}

function declarations(roles: Record<string, string>): string {
  return Object.entries(roles)
    .map(([role, value]) => `--md-sys-color-${role}: ${value};`)
    .join('\n  ');
}

function applyPalette(theme: Theme) {
  const light = declarations(lightRoles(theme.palette));
  const dark = declarations(darkRoles(theme.palette));
  const css = `
:root {
  ${light}
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    ${dark}
  }
}
:root[data-theme="dark"] {
  ${dark}
}`;

  let tag = document.getElementById('__m3_palette__') as HTMLStyleElement | null;
  if (!tag) {
    tag = document.createElement('style');
    tag.id = '__m3_palette__';
    document.head.appendChild(tag);
  }
  tag.textContent = css;

  const root = document.documentElement;
  root.style.setProperty('--theme-accent', theme.accent);
  root.style.setProperty('--theme-bg-tint', theme.bgTint);
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', theme.accent);
}

export function useTheme(): ThemeState {
  const [themeId, setThemeId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'neutro';
    } catch {
      return 'neutro';
    }
  });

  const currentTheme = THEMES.find((theme) => theme.id === themeId) ?? THEMES[0];

  useLayoutEffect(() => {
    applyPalette(currentTheme);
    try {
      localStorage.setItem(STORAGE_KEY, currentTheme.id);
    } catch {
      // Storage can be unavailable in privacy modes; the in-memory theme still works.
    }
  }, [currentTheme]);

  return { themes: THEMES, currentTheme, setTheme: setThemeId };
}
