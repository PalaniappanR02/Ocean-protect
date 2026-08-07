import { useSocket } from '@/hooks/useSocket';

/**
 * Compact, honest realtime indicator: a small pill that reads "Live" while the
 * socket is connected to the backend and "Reconnecting…" while it is not.
 * Replaces the previous hardcoded "Monitoring active" pill, which stayed green
 * even when the backend was unreachable.
 */
export function RealtimeStatusPill({ collapsed = false }: { collapsed?: boolean }) {
  const { connected } = useSocket();

  if (collapsed) {
    return (
      <div className="flex justify-center rounded-lg border bg-muted px-2 py-2" role="status" aria-label={connected ? 'Live' : 'Reconnecting'}>
        <span className={`inline-flex h-2 w-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} aria-hidden />
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-2.5 py-1"
      role="status"
      aria-live="polite"
    >
      <span
        className={`inline-flex h-1.5 w-1.5 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`}
        aria-hidden
      />
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {connected ? 'Live' : 'Reconnecting…'}
      </span>
    </div>
  );
}
