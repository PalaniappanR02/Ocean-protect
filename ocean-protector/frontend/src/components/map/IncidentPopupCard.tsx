import React from 'react';
import { motion } from 'framer-motion';
import { Clock, User, ArrowRight } from 'lucide-react';

export const IncidentPopupCard: React.FC<{ incident?: any }>=({incident})=>{
  if(!incident) return null;
  return (
    <motion.div initial={{ scale: 0.98, opacity:0 }} animate={{ scale:1, opacity:1 }} className="pointer-events-auto w-80 rounded-lg glass-panel p-3 shadow-lg map-popup-card">
      <div className="flex items-start gap-3">
        <div className="h-14 w-14 shrink-0 rounded-md bg-gradient-to-br from-cyan-600 to-indigo-600 flex items-center justify-center text-white text-sm">Img</div>
        <div className="min-w-0">
          <div className="font-semibold leading-tight line-clamp-2">{incident.title}</div>
          <div className="mt-1 text-xs text-muted-foreground">{incident.location?.districtName} · <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3"/>{incident.createdAt ? new Date(incident.createdAt).toLocaleString() : ''}</span></div>
          <div className="mt-2 flex items-center gap-2">
            <div className="px-2 py-0.5 text-xs rounded-full" style={{background: 'rgba(255,255,255,0.04)'}}>Severity: <strong className="ml-1">{incident.severity}</strong></div>
            <div className="text-xs text-muted-foreground">Reports: <strong className="text-white">{incident.reportCount || 0}</strong></div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button className="button-primary px-3 py-1 text-sm flex items-center gap-2">Manage <ArrowRight className="h-4 w-4"/></button>
        <button className="button-secondary px-3 py-1 text-sm flex items-center gap-2"><User className="h-4 w-4"/>View</button>
      </div>
    </motion.div>
  );
}

export default IncidentPopupCard;
