import React from 'react';
import { motion } from 'framer-motion';

interface QuickActionCardProps {
  Icon: React.ComponentType<any>;
  label: string;
  description?: string;
  onActivate?: () => void;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({ Icon, label, description, onActivate }) => {
  return (
    <motion.button whileHover={{ translateY: -4 }} whileTap={{ scale: 0.98 }} onClick={onActivate} className="group flex items-start gap-3 rounded-lg bg-gradient-to-br from-white/4 to-white/2 p-4 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400">
      <div className="rounded-md bg-white/6 p-3 text-white">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="font-semibold">{label}</div>
        {description && <div className="text-sm text-muted-foreground">{description}</div>}
      </div>
    </motion.button>
  );
};

export default QuickActionCard;
