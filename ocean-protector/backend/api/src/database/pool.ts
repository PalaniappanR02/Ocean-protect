import { Pool } from 'pg';
import { env } from '../config/env';

// Render's managed Postgres requires TLS. Local Docker/dev connects over
// plain TCP on localhost, so only enforce SSL against remote hosts.
const usesRemoteHost = !/localhost|127\.0\.0\.1/i.test(env.DATABASE_URL);

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: env.NODE_ENV === 'production' || usesRemoteHost ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle pg client', err);
  process.exit(-1);
});