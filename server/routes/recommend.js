const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { validateRecommend } = require('../validators/recommendValidator');
const GeminiService = require('../services/gemini');
const WeatherAqiService = require('../services/weatherAqi');
const { SessionRepository } = require('../models/Session');
const { aiCache } = require('../cache/aiCache');

const router = express.Router();

router.post('/recommend', validateRecommend, async (req, res, next) => {
  try {
    const profile = {
      city: req.body.city,
      householdType: req.body.householdType,
      householdSize: req.body.householdSize,
      commute: req.body.commute,
      healthConcern: req.body.healthConcern,
      seasonContext: req.body.seasonContext,
      notes: req.body.notes || '',
    };

    // Obtain real-time live atmospheric measurements (PM2.5, US AQI, temperature)
    const atmospheric = await WeatherAqiService.getLiveAtmosphericData(profile.city);

    // Compute deterministic hash key for AI caching
    const aqiBucket = Math.round((atmospheric?.airQuality?.us_aqi || 150) / 25) * 25;
    const cacheKey = aiCache.hashKey({
      city: profile.city.toLowerCase().trim(),
      householdType: profile.householdType,
      commute: profile.commute,
      healthConcern: profile.healthConcern,
      aqiBucket,
    });

    let aiOutput = aiCache.get(cacheKey);
    let isCacheHit = true;

    if (!aiOutput) {
      isCacheHit = false;
      aiOutput = await GeminiService.getRecommendations(profile, atmospheric);
      aiCache.set(cacheKey, aiOutput);
    }

    const sessionId = uuidv4();
    const sessionData = {
      _id: sessionId,
      profile,
      atmospheric,
      recommendations: {
        routines: aiOutput.routines,
        indoorHacks: aiOutput.indoorHacks,
        alternatives: aiOutput.alternatives,
        impacts: aiOutput.impacts,
      },
      chatHistory: [],
      createdAt: new Date(),
    };

    // Store in Session repository
    await SessionRepository.save(sessionData);

    res.status(200).json({
      success: true,
      sessionId,
      profile,
      atmospheric,
      recommendations: sessionData.recommendations,
      metadata: {
        ...(aiOutput.metadata || {}),
        cached: isCacheHit,
        cacheKey,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
