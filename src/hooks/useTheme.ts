import { useState, useEffect } from 'react';

export interface Theme {
  id: string;
  name: string;
  gradient: string; // CSS gradient — shown in theme picker preview + trigger swatch
  accent: string;   // solid dominant — used in CTA, toggle, droplet, timeline dots (all pass AA on white)
  bgTint: string;   // page background wash (kawaii ambient)
}

// 16 curated themes, arranged loosely by hue family
export const THEMES: Theme[] = [
  // Neutral
  { id: 'neutro',        name: 'Neutro',           gradient: 'linear-gradient(135deg, #6B7280, #0A0A0A)',                                             accent: '#0A0A0A', bgTint: '#F5F5F7' },

  // Pinks / roses
  { id: 'cottoncandy',   name: 'Algodón de azúcar',gradient: 'linear-gradient(135deg, #F472B6 0%, #A855F7 100%)',                                     accent: '#DB2777', bgTint: '#FFF8FC' },
  { id: 'rosequartz',    name: 'Cuarzo rosa',      gradient: 'linear-gradient(135deg, #FDA4AF 0%, #F43F5E 50%, #E11D48 100%)',                        accent: '#E11D48', bgTint: '#FFF7F8' },
  { id: 'chicle',        name: 'Chicle',           gradient: 'linear-gradient(135deg, #E879F9 0%, #C026D3 100%)',                                     accent: '#C026D3', bgTint: '#FDF4FF' },

  // Warms — reds & oranges
  { id: 'coral',         name: 'Coral',            gradient: 'linear-gradient(135deg, #FDBA74 0%, #F87171 100%)',                                     accent: '#C2410C', bgTint: '#FFF8F3' },
  { id: 'sunset',        name: 'Atardecer',        gradient: 'linear-gradient(135deg, #FBBF24 0%, #F97316 33%, #DC2626 66%, #DB2777 100%)',           accent: '#DC2626', bgTint: '#FFF7F7' },
  { id: 'goldenhour',    name: 'Hora dorada',      gradient: 'linear-gradient(135deg, #FDE68A 0%, #F97316 50%, #EC4899 100%)',                        accent: '#92400E', bgTint: '#FFFBED' },
  { id: 'terracota',     name: 'Terracota',        gradient: 'linear-gradient(135deg, #EA580C 0%, #B45309 50%, #78350F 100%)',                        accent: '#78350F', bgTint: '#FFF7F0' },

  // Yellows
  { id: 'mostaza',       name: 'Mostaza',          gradient: 'linear-gradient(135deg, #EAB308 0%, #CA8A04 100%)',                                     accent: '#A16207', bgTint: '#FFFDF0' },

  // Greens
  { id: 'emerald',       name: 'Esmeralda',        gradient: 'linear-gradient(135deg, #34D399 0%, #059669 50%, #065F46 100%)',                        accent: '#047857', bgTint: '#F5FDF9' },
  { id: 'northernlights',name: 'Aurora boreal',    gradient: 'linear-gradient(135deg, #34D399 0%, #06B6D4 50%, #A78BFA 100%)',                        accent: '#0E7490', bgTint: '#F3FBFE' },

  // Blues / teals
  { id: 'cielo',         name: 'Cielo',            gradient: 'linear-gradient(135deg, #7DD3FC 0%, #0EA5E9 100%)',                                     accent: '#0369A1', bgTint: '#F7FCFF' },
  { id: 'blueprint',     name: 'Azul técnico',     gradient: 'linear-gradient(135deg, #60A5FA 0%, #2563EB 50%, #1E40AF 100%)',                        accent: '#2563EB', bgTint: '#F7FAFF' },
  { id: 'deepocean',     name: 'Océano profundo',  gradient: 'linear-gradient(135deg, #22D3EE 0%, #0891B2 50%, #164E63 100%)',                        accent: '#164E63', bgTint: '#F6FBFD' },

  // Purples
  { id: 'lavanda',       name: 'Lavanda',          gradient: 'linear-gradient(135deg, #C4B5FD 0%, #8B5CF6 100%)',                                     accent: '#6D28D9', bgTint: '#FAF9FF' },
  { id: 'twilight',      name: 'Crepúsculo',       gradient: 'linear-gradient(135deg, #C084FC 0%, #6D28D9 50%, #4C1D95 100%)',                        accent: '#4C1D95', bgTint: '#FAF8FF' },
];

const STORAGE_KEY = 'hydration-reminder-theme';

export interface ThemeState {
  themes: Theme[];
  currentTheme: Theme;
  setTheme: (id: string) => void;
}

export function useTheme(): ThemeState {
  const [themeId, setThemeId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'neutro';
    } catch {
      return 'neutro';
    }
  });

  const currentTheme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-accent', currentTheme.accent);
    root.style.setProperty('--theme-bg-tint', currentTheme.bgTint);
    try {
      localStorage.setItem(STORAGE_KEY, themeId);
    } catch {
      // ignore
    }
  }, [currentTheme, themeId]);

  return {
    themes: THEMES,
    currentTheme,
    setTheme: setThemeId,
  };
}
