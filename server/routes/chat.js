const express = require('express');
const { validateChat } = require('../validators/chatValidator');
const GeminiService = require('../services/gemini');
const { SessionRepository } = require('../models/Session');

const router = express.Router();

router.post('/chat', validateChat, async (req, res, next) => {
  try {
    const { sessionId, message, history = [] } = req.body;

    const session = await SessionRepository.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found. Please generate an air quality plan first.',
        },
      });
    }

    // Call Gemini chat continuation with user profile context
    const aiResponse = await GeminiService.getChatReply(history, message, session.profile);

    const messagePair = [
      { role: 'user', text: message, timestamp: new Date() },
      { role: 'assistant', text: aiResponse.reply, timestamp: new Date() },
    ];

    await SessionRepository.appendChat(sessionId, messagePair);

    res.status(200).json({
      success: true,
      reply: aiResponse.reply,
      metadata: aiResponse.metadata,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
