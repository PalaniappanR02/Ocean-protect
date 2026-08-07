import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { motion as motionTokens } from '@/theme/motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Centralized page enter/exit transition (fade + subtle vertical motion),
 * keyed on the current pathname so every internal navigation animates without
 * a full page refresh. Respects prefers-reduced-motion.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={reduceMotion ? { opacity: 0 } : motionTokens.variants.page.initial}
        animate={reduceMotion ? { opacity: 1 } : motionTokens.variants.page.animate}
        exit={reduceMotion ? { opacity: 0 } : motionTokens.variants.page.exit}
        transition={motionTokens.transitions.page}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
