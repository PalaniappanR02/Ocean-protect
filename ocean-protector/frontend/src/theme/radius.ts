export const radius = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  pill: '9999px',
  card: '16px',
} as const;

export type RadiusTokens = typeof radius;
