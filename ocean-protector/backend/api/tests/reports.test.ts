import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { pool } from '../src/database/pool';
import { cleanDatabase, closeTestPool } from './setup';

const app = createApp();

beforeAll(async () => {
  // Ensure schema exists before tests run
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "postgis";
  `);
  // Minimal schema recreation for test DB if it was cleared
  await pool.query(`
    CREATE TABLE IF NOT EXISTS coastal_regions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      state_code VARCHAR(50) NOT NULL,
      state_name VARCHAR(100) NOT NULL,
      district_name VARCHAR(100) NOT NULL,
      display_name VARCHAR(150) NOT NULL,
      primary_language_code VARCHAR(10) NOT NULL,
      secondary_language_codes JSONB DEFAULT '[]'::jsonb,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      location GEOGRAPHY(Point, 4326) NOT NULL,
      coastal_priority INT DEFAULT 1,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
});

afterAll(async () => {
  await closeTestPool();
  await pool.end();
});

describe('Reports API', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should create a valid report and return trackingId', async () => {
    const response = await request(app)
      .post('/api/v1/reports')
      .send({
        clientReportId: "123e4567-e89b-12d3-a456-426614174000",
        hazardType: "high_waves",
        title: "Unusually high waves near fishing zone",
        description: "Multiple large waves are approaching small fishing boats.",
        languageCode: "en",
        reporterName: "Demo Citizen",
        isAnonymous: false,
        latitude: 13.0827,
        longitude: 80.2707,
        locationAccuracyMetres: 20,
        locationSource: "device_gps",
        observedAt: "2024-05-20T10:30:00.000Z",
        severity: "warning",
        mediaUrls: []
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.trackingId).toBeDefined();
    expect(response.body.data.confidenceScore).toBeGreaterThan(0);
  });

  it('should prevent duplicate report creation via clientReportId', async () => {
    const payload = {
      clientReportId: "123e4567-e89b-12d3-a456-426614174001",
      hazardType: "coastal_flooding",
      title: "Water entering coastal road",
      description: "Seawater has entered the road near the fishing area.",
      languageCode: "en",
      latitude: 13.0827,
      longitude: 80.2707,
      observedAt: "2024-05-20T11:30:00.000Z",
      severity: "critical",
    };

    const firstRes = await request(app).post('/api/v1/reports').send(payload);
    expect(firstRes.status).toBe(201);
    
    const secondRes = await request(app).post('/api/v1/reports').send(payload);
    expect(secondRes.status).toBe(200);
    expect(secondRes.body.meta.duplicatePrevented).toBe(true);
  });

  it('should reject invalid coordinates', async () => {
    const response = await request(app)
      .post('/api/v1/reports')
      .send({
        clientReportId: "123e4567-e89b-12d3-a456-426614174002",
        hazardType: "high_waves",
        title: "Invalid coords test",
        description: "This should fail due to invalid latitude.",
        latitude: 999.99, // Invalid
        longitude: 80.2707,
        observedAt: "2024-05-20T10:30:00.000Z",
        severity: "warning",
      });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should reject invalid hazard type', async () => {
    const response = await request(app)
      .post('/api/v1/reports')
      .send({
        clientReportId: "123e4567-e89b-12d3-a456-426614174003",
        hazardType: "alien_invasion", // Invalid
        title: "Invalid hazard test",
        description: "This should fail due to invalid hazard type.",
        latitude: 13.0827,
        longitude: 80.2707,
        observedAt: "2024-05-20T10:30:00.000Z",
        severity: "warning",
      });

    expect(response.status).toBe(422);
  });

  it('should calculate sync delay and freshness band correctly', async () => {
    // Observed 5 hours ago (300 minutes) -> delayed band
    const oldDate = new Date(Date.now() - 5 * 3600000).toISOString();
    
    const response = await request(app)
      .post('/api/v1/reports')
      .send({
        clientReportId: "123e4567-e89b-12d3-a456-426614174004",
        hazardType: "high_waves",
        title: "Delayed report test",
        description: "This report was observed 5 hours ago.",
        latitude: 13.0827,
        longitude: 80.2707,
        observedAt: oldDate,
        severity: "warning",
      });

    expect(response.status).toBe(201);
    expect(response.body.data.syncDelayMinutes).toBeGreaterThan(250);
    expect(response.body.data.freshnessBand).toBe('delayed');
  });

  it('should persist confidence factors', async () => {
    const createRes = await request(app)
      .post('/api/v1/reports')
      .send({
        clientReportId: "123e4567-e89b-12d3-a456-426614174005",
        hazardType: "high_waves",
        title: "Confidence factors test",
        description: "Large waves approaching boats near harbor.",
        latitude: 13.0827,
        longitude: 80.2707,
        observedAt: new Date().toISOString(),
        severity: "warning",
      });

    const reportId = createRes.body.data.id;
    
    const confRes = await request(app).get(`/api/v1/reports/${reportId}/confidence`);
    expect(confRes.status).toBe(200);
    expect(confRes.body.data.factors.length).toBeGreaterThan(0);
    
    const submissionFactor = confRes.body.data.factors.find((f: any) => f.code === 'submission_base');
    expect(submissionFactor).toBeDefined();
    expect(submissionFactor.pointsAwarded).toBe(15);
  });
});