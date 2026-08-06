import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export const AlertPanel: React.FC<{ alerts?: any[] }> = ({ alerts = [] }) => {
  return (
    <div className="space-y-3">
      {alerts.slice(0, 4).map((a: any) => (
        <motion.div key={a.id} whileHover={{ scale: 1.01 }} className="rounded-lg bg-gradient-to-br from-red-700/20 to-red-500/10 p-3 shadow-sm backdrop-blur-sm border border-red-400/20">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-red-600/20 p-2"><AlertTriangle className="h-5 w-5 text-red-400" /></div>
              <div>
                <div className="font-semibold">{a.title}</div>
                <div className="text-xs text-muted-foreground">{a.region} · {new Date(a.time).toLocaleString()}</div>
              </div>
            </div>
            <div className="text-sm font-medium text-red-400">{a.severity}</div>
          </div>
        </motion.div>
      ))}
      {alerts.length === 0 && <div className="py-6 text-center text-sm text-muted-foreground">No active alerts</div>}
    </div>
  );
};

export default AlertPanel;
