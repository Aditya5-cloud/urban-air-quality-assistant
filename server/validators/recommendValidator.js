const { body, validationResult } = require('express-validator');

const validateRecommend = [
  body('city')
    .trim()
    .notEmpty().withMessage('City is required')
    .isLength({ min: 2, max: 100 }).withMessage('City must be between 2 and 100 characters')
    .escape(),

  body('householdType')
    .trim()
    .notEmpty().withMessage('Household type is required')
    .isIn(['family', 'individual', 'elderly', 'student'])
    .withMessage('Household type must be one of: family, individual, elderly, student'),

  body('householdSize')
    .notEmpty().withMessage('Household size is required')
    .isInt({ min: 1, max: 15 }).withMessage('Household size must be an integer between 1 and 15')
    .toInt(),

  body('commute')
    .trim()
    .notEmpty().withMessage('Primary commute method is required')
    .isIn(['walk', 'cycle', 'public', 'car', 'wfh', 'mixed'])
    .withMessage('Commute must be one of: walk, cycle, public, car, wfh, mixed'),

  body('healthConcern')
    .notEmpty().withMessage('Health concern flag is required')
    .isBoolean().withMessage('Health concern must be a boolean')
    .toBoolean(),

  body('seasonContext')
    .trim()
    .notEmpty().withMessage('Season context is required')
    .isIn(['winter_smog', 'high_pollution', 'general'])
    .withMessage('Season context must be one of: winter_smog, high_pollution, general'),

  body('notes')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Lifestyle notes cannot exceed 500 characters')
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input parameters provided',
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
  validateRecommend,
};
