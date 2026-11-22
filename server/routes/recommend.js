const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { validateRecommend } = require('../validators/recommendValidator');
const GeminiService = require('../services/gemini');
const WeatherAqiService = require('../services/weatherAqi');
const { SessionRepository } = require('../models/Session');

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

    // Obtain GenAI recommendations tailored to user profile and live atmospheric data
    const aiOutput = await GeminiService.getRecommendations(profile, atmospheric);

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
      metadata: aiOutput.metadata,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
