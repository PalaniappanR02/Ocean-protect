export const colors = {
  primary: '#0ea5a4', // ocean cyan
  secondary: '#065f46',
  success: '#16a34a',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  background: '#ffffff',
  surface: '#f8fafc',
  card: '#ffffff',
  sidebar: '#0f172a',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  border: '#e6e9ee',
  oceanBlue: '#0369a1',
  deepOcean: '#023047',
  cyan: '#06b6d4',
  wave: '#7dd3fc',
  gradientPrimary: 'linear-gradient(90deg,#0ea5a4 0%,#0369a1 100%)',
  gradientHero: 'linear-gradient(180deg,#0ea5a4 0%,#3b82f6 100%)',
} as const;

export type ColorTokens = typeof colors;
