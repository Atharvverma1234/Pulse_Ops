// backend/__tests__/alertEngine.test.js
const { connectTestDB, disconnectTestDB, clearTestDB } = require('./helpers/testDB');

// Mock notification service
jest.mock('../services/notificationService', () => ({
  sendSlackNotification: jest.fn().mockResolvedValue(null),
  sendEmailNotification: jest.fn().mockResolvedValue(null),
}));

// Mock webhook service
jest.mock('../services/webhookService', () => ({
  onCriticalAlert: jest.fn().mockResolvedValue(null),
  onHighAlert:     jest.fn().mockResolvedValue(null),
}));

beforeAll(async () => await connectTestDB());
afterAll(async () => await disconnectTestDB());
afterEach(async () => await clearTestDB());

describe('Alert Engine — Threshold Evaluation', () => {

  it('creates alert when CPU exceeds critical threshold', async () => {
    const { evaluateMetrics } = require('../services/alertEngine');
    const Alert    = require('../models/Alert');
    const Incident = require('../models/Incident');

    const metrics = [{
      _id:    'test123',
      host:   'server-test',
      cpu:    95,     // above 90 critical threshold
      memory: 50,
      disk:   40,
      toObject: () => ({
        _id: 'test123', host: 'server-test',
        cpu: 95, memory: 50, disk: 40,
      }),
    }];

    await evaluateMetrics(metrics);

    const alerts    = await Alert.find({ host: 'server-test' });
    const incidents = await Incident.find({ host: 'server-test' });

    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].severity).toBe('critical');
    expect(alerts[0].metricType).toBe('cpu');
    expect(alerts[0].triggeredValue).toBe(95);

    // Auto-incident created for critical
    expect(incidents.length).toBeGreaterThan(0);
    expect(incidents[0].severity).toBe('critical');
  });

  it('does not create alert for normal metrics', async () => {
    const { evaluateMetrics } = require('../services/alertEngine');
    const Alert = require('../models/Alert');

    const metrics = [{
      _id:    'normal001',
      host:   'server-healthy',
      cpu:    40,
      memory: 50,
      disk:   30,
      toObject: () => ({ _id: 'normal001', host: 'server-healthy' }),
    }];

    await evaluateMetrics(metrics);

    const alerts = await Alert.find({ host: 'server-healthy' });
    expect(alerts).toHaveLength(0);
  });

  it('respects cooldown — no duplicate alerts', async () => {
    const { evaluateMetrics } = require('../services/alertEngine');
    const Alert = require('../models/Alert');

    const highCPUMetric = [{
      _id: 'dup001', host: 'server-dup',
      cpu: 96, memory: 50, disk: 40,
      toObject: () => ({ _id: 'dup001', host: 'server-dup' }),
    }];

    // Fire twice
    await evaluateMetrics(highCPUMetric);
    await evaluateMetrics(highCPUMetric);

    // Should only create one alert due to cooldown
    const alerts = await Alert.find({
      host: 'server-dup', metricType: 'cpu', severity: 'critical',
    });
    expect(alerts).toHaveLength(1);
  });
});