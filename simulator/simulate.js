// simulator/simulate.js
// Run this outside Docker: node simulator/simulate.js
const https = require('http');

const BACKEND_URL = 'http://localhost:5000';
const INTERVAL_MS = 5000; // push every 5 seconds

const HOSTS = [
  { name: 'server-01', service: 'api-gateway' },
  { name: 'server-02', service: 'auth-service' },
  { name: 'server-03', service: 'ml-worker' },
];

// Simulate realistic metric values with gradual drift
const state = {};
HOSTS.forEach((h) => {
  state[h.name] = { cpu: 30, memory: 40, disk: 50 };
});

// Random drift: nudges value up or down slightly each tick
const drift = (value, min, max, volatility = 5) => {
  const change = (Math.random() - 0.5) * volatility;
  return Math.min(max, Math.max(min, value + change));
};

// Occasionally spike a metric to simulate anomalies
const maybeSpikeMetric = (host, value) => {
  if (Math.random() < 0.05) { // 5% chance of spike
    console.log(`⚠ Spike on ${host}!`);
    return Math.min(100, value + 30);
  }
  return value;
};

const generateMetric = (host) => {
  const s = state[host.name];
  s.cpu = drift(s.cpu, 5, 95);
  s.memory = drift(s.memory, 10, 90, 3);
  s.disk = drift(s.disk, 20, 85, 1); // disk changes slowly
  s.cpu = maybeSpikeMetric(host.name, s.cpu);

  return {
    host: host.name,
    service: host.service,
    cpu: parseFloat(s.cpu.toFixed(2)),
    memory: parseFloat(s.memory.toFixed(2)),
    disk: parseFloat(s.disk.toFixed(2)),
    network: {
      in: Math.floor(Math.random() * 5000),
      out: Math.floor(Math.random() * 2000),
    },
  };
};

const postMetrics = () => {
  const metrics = HOSTS.map(generateMetric);

  const body = JSON.stringify({ metrics });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/metrics/bulk',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  const req = https.request(options, (res) => {
    console.log(
      `[${new Date().toISOString()}] Pushed ${metrics.length} metrics → ${res.statusCode}`
    );
    metrics.forEach((m) => {
      console.log(
        `  ${m.host}: CPU=${m.cpu}% MEM=${m.memory}% DISK=${m.disk}%`
      );
    });
  });

  req.on('error', (err) => console.error('Simulator error:', err.message));
  req.write(body);
  req.end();
};

console.log('Simulator started — pushing metrics every 5s');
console.log('Hosts:', HOSTS.map((h) => h.name).join(', '));
console.log('Press Ctrl+C to stop\n');

postMetrics(); // push immediately on start
setInterval(postMetrics, INTERVAL_MS);