// scripts/loadtest.js
// Tests the metrics pipeline under concurrent load
// Run: node scripts/loadtest.js
const http = require('http');

const CONFIG = {
  host:          'localhost',
  port:          5000,
  path:          '/api/metrics/bulk',
  concurrency:   10,   // simultaneous requests
  totalRequests: 200,  // total requests to fire
  batchSize:     5,    // metrics per request
};

// ── Metric generator ──────────────────────────
const generateBatch = () => ({
  metrics: Array.from({ length: CONFIG.batchSize }, (_, i) => ({
    host:    `load-server-${(i % 3) + 1}`,
    cpu:     parseFloat((Math.random() * 100).toFixed(2)),
    memory:  parseFloat((Math.random() * 100).toFixed(2)),
    disk:    parseFloat((Math.random() * 100).toFixed(2)),
    network: {
      in:  Math.floor(Math.random() * 5000),
      out: Math.floor(Math.random() * 2000),
    },
  })),
});

// ── Single request ────────────────────────────
const makeRequest = () => {
  return new Promise((resolve) => {
    const body = JSON.stringify(generateBatch());
    const start = Date.now();

    const options = {
      hostname: CONFIG.host,
      port: CONFIG.port,
      path: CONFIG.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = http.request(options, (res) => {
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk.toString();
      });

      res.on('end', () => {
        const result = {
          success: res.statusCode < 400,
          statusCode: res.statusCode,
          latencyMs: Date.now() - start,
          responseBody,
        };

        if (!result.success) {
          console.log(
            `\n❌ Request failed: HTTP ${res.statusCode} → ${responseBody}`
          );
        }

        resolve(result);
      });
    });

    req.on('error', (error) => {
      console.log(`\n❌ Request error: ${error.message}`);

      resolve({
        success: false,
        statusCode: 0,
        latencyMs: Date.now() - start,
        responseBody: error.message,
      });
    });

    req.on('timeout', () => {
      req.destroy();

      console.log('\n❌ Request timeout');

      resolve({
        success: false,
        statusCode: 0,
        latencyMs: 5000,
        responseBody: 'Request timeout',
      });
    });

    req.setTimeout(5000);
    req.write(body);
    req.end();
  });
};

// ── Pool executor ─────────────────────────────
const runPool = async (total, concurrency) => {
  const results   = [];
  let   completed = 0;
  let   inFlight  = 0;
  let   queued    = 0;

  return new Promise((resolve) => {
    const tryLaunch = () => {
      while (inFlight < concurrency && queued < total) {
        inFlight++;
        queued++;

        makeRequest().then((result) => {
          results.push(result);
          completed++;
          inFlight--;

          // Progress
          if (completed % 20 === 0) {
            process.stdout.write(
              `\r  Progress: ${completed}/${total} (${Math.round(completed/total*100)}%)`
            );
          }

          if (completed === total) {
            process.stdout.write('\n');
            resolve(results);
          } else {
            tryLaunch();
          }
        });
      }
    };

    tryLaunch();
  });
};

// ── Stats calculator ──────────────────────────
const calcStats = (results) => {
  const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b);
  const successes = results.filter((r) => r.success).length;

  const p50 = latencies[Math.floor(latencies.length * 0.50)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const p99 = latencies[Math.floor(latencies.length * 0.99)];
  const avg = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);

  return { successes, p50, p95, p99, avg };
};

// ── Main ──────────────────────────────────────
(async () => {
  console.log('\nPulseOps Metrics Pipeline Load Test');
  console.log('=====================================');
  console.log(`Requests:    ${CONFIG.totalRequests}`);
  console.log(`Concurrency: ${CONFIG.concurrency}`);
  console.log(`Batch size:  ${CONFIG.batchSize} metrics/req`);
  console.log(`Total metrics: ${CONFIG.totalRequests * CONFIG.batchSize}`);
  console.log('');

  // Warmup
  console.log('Warming up (10 requests)...');
  await runPool(10, 2);

  // Main test
  console.log(`\nRunning load test...`);
  const startTime = Date.now();
  const results   = await runPool(CONFIG.totalRequests, CONFIG.concurrency);
  const totalTime = (Date.now() - startTime) / 1000;

  const stats = calcStats(results);

  console.log('\n=====================================');
  console.log('RESULTS');
  console.log('=====================================');
  console.log(`Total time:     ${totalTime.toFixed(2)}s`);
  console.log(`Throughput:     ${(CONFIG.totalRequests / totalTime).toFixed(1)} req/s`);
  console.log(`Metric ingest:  ${((CONFIG.totalRequests * CONFIG.batchSize) / totalTime).toFixed(0)} metrics/s`);
  console.log('');
  console.log(`Success:        ${stats.successes}/${CONFIG.totalRequests} (${((stats.successes/CONFIG.totalRequests)*100).toFixed(1)}%)`);
  console.log(`Failed:         ${CONFIG.totalRequests - stats.successes}`);
  console.log('');
  console.log(`Latency avg:    ${stats.avg}ms`);
  console.log(`Latency p50:    ${stats.p50}ms`);
  console.log(`Latency p95:    ${stats.p95}ms`);
  console.log(`Latency p99:    ${stats.p99}ms`);
  console.log('=====================================\n');

  const successRate = stats.successes / CONFIG.totalRequests;
  if (successRate >= 0.99 && stats.p95 < 500) {
    console.log('✅ Load test PASSED — pipeline is solid');
  } else if (successRate >= 0.95) {
    console.log('⚠️  Load test PARTIAL — check p95 latency');
  } else {
    console.log('❌ Load test FAILED — investigate errors');
  }
  console.log('');
})();