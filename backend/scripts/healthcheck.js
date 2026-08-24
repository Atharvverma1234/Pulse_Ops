// backend/scripts/healthcheck.js
// Used by Docker HEALTHCHECK instruction
const http = require('http');

const options = {
  hostname: 'localhost',
  port:     process.env.PORT || 5000,
  path:     '/health',
  method:   'GET',
  timeout:  3000,
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0); // healthy
  } else {
    process.exit(1); // unhealthy
  }
});

req.on('error',   () => process.exit(1));
req.on('timeout', () => process.exit(1));
req.end();