import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Wind, Waves, Droplet } from 'lucide-react';

export function WeatherCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36 }} className="rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Weather</h3>
          <p className="mt-1 text-xs text-muted-foreground">Coastal conditions (placeholder)</p>
        </div>
        <div className="text-3xl font-bold">--°C</div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-yellow-400" />
          <div>
            <div className="font-medium">Wind</div>
            <div className="text-xs text-muted-foreground">-- km/h</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Waves className="h-5 w-5 text-cyan-400" />
          <div>
            <div className="font-medium">Wave Height</div>
            <div className="text-xs text-muted-foreground">-- m</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Droplet className="h-5 w-5 text-blue-400" />
          <div>
            <div className="font-medium">Humidity</div>
            <div className="text-xs text-muted-foreground">-- %</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="h-5 w-5 text-slate-400" />
          <div>
            <div className="font-medium">Visibility</div>
            <div className="text-xs text-muted-foreground">-- km</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
