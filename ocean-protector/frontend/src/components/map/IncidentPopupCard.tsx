import React from 'react';
import { motion } from 'framer-motion';

export const IncidentPopupCard: React.FC<{ incident?: any }>=({incident})=>{
  if(!incident) return null;
  return (
    <motion.div initial={{ scale: 0.98, opacity:0 }} animate={{ scale:1, opacity:1 }} className="pointer-events-auto w-72 rounded-lg bg-white/6 p-3 backdrop-blur-md shadow-md">
      <div className="font-semibold">{incident.title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{incident.location?.districtName}</div>
      <div className="mt-2 text-sm">Severity: <strong>{incident.severity}</strong></div>
      <div className="mt-1 text-sm">Confidence: <strong>{incident.confidenceScore ?? '—'}</strong></div>
      <div className="mt-3 flex gap-2">
        <button className="rounded-md bg-indigo-600 px-3 py-1 text-sm text-white">Manage</button>
        <button className="rounded-md bg-white/6 px-3 py-1 text-sm">Open</button>
      </div>
    </motion.div>
  );
}

export default IncidentPopupCard;
