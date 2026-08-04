export function LoadingSkeleton({ rows = 3, label = 'Loading content' }: { rows?: number; label?: string }) {
  return (
    <div className="space-y-3" role="status" aria-label={label}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="glass-panel rounded-2xl p-5">
          <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-100" />
          <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
