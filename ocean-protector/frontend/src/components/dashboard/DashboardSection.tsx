import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { motion as motionTokens } from '@/theme/motion';

export function DashboardSection({ title, description, action, children }: { title: string; description?: string; action?: React.ReactNode; children?: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="mb-6"
      initial={reduceMotion ? { opacity: 0 } : 'hidden'}
      whileInView={reduceMotion ? { opacity: 1 } : 'visible'}
      viewport={{ once: true, amount: 0.18 }}
      variants={reduceMotion ? undefined : motionTokens.variants.staggerContainer}
      transition={motionTokens.transitions.surface}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <motion.h3 initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="text-lg font-semibold">
            {title}
          </motion.h3>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        <div>{action}</div>
      </div>
      <div className="animated-divider mb-4 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" aria-hidden />
      <motion.div variants={reduceMotion ? undefined : motionTokens.variants.staggerItem}>{children}</motion.div>
    </motion.section>
  );
}
