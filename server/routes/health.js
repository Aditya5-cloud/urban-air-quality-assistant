const express = require('express');
const { isDbConnected } = require('../config/db');
const env = require('../config/env');

const router = express.Router();

router.get('/health', (req, res) => {
  const dbStatus = isDbConnected() ? 'connected' : 'disconnected';
  const hasAiKey = Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '');

  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    services: {
      database: dbStatus,
      geminiConfigured: hasAiKey,
    },
  });
});

module.exports = router;
