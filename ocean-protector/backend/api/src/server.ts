import http from 'http';
import { createApp } from './app';
import { initSocketServer } from './realtime/socket';
import { env } from './config/env';

const app = createApp();
const server = http.createServer(app);

export const io = initSocketServer(server);

server.listen(env.PORT, () => {
  console.log(`🚀 Kadalkavach API running on http://localhost:${env.PORT}`);
});

process.on('SIGTERM', () => {
  console.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.info('HTTP server closed');
    process.exit(0);
  });
});