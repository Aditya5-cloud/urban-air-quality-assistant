const express = require('express');
const morgan = require('morgan');
const env = require('./config/env');
const { configureHelmet, configureCors } = require('./middleware/security');
const { aiRateLimiter, generalRateLimiter } = require('./middleware/rateLimiter');
const healthRoutes = require('./routes/health');
const recommendRoutes = require('./routes/recommend');
const sessionRoutes = require('./routes/session');
const chatRoutes = require('./routes/chat');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security HTTP headers
app.use(configureHelmet());

// CORS configuration
app.use(configureCors());

// Rate limit general API traffic
app.use('/api', generalRateLimiter);

// Payload size limit to prevent memory exhaustion attacks (10kb maximum)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Middleware to catch payload-too-large errors from express.json
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({
      success: false,
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request payload exceeds the maximum allowed limit of 10kb',
      },
    });
  }
  next(err);
});

// Request logging (disabled during test suites)
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Routes - with aiRateLimiter applied to GenAI routes
app.use('/api', healthRoutes);
app.use('/api', aiRateLimiter, recommendRoutes);
app.use('/api', sessionRoutes);
app.use('/api', aiRateLimiter, chatRoutes);

// Fallback & central error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
