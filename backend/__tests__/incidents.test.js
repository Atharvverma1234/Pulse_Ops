// backend/__tests__/incidents.test.js
const request = require('supertest');
const { app } = require('../app');
const { connectTestDB, disconnectTestDB, clearTestDB } = require('./helpers/testDB');

// Mock webhook service
jest.mock('../services/webhookService', () => ({
  onIncidentCreated:  jest.fn().mockResolvedValue(null),
  onIncidentUpdated:  jest.fn().mockResolvedValue(null),
  onIncidentResolved: jest.fn().mockResolvedValue(null),
  WEBHOOK_EVENTS:     {},
  getDeliveryLog:     jest.fn().mockReturnValue([]),
  fireWebhook:        jest.fn().mockResolvedValue(null),
}));

let token;
let adminToken;

beforeAll(async () => {
  await connectTestDB();

  const engineer = await request(app)
    .post('/api/auth/register')
    .send({
      name:     'Engineer',
      email:    'engineer@pulseops.com',
      password: 'pass123',
      role:     'engineer',
    });
  token = engineer.body.token;

  const admin = await request(app)
    .post('/api/auth/register')
    .send({
      name:     'Admin',
      email:    'admin@pulseops.com',
      password: 'pass123',
      role:     'admin',
    });
  adminToken = admin.body.token;

}, 60000); // ← 60 second timeout for this hook

afterAll(async () => await disconnectTestDB(), 30000);
afterEach(async () => {
  const Incident = require('../models/Incident');
  await Incident.deleteMany({});
});

describe('Incidents — CRUD', () => {

  it('creates an incident', async () => {
    const res = await request(app)
      .post('/api/incidents')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title:       'CPU spike on server-01',
        description: 'CPU at 95%',
        severity:    'critical',
        host:        'server-01',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.title).toBe('CPU spike on server-01');
    expect(res.body.data.severity).toBe('critical');
    expect(res.body.data.status).toBe('open');
    expect(res.body.data.timeline).toHaveLength(1);
  });

  it('lists incidents with pagination', async () => {
    const Incident = require('../models/Incident');
    await Incident.insertMany([
      { title: 'Inc 1', severity: 'low',    status: 'open' },
      { title: 'Inc 2', severity: 'medium', status: 'open' },
      { title: 'Inc 3', severity: 'high',   status: 'resolved' },
    ]);

    const res = await request(app)
      .get('/api/incidents?limit=10')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.total).toBe(3);
  });

  it('filters incidents by status', async () => {
    const Incident = require('../models/Incident');
    await Incident.insertMany([
      { title: 'Open 1',     status: 'open',     severity: 'low' },
      { title: 'Resolved 1', status: 'resolved', severity: 'low' },
    ]);

    const res = await request(app)
      .get('/api/incidents?status=open')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Open 1');
  });

  it('searches incidents by title', async () => {
    const Incident = require('../models/Incident');
    await Incident.insertMany([
      { title: 'CPU spike',     severity: 'high', status: 'open' },
      { title: 'Memory leak',   severity: 'high', status: 'open' },
      { title: 'Disk overflow', severity: 'low',  status: 'open' },
    ]);

    const res = await request(app)
      .get('/api/incidents?search=memory')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Memory leak');
  });
});

describe('Incidents — Lifecycle', () => {

  let incidentId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/incidents')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test incident', severity: 'high' });
    incidentId = res.body.data._id;
  });

  it('updates incident status to investigating', async () => {
    const res = await request(app)
      .patch(`/api/incidents/${incidentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'investigating' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('investigating');
    // Status change should add timeline entry
    expect(res.body.data.timeline.length).toBeGreaterThan(1);
  });

  it('sets resolvedAt when status becomes resolved', async () => {
    const res = await request(app)
      .patch(`/api/incidents/${incidentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'resolved' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.resolvedAt).not.toBeNull();
  });

  it('adds timeline note', async () => {
    const res = await request(app)
      .post(`/api/incidents/${incidentId}/timeline`)
      .set('Authorization', `Bearer ${token}`)
      .send({ note: 'Checked logs — no deployment found' });

    expect(res.statusCode).toBe(200);
    const lastNote = res.body.timeline[res.body.timeline.length - 1];
    expect(lastNote.note).toBe('Checked logs — no deployment found');
  });

  it('returns incident stats', async () => {
    const res = await request(app)
      .get('/api/incidents/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('byStatus');
    expect(res.body.data).toHaveProperty('bySeverity');
  });

  it('only admin can delete incident', async () => {
    const engineerDelete = await request(app)
      .delete(`/api/incidents/${incidentId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(engineerDelete.statusCode).toBe(403);

    const adminDelete = await request(app)
      .delete(`/api/incidents/${incidentId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminDelete.statusCode).toBe(200);
  });
});