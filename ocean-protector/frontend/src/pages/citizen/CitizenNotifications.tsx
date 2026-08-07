import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { notificationService } from '@/services/notification-service';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/layout/EmptyState';
import { LoadingSkeleton } from '@/components/layout/LoadingSkeleton';
import { formatRelativeTime } from '@/lib/utils';

export function CitizenNotifications() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.list(),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markOneMutation = useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <div className="animate-fade-in mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        description="Official alerts and updates about your coastal safety account."
        icon={Bell}
      />

      <div className="mt-8">
        {isLoading ? (
          <LoadingSkeleton rows={4} label="Loading notifications" />
        ) : isError ? (
          <EmptyState
            icon={Bell}
            title="Notifications unavailable"
            description="Could not load your notifications right now. Please try again shortly."
          />
        ) : !data?.items.length ? (
          <EmptyState
            icon={CheckCircle2}
            title="You're all caught up"
            description="Official alerts and activity updates about your reports will appear here."
          />
        ) : (
          <div className="space-y-3">
            {data.unread > 0 && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllMutation.mutate()}
                  disabled={markAllMutation.isPending}
                >
                  <CheckCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                  Mark all as read
                </Button>
              </div>
            )}
            {data.items.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => !n.isRead && markOneMutation.mutate(n.id)}
                disabled={n.isRead}
                className={`glass-panel block w-full rounded-xl p-4 text-left transition-opacity ${n.isRead ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{n.title}</p>
                      {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-500" aria-label="Unread" />}
                    </div>
                    {n.body && <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>}
                    <p className="mt-1.5 text-[11px] uppercase tracking-wide text-muted-foreground/70">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
