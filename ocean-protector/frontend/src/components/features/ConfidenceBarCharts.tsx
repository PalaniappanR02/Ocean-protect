import { Progress } from '@/components/ui/progress';
import type { ConfidenceFactor } from '@/types';

export function ConfidenceBarChart({ factors }: { factors: ConfidenceFactor[] }) {
  return (
    <div className="space-y-3">
      {factors.map((factor, i) => {
        const percentage = factor.weight > 0 ? Math.round((factor.score / factor.weight) * 100) : 0;
        return (
          <div key={i}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-slate-300">{factor.name}</span>
              <span className="font-mono text-muted-foreground">
                {factor.score}/{factor.weight} ({percentage}%)
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        );
      })}
    </div>
  );
}