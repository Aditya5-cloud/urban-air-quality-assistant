const express = require('express');
const { SessionRepository } = require('../models/Session');

const router = express.Router();

router.get('/session/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SESSION_ID',
          message: 'Valid session ID is required',
        },
      });
    }

    const session = await SessionRepository.findById(id.trim());

    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Air quality session not found or has expired',
        },
      });
    }

    res.status(200).json({
      success: true,
      session: {
        id: session._id,
        profile: session.profile,
        recommendations: session.recommendations,
        chatHistory: session.chatHistory || [],
        createdAt: session.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
