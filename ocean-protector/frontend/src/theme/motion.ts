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
  transitions: {
    page: { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] as const },
    surface: { duration: 0.24, ease: [0.2, 0.8, 0.2, 1] as const },
    quick: { duration: 0.18, ease: [0.2, 0.8, 0.2, 1] as const },
  },
  variants: {
    page: {
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -8 },
    },
    staggerContainer: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.02 },
      },
    },
    staggerItem: {
      hidden: { opacity: 0, y: 8 },
      visible: { opacity: 1, y: 0 },
    },
  },
} as const;

export type MotionTokens = typeof motion;
