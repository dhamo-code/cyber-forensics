const ApiResponse = require('../utils/apiResponse');

function notFound(req, res) {
  return ApiResponse.error(
    res,
    `Route ${req.method} ${req.originalUrl} not found`,
    404
  );
}

module.exports = notFound;