import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const SeveritySelector: React.FC<{ options: string[]; value: string; onChange: (v:string)=>void }>=({options, value, onChange})=>{
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {options.map((opt)=>{
        const selected = value===opt;
        return (
          <motion.button key={opt} whileHover={{ scale:1.02 }} onClick={()=>onChange(opt)} type="button" className={cn('rounded-lg p-3 text-left', selected ? 'ring-2 ring-indigo-400 bg-white/6' : 'bg-white/4')}>
            <div className="font-medium text-sm">{opt}</div>
          </motion.button>
        );
      })}
    </div>
  );
}

export default SeveritySelector;
