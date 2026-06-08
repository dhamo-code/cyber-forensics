const authService = require('../services/auth.service');
const paymentService = require('../services/payment.service');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

// Register
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!name || !email || !password) {
      return ApiResponse.error(
        res,
        'Name, email and password are required.',
        400
      );
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return ApiResponse.error(
        res,
        'Payment verification is required to register.',
        400
      );
    }

    if (password.length < 8) {
      return ApiResponse.error(
        res,
        'Password must be at least 8 characters.',
        400
      );
    }

    const isValidPayment = paymentService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidPayment) {
      return ApiResponse.error(res, 'Invalid payment signature.', 400);
    }

    const result = await authService.register(name, email, password, {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      amount: paymentService.REGISTRATION_AMOUNT,
      currency: 'INR',
    });

    logger.info(`New user registered: ${email}`);

    return ApiResponse.success(
      res,
      result,
      'Registration successful',
      201
    );
  } catch (err) {
    logger.error(`Register error: ${err.message}`);
    return ApiResponse.error(res, err.message, 400);
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return ApiResponse.error(
        res,
        'Email and password are required.',
        400
      );
    }

    const result = await authService.login(email, password);

    logger.info(`User logged in: ${email}`);

    return ApiResponse.success(res, result, 'Login successful');
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    return ApiResponse.error(res, err.message, 400);
  }
};

// Refresh Token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return ApiResponse.error(res, 'Refresh token required.', 400);
    }

    const result = await authService.refreshAccessToken(refreshToken);

    return ApiResponse.success(
      res,
      result,
      'Token refreshed successfully'
    );
  } catch (err) {
    logger.error(`Refresh token error: ${err.message}`);
    return ApiResponse.error(res, err.message, 400);
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(req.user._id, refreshToken);

    logger.info(`User logged out: ${req.user.email}`);

    return ApiResponse.success(res, null, 'Logged out successfully');
  } catch (err) {
    logger.error(`Logout error: ${err.message}`);
    return ApiResponse.error(res, err.message, 400);
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    return ApiResponse.success(
      res,
      { user: req.user },
      'User fetched successfully'
    );
  } catch (err) {
    logger.error(`GetMe error: ${err.message}`);
    return ApiResponse.error(res, err.message, 400);
  }
};