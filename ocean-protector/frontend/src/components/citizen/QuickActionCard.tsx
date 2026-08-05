import React, { KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  label: string;
  Icon: LucideIcon;
  onActivate?: () => void;
}

export const QuickActionCard = React.memo(function QuickActionCard({ label, Icon, onActivate }: QuickActionCardProps) {
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onActivate && onActivate();
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      className="relative rounded-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-4 shadow-sm focus:outline-none"
      role="button"
      tabIndex={0}
      onKeyDown={onKey}
      onClick={() => onActivate && onActivate()}
      aria-label={label}
    >
      <div className="flex items-start gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-oceanBlue text-white">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <div className="font-semibold">{label}</div>
          <div className="text-sm text-muted-foreground">Quick action</div>
        </div>
      </div>
    </motion.div>
  );
});
