import fs from 'fs';
import path from 'path';
import { pool } from './pool';
import type { PoolClient } from 'pg';

const firstExistingDirectory = (candidates: string[]): string | null =>
  candidates.find((candidate) => fs.existsSync(candidate)) ?? null;

  const runSqlDirectory = async (
  client: PoolClient,
  directory: string,
  trackingTable: 'schema_migrations' | 'schema_seeds',
  ): Promise<void> => {
  
  if (!fs.existsSync(directory)) return;
  const files = fs.readdirSync(directory).filter((file) => file.endsWith('.sql')).sort();

  for (const file of files) {
    const applied = await client.query(
      `SELECT 1 FROM ${trackingTable} WHERE filename = $1`,
      [file],
    );
    if (applied.rows.length > 0) continue;

    const sql = fs.readFileSync(path.join(directory, file), 'utf8');
    console.log(`Running ${trackingTable === 'schema_migrations' ? 'migration' : 'seed'}: ${file}`);
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query(`INSERT INTO ${trackingTable} (filename) VALUES ($1)`, [file]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }
};

const runMigrations = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS schema_seeds (
        filename VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Works from source (backend/api/src/database -> backend/database),
    // compiled output (backend/api/dist/database -> backend/database), and
    // the local Docker image (cwd=/app -> /app/database). The repo root
    // backend/database must be preferred so stale api/database dirs cannot
    // shadow the real migrations.
    const databaseRoot = firstExistingDirectory([
      path.resolve(__dirname, '../../../database'),
      path.resolve(__dirname, '../../database'),
      path.resolve(process.cwd(), '../database'),
      path.resolve(process.cwd(), 'database'),
    ]);

    if (!databaseRoot) {
      throw new Error('Database directory not found. Expected backend/database or /app/database.');
    }

    await runSqlDirectory(client, path.join(databaseRoot, 'migrations'), 'schema_migrations');
    await runSqlDirectory(client, path.join(databaseRoot, 'seeds'), 'schema_seeds');
    console.log('Migrations and seeds completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

void runMigrations();
