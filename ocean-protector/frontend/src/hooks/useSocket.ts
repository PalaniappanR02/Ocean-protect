import { useSyncExternalStore } from 'react';
import { io, type Socket } from 'socket.io-client';
import { normaliseBaseUrl } from '@/services/api-client';

const SOCKET_URL = normaliseBaseUrl(
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000',
);

/**
 * A single shared socket.io connection for the whole app. Previously every
 * component that called useSocket() opened its own WebSocket (top bar, sidebar
 * and each page = 2-3 duplicate connections per view). The shared socket is
 * created once on first use and stays alive across route changes.
 */
let sharedSocket: Socket | null = null;
let connected = false;
const stateListeners = new Set<() => void>();

function emitChange() {
  stateListeners.forEach((listener) => listener());
}

function setConnected(value: boolean) {
  if (connected !== value) {
    connected = value;
    emitChange();
  }
}

function getSocket(): Socket {
  if (!sharedSocket) {
    sharedSocket = io(SOCKET_URL, { transports: ['websocket'], autoConnect: true });
    sharedSocket.on('connect', () => setConnected(true));
    sharedSocket.on('disconnect', () => setConnected(false));
    sharedSocket.on('connect_error', () => setConnected(false));
  }
  return sharedSocket;
}

function subscribe(listener: () => void) {
  getSocket(); // ensure the shared connection exists
  stateListeners.add(listener);
  return () => {
    stateListeners.delete(listener);
  };
}

function getConnectedSnapshot() {
  return connected;
}

export function useSocket() {
  const isConnected = useSyncExternalStore(subscribe, getConnectedSnapshot, () => false);
  return { socket: getSocket(), connected: isConnected };
}
