import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  label?: string;
  className?: string;
  fullScreen?: boolean;
}

export function LoadingOverlay({
  label = 'Loading...',
  className,
  fullScreen = false,
}: LoadingOverlayProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        'feedback-loading-overlay flex items-center justify-center rounded-2xl',
        fullScreen ? 'fixed inset-0 z-[80] rounded-none' : 'absolute inset-0 z-40',
        className
      )}
    >
      <div className="glass-panel flex items-center gap-3 rounded-xl px-4 py-3">
        <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  );
}
