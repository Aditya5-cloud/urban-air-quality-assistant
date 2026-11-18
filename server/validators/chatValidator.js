const { body, validationResult } = require('express-validator');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const validateChat = [
  body('sessionId')
    .trim()
    .notEmpty().withMessage('Session ID is required')
    .matches(UUID_REGEX).withMessage('Session ID must be a valid UUID'),

  body('message')
    .trim()
    .notEmpty().withMessage('Message text cannot be empty')
    .isLength({ min: 1, max: 500 }).withMessage('Message must be between 1 and 500 characters')
    .escape(),

  body('history')
    .optional()
    .isArray({ max: 10 }).withMessage('Conversation history cannot exceed 10 turns')
    .custom((history) => {
      if (!Array.isArray(history)) return true;
      for (const item of history) {
        if (!item || typeof item !== 'object') {
          throw new Error('History items must be objects');
        }
        if (!['user', 'assistant'].includes(item.role)) {
          throw new Error('History role must be either "user" or "assistant"');
        }
        if (typeof item.text !== 'string' || item.text.trim().length === 0 || item.text.length > 500) {
          throw new Error('History text must be non-empty and under 500 characters');
        }
      }
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid chat request parameters',
          details: errors.array().map((err) => ({
            field: err.path || err.param,
            message: err.msg,
            value: err.value,
          })),
        },
      });
    }
    next();
  },
];

module.exports = {
  validateChat,
};
