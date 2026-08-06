export const shadows = {
  none: 'none',
  xs: '0 1px 2px rgba(16,24,40,0.04)',
  sm: '0 1px 3px rgba(16,24,40,0.06)',
  md: '0 4px 12px rgba(2,6,23,0.08)',
  lg: '0 10px 30px rgba(2,6,23,0.12)',
  menu: '0 6px 18px rgba(2,6,23,0.12)',
  focusRing: '0 0 0 4px rgba(14,165,164,0.12)',
} as const;

export type ShadowTokens = typeof shadows;
