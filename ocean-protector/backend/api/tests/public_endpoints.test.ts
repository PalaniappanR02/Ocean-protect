import { describe, it, expect, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';

// Simulate an authenticated authority user for protected incident routes.
vi.mock('../src/common/middleware/auth', () => ({
  verifyToken: (req: any, _res: any, next: any) => {
    req.user = { id: 'test-authority-user', role: 'authority_supervisor' };
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

describe('Public Endpoint Privacy', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should NOT expose unverified reports on the public map', async () => {
    // Create a report (unverified by default)
    await request(app)
      .post('/api/v1/reports')
      .send({
        clientReportId: "123e4567-e89b-12d3-a456-426614174200",
        hazardType: "high_waves",
        title: "Public map privacy test",
        description: "This should not appear on the public map.",
        latitude: 13.0827,
        longitude: 80.2707,
        observedAt: new Date().toISOString(),
        severity: "warning",
      });

    const mapRes = await request(app).get('/api/v1/public/map');
    expect(mapRes.status).toBe(200);
    expect(mapRes.body.data.length).toBe(0); // Should be empty
  });

  it('should NOT expose reporter name on public incidents', async () => {
    // Create report with PII
    const reportRes = await request(app)
      .post('/api/v1/reports')
      .send({
        clientReportId: "123e4567-e89b-12d3-a456-426614174201",
        hazardType: "high_waves",
        title: "PII test",
        description: "Checking PII leakage.",
        reporterName: "John Doe",
        reporterPhone: "9999999999",
        isAnonymous: false,
        latitude: 13.0827,
        longitude: 80.2707,
        observedAt: new Date().toISOString(),
        severity: "warning",
      });

    const reportId = reportRes.body.data.id;

    // Manually verify report in DB to allow incident creation
    await pool.query(`UPDATE hazard_reports SET status = 'verified' WHERE id = $1`, [reportId]);

    // Create incident
    const incidentRes = await request(app)
      .post('/api/v1/incidents')
      .send({
        title: "Public Incident PII Test",
        hazardType: "high_waves",
        severity: "warning",
        latitude: 13.0827,
        longitude: 80.2707,
        reportIds: [reportId]
      });

    const incidentId = incidentRes.body.data.id;

    // Verify Incident (makes it public)
    await request(app).post(`/api/v1/incidents/${incidentId}/verify`).send({ actorName: "Test Analyst" });

    // Fetch from public endpoint
    const pubIncidentRes = await request(app).get(`/api/v1/public/incidents/${incidentId}`);

    expect(pubIncidentRes.status).toBe(200);
    // Ensure PII is not present in the incident public response
    expect(JSON.stringify(pubIncidentRes.body.data)).not.toContain('John Doe');
    expect(JSON.stringify(pubIncidentRes.body.data)).not.toContain('9999999999');
  });
});
