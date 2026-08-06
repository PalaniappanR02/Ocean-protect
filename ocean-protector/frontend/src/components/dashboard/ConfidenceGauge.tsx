import React from 'react';
import { motion, useAnimation } from 'framer-motion';

interface ConfidenceGaugeProps {
  value: number; // 0-100
  size?: number;
}

export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({ value, size = 96 }) => {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, value));
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          <circle r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <motion.circle
            r={radius}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.9 }}
            style={{ transform: 'rotate(-90deg)' }}
          />
          <text textAnchor="middle" dy="6" className="text-sm font-semibold" fill="#fff">{progress}%</text>
        </g>
      </svg>
      <div>
        <div className="text-sm font-medium text-white/90">Confidence</div>
        <div className="text-xs text-muted-foreground">Model confidence across incoming reports</div>
      </div>
    </div>
  );
};

export default ConfidenceGauge;
