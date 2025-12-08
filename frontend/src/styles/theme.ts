/**
 * TickX Design System
 *
 * All colors, typography, spacing, and design tokens are defined here.
 * Import this file to use consistent styling throughout the app.
 *
 * To change the color scheme, only modify this file.
 */

export const colors = {
  // Primary brand colors
  primary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    DEFAULT: '#6B46C1',
  },

  // Secondary accent color
  secondary: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    DEFAULT: '#00D4FF',
  },

  // Accent color for CTAs and urgency
  accent: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
    DEFAULT: '#FF6B6B',
  },

  // Semantic colors
  success: {
    light: '#d1fae5',
    DEFAULT: '#10B981',
    dark: '#059669',
  },
  warning: {
    light: '#fef3c7',
    DEFAULT: '#F59E0B',
    dark: '#d97706',
  },
  error: {
    light: '#fee2e2',
    DEFAULT: '#EF4444',
    dark: '#dc2626',
  },
  info: {
    light: '#dbeafe',
    DEFAULT: '#3B82F6',
    dark: '#2563eb',
  },

  // Neutral colors (light mode)
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
    950: '#0F0F0F',
  },

  // Background colors
  background: {
    primary: '#FAFAFA',
    secondary: '#FFFFFF',
    tertiary: '#F4F4F5',
  },

  // Text colors
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },

  // Border colors
  border: {
    light: '#E4E4E7',
    DEFAULT: '#D4D4D8',
    dark: '#A1A1AA',
  },
} as const;

export const typography = {
  fontFamily: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    accent: "'Space Grotesk', 'Inter', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },

  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const spacing = {
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  DEFAULT: '0.5rem', // 8px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

export const transitions = {
  fast: '150ms ease',
  DEFAULT: '200ms ease',
  slow: '300ms ease',
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// Utility function to generate CSS variables
export const generateCSSVariables = (): string => {
  return `
    :root {
      /* Primary Colors */
      --color-primary: ${colors.primary.DEFAULT};
      --color-primary-50: ${colors.primary[50]};
      --color-primary-100: ${colors.primary[100]};
      --color-primary-200: ${colors.primary[200]};
      --color-primary-300: ${colors.primary[300]};
      --color-primary-400: ${colors.primary[400]};
      --color-primary-500: ${colors.primary[500]};
      --color-primary-600: ${colors.primary[600]};
      --color-primary-700: ${colors.primary[700]};
      --color-primary-800: ${colors.primary[800]};
      --color-primary-900: ${colors.primary[900]};

      /* Secondary Colors */
      --color-secondary: ${colors.secondary.DEFAULT};
      --color-secondary-500: ${colors.secondary[500]};

      /* Accent Colors */
      --color-accent: ${colors.accent.DEFAULT};
      --color-accent-500: ${colors.accent[500]};

      /* Semantic Colors */
      --color-success: ${colors.success.DEFAULT};
      --color-warning: ${colors.warning.DEFAULT};
      --color-error: ${colors.error.DEFAULT};
      --color-info: ${colors.info.DEFAULT};

      /* Background */
      --color-bg-primary: ${colors.background.primary};
      --color-bg-secondary: ${colors.background.secondary};
      --color-bg-tertiary: ${colors.background.tertiary};

      /* Text */
      --color-text-primary: ${colors.text.primary};
      --color-text-secondary: ${colors.text.secondary};
      --color-text-tertiary: ${colors.text.tertiary};

      /* Border */
      --color-border: ${colors.border.DEFAULT};
      --color-border-light: ${colors.border.light};

      /* Typography */
      --font-primary: ${typography.fontFamily.primary};
      --font-accent: ${typography.fontFamily.accent};

      /* Spacing */
      --spacing-1: ${spacing[1]};
      --spacing-2: ${spacing[2]};
      --spacing-3: ${spacing[3]};
      --spacing-4: ${spacing[4]};
      --spacing-6: ${spacing[6]};
      --spacing-8: ${spacing[8]};

      /* Border Radius */
      --radius-sm: ${borderRadius.sm};
      --radius-md: ${borderRadius.md};
      --radius-lg: ${borderRadius.lg};
      --radius-xl: ${borderRadius.xl};

      /* Shadows */
      --shadow-sm: ${shadows.sm};
      --shadow-md: ${shadows.md};
      --shadow-lg: ${shadows.lg};

      /* Transitions */
      --transition-fast: ${transitions.fast};
      --transition-default: ${transitions.DEFAULT};
    }
  `;
};

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
  zIndex,
} as const;

export default theme;
