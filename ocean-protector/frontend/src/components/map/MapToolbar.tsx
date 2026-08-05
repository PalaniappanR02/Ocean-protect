import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Layers, ZoomIn, ZoomOut } from 'lucide-react';

export const MapToolbar: React.FC<{ onReset?: ()=>void; onLocate?: ()=>void }>=({onReset, onLocate})=>{
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pointer-events-auto rounded-lg bg-white/6 p-2 backdrop-blur-md shadow-sm">
      <div className="flex flex-col gap-2">
        <button aria-label="Reset view" onClick={onReset} className="p-2 rounded-md hover:bg-white/8">
          <Compass className="h-5 w-5" />
        </button>
        <button aria-label="Locate me" onClick={onLocate} className="p-2 rounded-md hover:bg-white/8">
          <Layers className="h-5 w-5" />
        </button>
        <div className="flex gap-1">
          <button aria-label="Zoom in" className="p-2 rounded-md hover:bg-white/8"><ZoomIn className="h-4 w-4"/></button>
          <button aria-label="Zoom out" className="p-2 rounded-md hover:bg-white/8"><ZoomOut className="h-4 w-4"/></button>
        </div>
      </div>
    </motion.div>
  );
}

export default MapToolbar;
