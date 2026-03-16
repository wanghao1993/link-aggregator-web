/**
 * Theme Configuration
 *
 * This file allows you to define custom themes that can be applied
 * by modifying CSS variables at runtime.
 */

export interface ThemeColors {
  // Brand colors
  primary: string;
  primaryHover: string;
  secondary: string;
  accent: string;
  accentHover: string;
}

export interface ThemeConfig {
  name: string;
  label: string;
  colors: ThemeColors;
}

/**
 * Predefined themes
 */
export const themes: ThemeConfig[] = [
  {
    name: 'default',
    label: 'Teal (Default)',
    colors: {
      primary: '13 148 136',
      primaryHover: '15 118 110',
      secondary: '20 184 166',
      accent: '245 158 11',
      accentHover: '217 119 6',
    },
  },
  {
    name: 'ocean',
    label: 'Ocean Blue',
    colors: {
      primary: '14 165 233',
      primaryHover: '3 105 161',
      secondary: '56 189 248',
      accent: '245 158 11',
      accentHover: '217 119 6',
    },
  },
  {
    name: 'forest',
    label: 'Forest Green',
    colors: {
      primary: '22 163 74',
      primaryHover: '21 128 61',
      secondary: '34 197 94',
      accent: '251 146 60',
      accentHover: '234 88 12',
    },
  },
  {
    name: 'sunset',
    label: 'Sunset Orange',
    colors: {
      primary: '234 88 12',
      primaryHover: '194 65 12',
      secondary: '249 115 22',
      accent: '14 165 233',
      accentHover: '3 105 161',
    },
  },
  {
    name: 'rose',
    label: 'Rose Pink',
    colors: {
      primary: '225 29 72',
      primaryHover: '190 18 60',
      secondary: '244 63 94',
      accent: '16 185 129',
      accentHover: '5 150 105',
    },
  },
  {
    name: 'violet',
    label: 'Violet Purple',
    colors: {
      primary: '124 58 237',
      primaryHover: '109 40 217',
      secondary: '139 92 246',
      accent: '34 197 94',
      accentHover: '22 163 74',
    },
  },
  {
    name: 'slate',
    label: 'Slate Gray',
    colors: {
      primary: '71 85 105',
      primaryHover: '51 65 85',
      secondary: '100 116 139',
      accent: '245 158 11',
      accentHover: '217 119 6',
    },
  },
  {
    name: 'amber',
    label: 'Amber Gold',
    colors: {
      primary: '217 119 6',
      primaryHover: '180 83 9',
      secondary: '245 158 11',
      accent: '14 165 233',
      accentHover: '3 105 161',
    },
  },
];

/**
 * Apply a theme by name
 */
export function applyTheme(themeName: string) {
  const theme = themes.find(t => t.name === themeName);
  if (!theme) {
    console.warn(`Theme "${themeName}" not found, using default`);
    return;
  }

  const root = document.documentElement;

  // Apply brand colors
  root.style.setProperty('--color-brand-primary', theme.colors.primary);
  root.style.setProperty('--color-brand-secondary', theme.colors.secondary);
  root.style.setProperty('--color-brand-accent', theme.colors.accent);

  // Update computed colors for light mode
  const primaryRgb = theme.colors.primary;
  const accentRgb = theme.colors.accent;

  root.style.setProperty('--color-primary', `rgb(${primaryRgb})`);
  root.style.setProperty('--color-primary-hover', `rgb(${theme.colors.primaryHover})`);
  root.style.setProperty('--color-primary-light', `rgba(${primaryRgb} / 0.1)`);
  root.style.setProperty('--color-primary-lighter', `rgba(${primaryRgb} / 0.05)`);

  root.style.setProperty('--color-accent', `rgb(${accentRgb})`);
  root.style.setProperty('--color-accent-hover', `rgb(${theme.colors.accentHover})`);
  root.style.setProperty('--color-accent-light', `rgba(${accentRgb} / 0.1)`);

  // Update gradients
  root.style.setProperty(
    '--gradient-primary',
    `linear-gradient(135deg, rgb(${primaryRgb}) 0%, rgb(${theme.colors.secondary}) 100%)`
  );
  root.style.setProperty(
    '--gradient-accent',
    `linear-gradient(135deg, rgb(${accentRgb}) 0%, rgb(251 146 60) 100%)`
  );

  // Save preference
  localStorage.setItem('theme-color', themeName);
}

/**
 * Get the current theme
 */
export function getCurrentTheme(): string {
  return localStorage.getItem('theme-color') || 'default';
}

/**
 * Initialize theme from saved preference
 */
export function initTheme() {
  const savedTheme = getCurrentTheme();
  applyTheme(savedTheme);
}
