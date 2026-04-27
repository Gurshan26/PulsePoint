import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { resetDb, seedDataset } from '../testDb.js';

process.env.NODE_ENV = 'test';
process.env.DB_PATH = new URL('../tmp-test.db', import.meta.url).pathname;

const app = (await import('../../src/index.js')).default;
const db = (await import('../../src/db.js')).default;

beforeEach(() => {
  resetDb(db);
  seedDataset(db);
});

describe('GET /api/metrics/:datasetId', () => {
  it('returns metrics object and alerts', async () => {
    const res = await request(app).get('/api/metrics/demo-cx');
    expect(res.status).toBe(200);
    expect(res.body.metrics.nps.score).toBe(0);
    expect(Array.isArray(res.body.alerts)).toBe(true);
  });

  it('accepts date filters and exposes filters', async () => {
    const res = await request(app).get('/api/metrics/demo-cx?start=2026-04-01&end=2026-04-30');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.metrics.touchpoints)).toBe(true);
    expect(Array.isArray(res.body.metrics.segments)).toBe(true);
  });
});

describe('GET /api/metrics/:datasetId/touchpoints', () => {
  it('returns touchpoint breakdown', async () => {
    const res = await request(app).get('/api/metrics/demo-cx/touchpoints');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.touchpoints)).toBe(true);
    expect(res.body.touchpoints[0]).toHaveProperty('response_count');
  });
});
