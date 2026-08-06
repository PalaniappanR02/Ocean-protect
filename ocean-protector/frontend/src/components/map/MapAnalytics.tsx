import React from 'react';
import { motion } from 'framer-motion';

export const MapAnalytics: React.FC<{ stats?: any }>=({stats={}})=>{
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="pointer-events-auto rounded-lg bg-white/6 p-3 backdrop-blur-md shadow-sm text-sm">
      <div className="font-semibold">Mini analytics</div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div>Incidents: <strong className="text-white">{stats.count||0}</strong></div>
        <div>Verified: <strong className="text-white">{stats.verified||0}</strong></div>
        <div>Critical: <strong className="text-white">{stats.critical||0}</strong></div>
        <div>Updated: <strong className="text-white">{stats.updated||'-'}</strong></div>
      </div>
    </motion.div>
  );
}

export default MapAnalytics;
