import React from 'react';

export const MapSkeleton: React.FC = ()=>{
  return (
    <div className="animate-pulse h-full w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg" aria-hidden>
      <div className="p-6 text-white">Loading map…</div>
    </div>
  );
}

export default MapSkeleton;
