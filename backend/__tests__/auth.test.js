// backend/__tests__/auth.test.js
const request = require('supertest');
const { app } = require('../app');
const { connectTestDB, disconnectTestDB, clearTestDB } = require('./helpers/testDB');

beforeAll(async () => await connectTestDB());
afterAll(async () => await disconnectTestDB());
afterEach(async () => await clearTestDB());

describe('Auth — Register', () => {

  it('registers a new user and returns token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name:     'Test User',
        email:    'test@pulseops.com',
        password: 'password123',
        role:     'engineer',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user.email).toBe('test@pulseops.com');
    expect(res.body.user.role).toBe('engineer');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('rejects duplicate email', async () => {
    const userData = {
      name: 'User One', email: 'dup@pulseops.com',
      password: 'password123',
    };

    await request(app).post('/api/auth/register').send(userData);
    const res = await request(app).post('/api/auth/register').send(userData);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already registered/i);
  });

  it('rejects missing required fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'no-password@pulseops.com' });

    expect(res.statusCode).toBe(500);
  });
});

describe('Auth — Login', () => {

  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login Test', email: 'login@pulseops.com', password: 'mypassword',
    });
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@pulseops.com', password: 'mypassword' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('login@pulseops.com');
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@pulseops.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('rejects non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@pulseops.com', password: 'anything' });

    expect(res.statusCode).toBe(401);
  });
});

describe('Auth — Protected Routes', () => {

  let token;

  beforeEach(async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Protected', email: 'protected@pulseops.com', password: 'pass123',
    });
    token = res.body.token;
  });

  it('returns current user with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe('protected@pulseops.com');
  });

  it('rejects request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('rejects request with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken123');
    expect(res.statusCode).toBe(401);
  });
});