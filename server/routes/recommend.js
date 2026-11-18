const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { validateRecommend } = require('../validators/recommendValidator');
const GeminiService = require('../services/gemini');
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

    // Obtain GenAI recommendations tailored to user profile
    const aiOutput = await GeminiService.getRecommendations(profile);

    const sessionId = uuidv4();
    const sessionData = {
      _id: sessionId,
      profile,
      recommendations: {
        routines: aiOutput.routines,
        indoorHacks: aiOutput.indoorHacks,
        alternatives: aiOutput.alternatives,
        impacts: aiOutput.impacts,
      },
      chatHistory: [],
      createdAt: new Date(),
    };

    // Store in Session repository (MongoDB with fallback to in-memory)
    await SessionRepository.save(sessionData);

    res.status(200).json({
      success: true,
      sessionId,
      profile,
      recommendations: sessionData.recommendations,
      metadata: aiOutput.metadata,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
