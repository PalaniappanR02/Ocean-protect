import http from 'http';
import { spawn } from 'child_process';
import path from 'path';
import { createApp } from './app';
import { initSocketServer } from './realtime/socket';
import { env } from './config/env';

const app = createApp();
const server = http.createServer(app);

export const io = initSocketServer(server);

server.listen(env.PORT, () => {
  console.log(`🚀 Kadalkavach API running on http://localhost:${env.PORT}`);
  scheduleDemoSeed();
});

/**
 * Grants demo-user roles on the Render database after the server is up.
 * Runs in the background (non-blocking) so a slow Supabase call can never
 * delay the port listener or fail Render's health check. Idempotent: it
 * reuses existing auth users and upserts their internal role.
 */
function scheduleDemoSeed() {
  // Run in any deployed environment (remote Postgres) even if NODE_ENV was
  // misconfigured as 'development' in the dashboard. Local Docker/dev uses a
  // localhost DB and keeps demo seeding opt-in.
  const isRemoteDb = !/localhost|127\.0\.0\.1/i.test(env.DATABASE_URL);
  if (env.NODE_ENV !== 'production' && !isRemoteDb) return;

  const seedPath = path.resolve(__dirname, 'scripts/seed-demo-users.js');
  const child = spawn(process.execPath, [seedPath], { stdio: 'inherit' });

  // Never let a hanging seed hurt the API process.
  const timeout = setTimeout(() => {
    console.warn('[demo-seed] Timed out after 90s — killing background seed.');
    child.kill('SIGKILL');
  }, 90_000);

  child.on('error', (err) => {
    clearTimeout(timeout);
    console.warn('[demo-seed] Could not start background seed:', err.message);
  });

  child.on('exit', (code) => {
    clearTimeout(timeout);
    console.log(`[demo-seed] Background seed exited with code ${code ?? 'unknown'}.`);
  });
}

process.on('SIGTERM', () => {
  console.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.info('HTTP server closed');
    process.exit(0);
  });
});