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

describe('GET /api/trends/:datasetId', () => {
  it('returns trend arrays for supported metrics', async () => {
    for (const metric of ['nps', 'csat', 'ces', 'volume', 'sentiment']) {
      const res = await request(app).get(`/api/trends/demo-cx?metric=${metric}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.trend)).toBe(true);
      expect(res.body.metric).toBe(metric);
    }
  });

  it('rejects invalid metric', async () => {
    const res = await request(app).get('/api/trends/demo-cx?metric=banana');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid metric/);
  });

  it('includes annotations', async () => {
    const res = await request(app).get('/api/trends/demo-cx?metric=nps');
    expect(Array.isArray(res.body.annotations)).toBe(true);
    expect(res.body.annotations[0].label).toBe('Test annotation');
  });
});
