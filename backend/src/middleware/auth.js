const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return ApiResponse.error(
      res,
      'Access denied. No token provided.',
      401
    );
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return ApiResponse.error(
        res,
        'User not found or deactivated.',
        401
      );
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 'Token expired.', 401, {
        code: 'TOKEN_EXPIRED',
      });
    }
    return ApiResponse.error(res, 'Invalid token.', 401);
  }
};

// Authorize roles - restrict access by role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `Role '${req.user.role}' is not authorized for this action.`,
        403
      );
    }
    next();
  };
};