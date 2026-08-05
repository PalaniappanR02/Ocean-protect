import { motion } from 'framer-motion';
import type { ConfidenceFactor } from '@/types';

export function ConfidenceBarChart({ factors }: { factors: ConfidenceFactor[] }) {
  return (
    <div className="space-y-4">
      {factors.map((factor, i) => {
        const percentage = factor.weight > 0 ? Math.round((factor.score / factor.weight) * 100) : 0;
        const color = percentage >= 80 ? 'var(--color-success)' : percentage >= 60 ? 'var(--color-accent)' : percentage >= 40 ? 'var(--color-warning)' : 'var(--color-danger)';
        return (
          <div key={i}>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-slate-300">{factor.name}</span>
              <span className="font-mono text-muted-foreground">{factor.score}/{factor.weight} · {percentage}%</span>
            </div>

            <div className="w-full h-3 rounded-full bg-white/6 overflow-hidden" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8 }}
                style={{ background: `linear-gradient(90deg, ${color}, color-mix(in oklch, ${color} 30%, #fff 70%))` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}