import React from 'react';
import { motion } from 'framer-motion';

export function DashboardSection({ title, description, action, children }: { title: string; description?: string; action?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <section className="mb-6">
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
      <div>{children}</div>
    </section>
  );
}
