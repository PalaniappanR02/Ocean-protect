import React from 'react';
import { motion } from 'framer-motion';

export const MapFilters: React.FC<{ onClose?: ()=>void }>=({onClose})=>{
  return (
    <motion.aside initial={{ x: -16, opacity:0 }} animate={{ x:0, opacity:1 }} className="w-72 pointer-events-auto rounded-r-lg bg-white/6 p-4 backdrop-blur-md shadow-md">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Filters</h4>
        <button aria-label="Close filters" onClick={onClose} className="text-sm text-muted-foreground">Close</button>
      </div>
      <div className="mt-3 space-y-3 text-sm">
        <label className="block">Severity</label>
        <select className="w-full rounded-md bg-white/4 p-2">
          <option>All</option>
          <option>Critical</option>
          <option>Warning</option>
          <option>Advisory</option>
        </select>

        <label className="block">Hazard type</label>
        <input className="w-full rounded-md bg-white/4 p-2" placeholder="Search hazard types" />

        <label className="block">Date range</label>
        <input className="w-full rounded-md bg-white/4 p-2" placeholder="Last 24h" />
      </div>
    </motion.aside>
  );
}

export default MapFilters;
