import React from 'react';
import { motion } from 'framer-motion';
import { Plus, MapPin, RefreshCw, Eye } from 'lucide-react';

export const FloatingActionButtons: React.FC = ()=>{
  return (
    <div className="pointer-events-auto flex flex-col gap-2">
      <motion.button whileHover={{ scale:1.05 }} aria-label="Report hazard" className="rounded-full bg-red-600 p-3 text-white shadow-md"><Plus className="h-4 w-4"/></motion.button>
      <motion.button whileHover={{ scale:1.05 }} aria-label="Locate me" className="rounded-full bg-white/6 p-3 text-white shadow-md"><MapPin className="h-4 w-4"/></motion.button>
      <motion.button whileHover={{ scale:1.05 }} aria-label="Refresh" className="rounded-full bg-white/6 p-3 text-white shadow-md"><RefreshCw className="h-4 w-4"/></motion.button>
      <motion.button whileHover={{ scale:1.05 }} aria-label="Toggle legend" className="rounded-full bg-white/6 p-3 text-white shadow-md"><Eye className="h-4 w-4"/></motion.button>
    </div>
  );
}

export default FloatingActionButtons;
