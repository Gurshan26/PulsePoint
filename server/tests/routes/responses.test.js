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

describe('POST /api/responses/:datasetId', () => {
  it('returns 400 for invalid request bodies', async () => {
    expect((await request(app).post('/api/responses/demo-cx').send({ responses: [] })).status).toBe(400);
    expect((await request(app).post('/api/responses/demo-cx').send({ responses: 'not an array' })).status).toBe(400);
  });

  it('returns 400 for oversized batch', async () => {
    const res = await request(app)
      .post('/api/responses/demo-cx')
      .send({ responses: Array.from({ length: 2001 }, () => ({ date: '2026-04-01' })) });
    expect(res.status).toBe(400);
  });

  it('accepts a valid batch', async () => {
    const res = await request(app)
      .post('/api/responses/demo-cx')
      .send({
        responses: [
          { date: '2026-04-20', nps_score: 8, csat_score: 4, ces_score: 3, channel: 'Branch', touchpoint: 'Account Opening', segment: 'Retail' },
          { date: '2026-04-21', nps_score: 3, csat_score: 2, ces_score: 6, verbatim: 'Slow service', channel: 'Phone' }
        ]
      });
    expect(res.status).toBe(201);
    expect(res.body.imported).toBe(2);
  });
});
