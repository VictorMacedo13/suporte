/**
 * Tokens visuais DGcom — fonte da verdade para cores do brand.
 *
 * Os tokens consumidos pelos componentes ficam em CSS custom properties
 * (apps/web/src/styles/globals.css). Estes valores são apenas referência
 * para casos onde precisamos da cor crua (gráficos, exports, emails).
 */
export const dgcomTokens = {
  colors: {
    primary: '#1758E6',
    accent: '#E6A717',
    background: '#FFFFFF',
    backgroundDark: '#0A2540',
  },
  fonts: {
    sans: 'Geist, ui-sans-serif, system-ui, sans-serif',
    mono: 'Geist Mono, ui-monospace, monospace',
    display: 'Instrument Serif, ui-serif, serif',
  },
  fontFeatureSettings: '"ss01", "cv11"',
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    pill: '9999px',
  },
} as const;

export type DGcomTokens = typeof dgcomTokens;
