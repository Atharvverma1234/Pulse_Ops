const rateLimit = require('express-rate-limit');

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Metrics ingestion has a higher limit
const metricsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 2000,
  message: {
    message: 'Too many metric ingestion requests',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: 'Too many login attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  metricsLimiter,
  authLimiter,
};