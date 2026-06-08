const paymentService = require('../services/payment.service');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

exports.createRegistrationOrder = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return ApiResponse.error(res, 'Email is required.', 400);
    }

    const order = await paymentService.createRegistrationOrder(email);

    return ApiResponse.success(
      res,
      order,
      'Registration order created successfully'
    );
  } catch (err) {
    logger.error(`Create order error: ${err.message}`);
    return ApiResponse.error(res, err.message, 400);
  }
};
