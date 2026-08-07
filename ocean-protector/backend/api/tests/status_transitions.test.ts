import { describe, it, expect, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';

// Simulate an authenticated analyst for protected routes. Production auth
// middleware is untouched; this test double only exists for integration tests.
vi.mock('../src/common/middleware/auth', () => ({
  verifyToken: (req: any, _res: any, next: any) => {
    req.user = { id: 'test-analyst-user', role: 'analyst' };
    next();
  },
  requireRole: () => (_req: any, _res: any, next: any) => next(),
  attachUserIfPresent: (_req: any, _res: any, next: any) => next(),
}));

import { createApp } from '../src/app';
import { pool } from '../src/database/pool';
import { cleanDatabase, closeTestPool } from './setup';

const app = createApp();

afterAll(async () => {
  await closeTestPool();
  await pool.end();
});

describe('Report Status Transitions', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should reject invalid status transitions with 409', async () => {
    // Create report (starts as submitted)
    const createRes = await request(app)
      .post('/api/v1/reports')
      .send({
        clientReportId: "123e4567-e89b-12d3-a456-426614174100",
        hazardType: "high_waves",
        title: "Transition test",
        description: "Attempting an invalid transition.",
        latitude: 13.0827,
        longitude: 80.2707,
        observedAt: new Date().toISOString(),
        severity: "warning",
      });

    const reportId = createRes.body.data.id;

    // Attempt to go directly from 'submitted' to 'resolved' (Invalid)
    const patchRes = await request(app)
      .patch(`/api/v1/reports/${reportId}/status`)
      .send({ status: 'resolved', reason: 'Testing invalid transition' });

    expect(patchRes.status).toBe(409);
    expect(patchRes.body.error.code).toBe('CONFLICT');
  });

  it('should allow valid status transitions', async () => {
    const createRes = await request(app)
      .post('/api/v1/reports')
      .send({
        clientReportId: "123e4567-e89b-12d3-a456-426614174101",
        hazardType: "high_waves",
        title: "Valid transition test",
        description: "Attempting a valid transition.",
        latitude: 13.0827,
        longitude: 80.2707,
        observedAt: new Date().toISOString(),
        severity: "warning",
      });

    const reportId = createRes.body.data.id;

    // Move submitted -> under_review
    const patchRes = await request(app)
      .patch(`/api/v1/reports/${reportId}/status`)
      .send({ status: 'under_review', reason: 'Reviewing' });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.status).toBe('under_review');
  });
});
