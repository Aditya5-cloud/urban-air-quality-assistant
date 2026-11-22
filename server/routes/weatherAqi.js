const express = require('express');
const { query, validationResult } = require('express-validator');
const WeatherAqiService = require('../services/weatherAqi');

const router = express.Router();

router.get(
  '/weather-aqi',
  [
    query('city')
      .trim()
      .notEmpty().withMessage('City parameter is required')
      .isLength({ min: 2, max: 100 }).withMessage('City must be between 2 and 100 characters')
      .escape(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid city parameter',
            details: errors.array(),
          },
        });
      }

      const city = req.query.city;
      const data = await WeatherAqiService.getLiveAtmosphericData(city);

      res.status(200).json({
        success: true,
        atmospheric: data,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
