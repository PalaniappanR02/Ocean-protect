import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { normaliseBaseUrl } from '@/services/api-client';

const SOCKET_URL = normaliseBaseUrl(
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000',
);

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = io(SOCKET_URL, { transports: ['websocket'], autoConnect: true });

    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    s.on('connect_error', () => setConnected(false));

    setSocket(s);
    return () => { s.close(); };
  }, []);

  return { socket, connected };
}