const env = require('../config/env');

const notFoundHandler = (req, res, _next) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
      code: 'NOT_FOUND',
    },
  });
};

const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const isProduction = env.NODE_ENV === 'production';

  console.error(`[Error] ${req.method} ${req.originalUrl} - ${err.message}`);
  if (err.stack && !isProduction) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'INTERNAL_ERROR',
      details: err.details || null,
      ...(isProduction ? {} : { stack: err.stack }),
    },
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
