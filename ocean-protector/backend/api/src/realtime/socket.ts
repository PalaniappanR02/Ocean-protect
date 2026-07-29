import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { CORS_ALLOW_LIST } from '../config/constants';
import { env } from '../config/env';
import { normaliseBrowserOrigin } from '../config/urls';

export let io: SocketIOServer | null = null;

export const initSocketServer = (httpServer: HttpServer) => {
  const corsOrigins = Array.from(
    new Set([
      ...CORS_ALLOW_LIST,
      ...env.CORS_ORIGIN.split(',').map(normaliseBrowserOrigin).filter(Boolean),
    ]),
  );

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        const renderOriginAllowed =
          env.ALLOW_RENDER_ORIGINS && /^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(origin || '');
        if (!origin || corsOrigins.includes(origin) || renderOriginAllowed) callback(null, true);
        else callback(new Error('Not allowed by CORS'));
      },
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};