import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ConfidenceFactor } from '@/types';
import { Info } from 'lucide-react';

interface ConfidenceScoreProps {
  score: number;
  factors?: ConfidenceFactor[];
  explanation?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ConfidenceScore({ score, factors, explanation, size = 'md', showLabel = true }: ConfidenceScoreProps) {
  const color = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-amber-400' : score >= 40 ? 'text-orange-400' : 'text-red-400';
  const bgColor = score >= 80 ? 'bg-green-500/10 border-green-500/30' : score >= 60 ? 'bg-amber-500/10 border-amber-500/30' : score >= 40 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-red-500/10 border-red-500/30';
  const sizeClass = { sm: 'h-7 px-2 text-xs', md: 'h-9 px-3 text-sm', lg: 'h-11 px-4 text-base' }[size];

  const label = score >= 80 ? 'High' : score >= 60 ? 'Moderate' : score >= 40 ? 'Low' : 'Very Low';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('inline-flex items-center gap-2 rounded-lg border font-semibold', bgColor, color, sizeClass, 'cursor-help')}>
            <span className="font-mono">{score}%</span>
            {showLabel && <span className="font-medium opacity-80">{label}</span>}
            <Info className="h-3 w-3 opacity-50" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-sm">
          <div className="space-y-2">
            {explanation && <p className="text-xs">{explanation}</p>}
            {factors && factors.length > 0 && (
              <div className="space-y-1">
                {factors.map((f, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-muted-foreground">{f.name}</span>
                    <span className="font-mono font-medium">
                      {f.score}/{f.weight}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}