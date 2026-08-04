import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FormStepIndicator({
  steps,
  currentStep,
}: {
  steps: readonly string[];
  currentStep: number;
}) {
  return (
    <nav aria-label="Report progress" className="report-progress sticky top-[84px] z-10 mb-6 p-2 sm:p-3">
      <ol className="flex gap-2 overflow-x-auto">
        {steps.map((label, index) => {
          const complete = index < currentStep;
          const current = index === currentStep;
          return (
            <li
              key={label}
              aria-current={current ? 'step' : undefined}
              data-current={current}
              data-complete={complete}
              className="report-progress__step flex min-w-max flex-1 items-center gap-2 px-3 py-2 text-xs font-semibold"
            >
              <span className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full border text-[11px]',
                current && 'border-primary',
                complete && 'border-green-400 bg-green-50',
              )}>
                {complete ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
              </span>
              {label}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
