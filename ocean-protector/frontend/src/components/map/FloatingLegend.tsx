import React from 'react';
import { motion } from 'framer-motion';

export const FloatingLegend: React.FC<{ items?: { color:string; label:string }[] }>=({items=[]})=>{
  return (
    <motion.aside initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pointer-events-auto rounded-lg bg-white/6 p-3 backdrop-blur-md shadow-sm text-sm">
      <div className="font-semibold mb-2">Legend</div>
      <div className="flex flex-col gap-2">
        {items.map((it, i)=> (
          <div key={i} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{background: it.color}} />
            <div className="text-xs text-muted-foreground">{it.label}</div>
          </div>
        ))}
      </div>
    </motion.aside>
  );
}

export default FloatingLegend;
