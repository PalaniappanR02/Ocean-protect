import React from 'react';
import { motion } from 'framer-motion';

export const FloatingLegend: React.FC<{ items?: { color:string; label:string }[] }>=({items=[]})=>{
  return (
    <motion.aside initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pointer-events-auto rounded-lg glass-panel p-3 shadow-lg text-sm">
      <div className="font-semibold mb-2">Legend</div>
      <div className="flex flex-col gap-2">
        {items.map((it, i)=> (
          <div key={i} className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full ring-1 ring-white/10" style={{background: it.color}} />
            <div className="text-xs text-muted-foreground">{it.label}</div>
          </div>
        ))}
      </div>
    </motion.aside>
  );
}

export default FloatingLegend;
