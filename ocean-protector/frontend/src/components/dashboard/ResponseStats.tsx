import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface Stat {
  label: string;
  value: number;
  icon?: React.ComponentType<any>;
  trend?: string;
}

export const ResponseStats: React.FC<{ stats: Stat[] }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s, i) => (
        <motion.div key={i} whileHover={{ translateY: -4 }} className="rounded-lg bg-gradient-to-br from-white/4 to-white/2 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="mt-1 text-2xl font-semibold">{s.value}</div>
              {s.trend && <div className="mt-1 text-xs text-muted-foreground">{s.trend}</div>}
            </div>
            <div className="rounded-md bg-white/6 p-2 text-white">
              {s.icon && React.createElement(s.icon, { className: 'h-6 w-6' })}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ResponseStats;
