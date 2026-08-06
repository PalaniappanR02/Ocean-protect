import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Layers, ZoomIn, ZoomOut, Maximize2, RotateCw } from 'lucide-react';

export const MapToolbar: React.FC<{
  onReset?: () => void;
  onLocate?: () => void;
  onToggleFilters?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}> = ({ onReset, onLocate, onToggleFilters, onZoomIn, onZoomOut }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="pointer-events-auto rounded-lg bg-white/6 p-2 backdrop-blur-md shadow-lg"
      role="toolbar"
      aria-label="Map controls"
    >
      <div className="flex flex-col gap-2">
        <button
          aria-label="Reset view"
          onClick={onReset}
          className="p-2 rounded-md hover:bg-white/8 focus-visible:outline-offset-2"
        >
          <Compass className="h-5 w-5" />
        </button>

        <button
          aria-label="Locate me"
          onClick={onLocate}
          className="p-2 rounded-md hover:bg-white/8 focus-visible:outline-offset-2"
        >
          <RotateCw className="h-5 w-5" />
        </button>

        <button
          aria-label="Toggle layers / filters"
          onClick={onToggleFilters}
          className="p-2 rounded-md hover:bg-white/8 focus-visible:outline-offset-2"
        >
          <Layers className="h-5 w-5" />
        </button>

        <div className="flex gap-1">
          <button aria-label="Zoom in" onClick={onZoomIn} className="p-2 rounded-md hover:bg-white/8 focus-visible:outline-offset-2">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button aria-label="Zoom out" onClick={onZoomOut} className="p-2 rounded-md hover:bg-white/8 focus-visible:outline-offset-2">
            <ZoomOut className="h-4 w-4" />
          </button>
        </div>

        <button aria-label="Fullscreen (placeholder)" className="p-2 rounded-md hover:bg-white/8 focus-visible:outline-offset-2">
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default MapToolbar;
