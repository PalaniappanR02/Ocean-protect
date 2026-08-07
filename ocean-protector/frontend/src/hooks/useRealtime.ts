import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from './useSocket';

/**
 * Subscribes to the backend realtime events (report.*, incident.*, signal.*)
 * and invalidates the affected query groups so lists refresh live without a
 * full page reload. Pages opt in by calling useRealtime().
 */
export function useRealtime() {
  const { socket, connected } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const reportHandler = () => {
      void queryClient.invalidateQueries({ queryKey: ['reports'] });
      void queryClient.invalidateQueries({ queryKey: ['my-reports'] });
      void queryClient.invalidateQueries({ queryKey: ['reportStats'] });
      void queryClient.invalidateQueries({ queryKey: ['alerts'] });
    };
    const incidentHandler = () => {
      void queryClient.invalidateQueries({ queryKey: ['incidents'] });
      void queryClient.invalidateQueries({ queryKey: ['alerts'] });
    };
    const signalHandler = () => {
      void queryClient.invalidateQueries({ queryKey: ['social-signals'] });
      void queryClient.invalidateQueries({ queryKey: ['social-trends'] });
      void queryClient.invalidateQueries({ queryKey: ['social-hotspots'] });
    };

    socket.on('report.created', reportHandler);
    socket.on('report.statusChanged', reportHandler);
    socket.on('report.confidenceChanged', reportHandler);
    socket.on('incident.created', incidentHandler);
    socket.on('incident.statusChanged', incidentHandler);
    socket.on('incident.teamAssigned', incidentHandler);
    socket.on('signal.imported', signalHandler);

    return () => {
      socket.off('report.created', reportHandler);
      socket.off('report.statusChanged', reportHandler);
      socket.off('report.confidenceChanged', reportHandler);
      socket.off('incident.created', incidentHandler);
      socket.off('incident.statusChanged', incidentHandler);
      socket.off('incident.teamAssigned', incidentHandler);
      socket.off('signal.imported', signalHandler);
    };
  }, [socket, queryClient]);

  return { connected };
}
