import React from 'react';
import { motion } from 'framer-motion';

export function SafetyTipCard({ title, description }: { title: string; description: string }) {
  return (
    <motion.article whileHover={{ y: -4 }} className="rounded-lg bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-4">
      <h4 className="font-semibold">{title}</h4>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </motion.article>
  );
}
