import React from 'react';
import { motion } from 'framer-motion';

export const MapFilters: React.FC<{ onClose?: ()=>void; onApply?: (filters:any)=>void }>=({onClose,onApply})=>{
  return (
    <motion.aside initial={{ x: -24, opacity:0 }} animate={{ x:0, opacity:1 }} className="w-80 pointer-events-auto rounded-r-lg glass-panel p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Filters</h4>
        <div className="flex items-center gap-2">
          <button aria-label="Clear filters" onClick={()=>onApply?.({})} className="text-sm text-muted-foreground">Clear</button>
          <button aria-label="Close filters" onClick={onClose} className="text-sm text-muted-foreground">Close</button>
        </div>
      </div>
      <div className="mt-3 space-y-3 text-sm">
        <label className="block">Severity</label>
        <select aria-label="Severity filter" className="w-full field-control p-2">
          <option value="">All</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="advisory">Advisory</option>
        </select>

        <label className="block">Hazard type</label>
        <input aria-label="Hazard type filter" className="w-full field-control p-2" placeholder="Search hazard types" />

        <label className="block">Date range</label>
        <input aria-label="Date range" className="w-full field-control p-2" placeholder="Last 24h" />

        <div className="pt-2">
          <div className="flex flex-wrap gap-2">
            <button className="glass-pill px-3 py-1 text-xs">Last 24h</button>
            <button className="glass-pill px-3 py-1 text-xs">Last 7d</button>
            <button className="glass-pill px-3 py-1 text-xs">Last 30d</button>
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <button className="button-secondary px-3 py-1" onClick={()=>onApply?.({})}>Apply</button>
        </div>
      </div>
    </motion.aside>
  );
}

export default MapFilters;
