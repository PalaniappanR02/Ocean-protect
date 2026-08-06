import React from 'react';
import { motion } from 'framer-motion';

export const LiveStatusWidget: React.FC<{ stats?: any }>=({stats={}})=>{
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="pointer-events-auto rounded-lg bg-white/6 p-3 backdrop-blur-md shadow-sm text-sm">
      <div className="font-semibold">Live status</div>
      <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-muted-foreground">
        <div>Active hazards: <strong className="text-white">{stats.hazards||0}</strong></div>
        <div>Teams: <strong className="text-white">{stats.teams||0}</strong></div>
        <div>Updates: <strong className="text-white">{stats.updates||0}</strong></div>
      </div>
    </motion.div>
  );
}

export default LiveStatusWidget;
