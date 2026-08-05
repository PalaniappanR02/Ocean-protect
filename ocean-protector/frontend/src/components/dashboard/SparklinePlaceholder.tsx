import React from 'react';

export function SparklinePlaceholder({ className = '' }: { className?: string }) {
  return (
    <div className={`h-6 w-24 rounded-md bg-gradient-to-r from-white/10 via-white/5 to-transparent ${className}`} aria-hidden />
  );
}
