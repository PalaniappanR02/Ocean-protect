export const motion = {
  durations: {
    fastest: '120ms',
    faster: '160ms',
    default: '240ms',
    slow: '420ms',
    slower: '680ms',
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    decel: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accel: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
} as const;

export type MotionTokens = typeof motion;
