const rateLimit = require('express-rate-limit');
const env = require('../config/env');

/**
 * Rate limiter specifically protecting GenAI endpoints against model quota
 * exhaustion, automated scraping, and Denial of Service.
 * Default: 10 calls per minute per IP.
 */
const aiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS || 60000,
  max: env.RATE_LIMIT_MAX_REQUESTS || 10,
  standardHeaders: true, // Return RateLimit-* headers compliant with RFC draft-7
  legacyHeaders: false, // Disable X-RateLimit-* headers
  skip: (req) => {
    // In test environment, skip unless testing rate limiting explicitly
    return env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit'];
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests to the AI service from this IP. Please wait a minute before trying again.',
        retryAfterSeconds: Math.ceil((env.RATE_LIMIT_WINDOW_MS || 60000) / 1000),
      },
    });
  },
});

/**
 * General rate limiter protecting standard application and health endpoints.
 * Default: 100 calls per minute per IP.
 */
const generalRateLimiter = rateLimit({
  windowMs: 60000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests from this IP. Please wait before making further calls.',
      },
    });
  },
});

module.exports = {
  aiRateLimiter,
  generalRateLimiter,
};
