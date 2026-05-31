const logger = require('../utils/logger');
const ApiResponse = require('../utils/apiResponse');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let message = err.message || 'Something went wrong';
  let statusCode = err.statusCode || 500;

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join(', ');
    statusCode = 400;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
    statusCode = 409;
  }

  if (err.name === 'CastError') {
    message = 'Invalid ID format';
    statusCode = 400;
  }

  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Token expired';
    statusCode = 401;
  }

  logger.error(`${req.method} ${req.originalUrl} → ${message}`);

  return res.status(statusCode).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
  });
}

module.exports = errorHandler;