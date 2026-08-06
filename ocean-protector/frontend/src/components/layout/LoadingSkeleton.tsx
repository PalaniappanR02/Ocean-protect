export function LoadingSkeleton({ rows = 3, label = 'Loading content' }: { rows?: number; label?: string }) {
  return (
    <div className="space-y-3" role="status" aria-live="polite" aria-label={label}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="glass-panel rounded-2xl p-5">
          <div className="skeleton h-4 w-1/3" />
          <div className="skeleton mt-3 h-3 w-full" />
          <div className="skeleton mt-2 h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}
