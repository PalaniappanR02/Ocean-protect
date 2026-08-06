import React from 'react';
import { motion } from 'framer-motion';
import { Plus, MapPin, RefreshCw, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FloatingActionButtons: React.FC<{ role?: 'citizen'|'analyst'|'authority' }>=({role='citizen'})=>{
  const nav = useNavigate();
  return (
    <div className="pointer-events-auto flex flex-col gap-2">
      <motion.button whileHover={{ scale:1.05 }} aria-label="Report hazard" onClick={()=>nav('/citizen/report')} className="rounded-full bg-red-600 p-3 text-white shadow-lg"><Plus className="h-4 w-4"/></motion.button>
      <motion.button whileHover={{ scale:1.05 }} aria-label="Locate me" onClick={()=>window.dispatchEvent(new Event('map-locate'))} className="rounded-full bg-white/6 p-3 text-white shadow-lg"><MapPin className="h-4 w-4"/></motion.button>
      <motion.button whileHover={{ scale:1.05 }} aria-label="Refresh" onClick={()=>window.dispatchEvent(new Event('refreshData'))} className="rounded-full bg-white/6 p-3 text-white shadow-lg"><RefreshCw className="h-4 w-4"/></motion.button>
      <motion.button whileHover={{ scale:1.05 }} aria-label="Toggle legend" onClick={()=>window.dispatchEvent(new Event('toggleLegend'))} className="rounded-full bg-white/6 p-3 text-white shadow-lg"><Eye className="h-4 w-4"/></motion.button>
    </div>
  );
}

export default FloatingActionButtons;
