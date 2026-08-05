import React from 'react';
import { Sun, CloudRain, Wind } from 'lucide-react';

export const WeatherWidget: React.FC = ()=>{
  return (
    <div className="pointer-events-auto rounded-lg bg-white/6 p-3 backdrop-blur-md shadow-sm text-sm">
      <div className="flex items-center gap-2">
        <Sun className="h-5 w-5" />
        <div>
          <div className="font-semibold">24°C</div>
          <div className="text-xs text-muted-foreground">Wind 12 km/h · Waves 1.2m</div>
        </div>
      </div>
    </div>
  );
}

export default WeatherWidget;
