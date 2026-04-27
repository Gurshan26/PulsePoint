import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { resetDb, seedDataset } from '../testDb.js';

process.env.NODE_ENV = 'test';
process.env.DB_PATH = new URL('../tmp-test.db', import.meta.url).pathname;
delete process.env.GEMINI_API_KEY;

const app = (await import('../../src/index.js')).default;
const db = (await import('../../src/db.js')).default;

beforeEach(() => {
  resetDb(db);
  seedDataset(db);
});

describe('GET /api/insights/:datasetId', () => {
  it('returns insights array', async () => {
    const res = await request(app).get('/api/insights/demo-cx');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.insights)).toBe(true);
  });
});

describe('POST /api/insights/:datasetId/generate', () => {
  it('generates summary insights in mock mode', async () => {
    const res = await request(app)
      .post('/api/insights/demo-cx/generate')
      .send({ type: 'summary', period: 'Last 90 days' });
    expect(res.status).toBe(200);
    expect(res.body.summary.headline).toBeTruthy();
  });

  it('generates all insight types', async () => {
    const res = await request(app)
      .post('/api/insights/demo-cx/generate')
      .send({ type: 'all', period: 'Last 90 days' });
    expect(res.status).toBe(200);
    expect(res.body.themes.clusters).toBeDefined();
    expect(res.body.priorities.issues).toBeDefined();
    expect(res.body.summary.headline).toBeDefined();
  });
});
