import { describe, it, expect, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { pool } from '../src/database/pool';
import { cleanDatabase, closeTestPool } from './setup';

const app = createApp();

afterAll(async () => {
  await closeTestPool();
  await pool.end();
});

describe('Auth Guard (no fake role escalation)', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should reject report status changes without a token (401)', async () => {
    const createRes = await request(app)
      .post('/api/v1/reports')
      .send({
        clientReportId: "123e4567-e89b-12d3-a456-426614174300",
        hazardType: "high_waves",
        title: "Auth guard test",
        description: "Verifying that unauthenticated users cannot change status.",
        latitude: 13.0827,
        longitude: 80.2707,
        observedAt: new Date().toISOString(),
        severity: "warning",
      });

    const reportId = createRes.body.data.id;

    const patchRes = await request(app)
      .patch(`/api/v1/reports/${reportId}/status`)
      .send({ status: 'verified', reason: 'should not work' });

    expect(patchRes.status).toBe(401);
    expect(patchRes.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('should reject incident creation without a token (401)', async () => {
    const res = await request(app)
      .post('/api/v1/incidents')
      .send({
        title: "Unauthorized incident",
        hazardType: "high_waves",
        severity: "warning",
        latitude: 13.0827,
        longitude: 80.2707,
        reportIds: ["123e4567-e89b-12d3-a456-426614174301"],
      });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('should reject confidence recalculation without a token (401)', async () => {
    const createRes = await request(app)
      .post('/api/v1/reports')
      .send({
        clientReportId: "123e4567-e89b-12d3-a456-426614174302",
        hazardType: "high_waves",
        title: "Recalc auth guard test",
        description: "Verifying that unauthenticated users cannot recalculate confidence.",
        latitude: 13.0827,
        longitude: 80.2707,
        observedAt: new Date().toISOString(),
        severity: "warning",
      });

    const reportId = createRes.body.data.id;

    const recalcRes = await request(app)
      .post(`/api/v1/reports/${reportId}/recalculate-confidence`);

    expect(recalcRes.status).toBe(401);
    expect(recalcRes.body.error.code).toBe('UNAUTHENTICATED');
  });
});
