const crypto = require('crypto');
const Razorpay = require('razorpay');
const User = require('../models/User');

const REGISTRATION_AMOUNT = parseInt(
  process.env.REGISTRATION_FEE_PAISE || '49900',
  10
);

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are not configured');
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

const createRegistrationOrder = async (email) => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new Error('Email already registered');
  }

  const razorpay = getRazorpayInstance();

  const order = await razorpay.orders.create({
    amount: REGISTRATION_AMOUNT,
    currency: 'INR',
    receipt: `reg_${Date.now()}`,
    notes: {
      email: email.toLowerCase(),
      purpose: 'registration',
    },
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  };
};

const verifyPaymentSignature = (orderId, paymentId, signature) => {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  return expected === signature;
};

module.exports = {
  createRegistrationOrder,
  verifyPaymentSignature,
  REGISTRATION_AMOUNT,
};
