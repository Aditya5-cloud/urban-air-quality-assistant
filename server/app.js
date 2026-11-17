const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');
const healthRoutes = require('./routes/health');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible integration in dev and testing
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration - allow designated client URL or localhost
const allowedOrigins = [env.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request payload size limit to prevent memory exhaustion attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logging (skip during test execution)
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api', healthRoutes);

// Fallback & error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
