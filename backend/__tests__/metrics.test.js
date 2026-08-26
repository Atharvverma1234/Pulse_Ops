// backend/__tests__/metrics.test.js
const request = require('supertest');
const { app } = require('../app');
const { connectTestDB, disconnectTestDB, clearTestDB } = require('./helpers/testDB');

jest.mock('../utils/redisClient', () => ({
  getRedisClient: jest.fn().mockResolvedValue({
    lPush: jest.fn().mockResolvedValue(1),
    rPop:  jest.fn().mockResolvedValue(null),
    lLen:  jest.fn().mockResolvedValue(0),
  }),
}));

jest.mock('../services/anomalyProcessor', () => ({
  processAnomalies: jest.fn().mockResolvedValue(null),
  setIO:            jest.fn(),
}));

jest.mock('../services/alertEngine', () => ({
  evaluateMetrics: jest.fn().mockResolvedValue(null),
  setIO:           jest.fn(),
}));

// ── token refreshed before EVERY test ────────
let token;

beforeAll(async () => await connectTestDB());
afterAll(async () => await disconnectTestDB());

// Recreate user + token before each test
// so clearTestDB doesn't invalidate the token
beforeEach(async () => {
  await clearTestDB();
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name:     'Metric User',
      email:    'metrics@pulseops.com',
      password: 'pass123',
      role:     'engineer',
    });
  token = res.body.token;
});

describe('Metrics — Ingestion', () => {

  it('accepts a single metric', async () => {
    const res = await request(app)
      .post('/api/metrics')
      .send({
        host:    'server-01',
        cpu:     72.5,
        memory:  68.0,
        disk:    45.0,
        network: { in: 1024, out: 512 },
      });

    expect(res.statusCode).toBe(202);
    expect(res.body.message).toMatch(/accepted/i);
    expect(res.body.data.host).toBe('server-01');
  });

  it('accepts bulk metrics', async () => {
    const res = await request(app)
      .post('/api/metrics/bulk')
      .send({
        metrics: [
          { host: 'server-01', cpu: 40, memory: 50, disk: 30 },
          { host: 'server-02', cpu: 60, memory: 70, disk: 40 },
          { host: 'server-03', cpu: 80, memory: 85, disk: 55 },
        ],
      });

    expect(res.statusCode).toBe(202);
    expect(res.body.message).toMatch(/3 metrics accepted/i);
  });

  it('rejects metric missing required fields', async () => {
    const res = await request(app)
      .post('/api/metrics')
      .send({ host: 'server-01' });

    expect(res.statusCode).toBe(400);
  });
});

describe('Metrics — Querying', () => {

  beforeEach(async () => {
    const Metric = require('../models/Metric');
    await Metric.insertMany([
      { host: 'server-01', cpu: 40, memory: 50, disk: 30, network: { in: 100, out: 50  } },
      { host: 'server-01', cpu: 85, memory: 75, disk: 40, network: { in: 200, out: 100 } },
      { host: 'server-02', cpu: 30, memory: 40, disk: 25, network: { in: 50,  out: 25  } },
    ]);
  });

  it('returns paginated metrics', async () => {
    const res = await request(app)
      .get('/api/metrics?limit=10')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.total).toBe(3);
  });

  it('filters metrics by host', async () => {
    const res = await request(app)
      .get('/api/metrics?host=server-01')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data.every((m) => m.host === 'server-01')).toBe(true);
  });

  it('returns latest metric per host', async () => {
    const res = await request(app)
      .get('/api/metrics/latest')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('returns host stats', async () => {
    const res = await request(app)
      .get('/api/metrics/stats/server-01')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('avgCpu');
    expect(res.body.data).toHaveProperty('maxCpu');
    expect(res.body.data.count).toBe(2);
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/api/metrics');
    expect(res.statusCode).toBe(401);
  });
});