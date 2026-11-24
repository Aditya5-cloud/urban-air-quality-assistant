const express = require('express');
const env = require('../config/env');
const { aiCache } = require('../cache/aiCache');

const router = express.Router();

router.get('/health', (req, res) => {
  const hasAiKey = Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '' && env.GEMINI_API_KEY !== 'your_gemini_api_key_here');

  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    cache: aiCache.stats(),
    services: {
      database: 'in-memory-ttl',
      geminiConfigured: hasAiKey,
      weatherAqiProvider: 'open-meteo-live',
      aiCacheProvider: 'sha256-lru',
    },
  });
});

module.exports = router;
