import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import { motion as motionTokens } from '@/theme/motion';

export function AppShell() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <>
      <a
        href="#main-content"
        className="nav-pill fixed left-4 top-4 z-50 -translate-y-24 px-4 py-3 font-semibold transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={reduceMotion ? { opacity: 0 } : motionTokens.variants.page.initial}
          animate={reduceMotion ? { opacity: 1 } : motionTokens.variants.page.animate}
          exit={reduceMotion ? { opacity: 0 } : motionTokens.variants.page.exit}
          transition={motionTokens.transitions.page}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </>
  );
}
