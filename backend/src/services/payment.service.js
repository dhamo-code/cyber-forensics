const crypto = require('crypto');
const User = require('../models/User');

// Plain English explanation:
// This service handles all Razorpay payment operations.
// Two main jobs:
//   1. createRegistrationOrder — tells Razorpay "create an order for ₹499"
//      Razorpay gives back an order ID which we send to the frontend
//      The frontend uses this order ID to open the payment checkout
//   2. verifyPaymentSignature — after user pays, Razorpay sends us 3 values
//      We use HMAC-SHA256 to verify these values weren't tampered with
//      If the signature doesn't match, we reject the registration

// ₹499 = 49900 paise (Razorpay uses smallest currency unit)
const REGISTRATION_AMOUNT = parseInt(
  process.env.REGISTRATION_FEE_PAISE || '49900',
  10
);

const createRegistrationOrder = async (email) => {
  // Check Razorpay credentials are configured
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      'Payment system is not configured. Contact admin.'
    );
  }

  // Check email not already registered
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new Error('Email already registered');
  }

  // Dynamically require Razorpay only when needed
  // This prevents startup crash if package is missing
  let Razorpay;
  try {
    Razorpay = require('razorpay');
  } catch {
    throw new Error(
      'Razorpay package not installed. Run: npm install razorpay'
    );
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

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
    keyId: keyId, // Frontend needs this to open checkout
  };
};

// Verify Razorpay payment signature
// How it works:
//   Razorpay signs the payment with your secret key using HMAC-SHA256
//   We recreate that signature on our side
//   If both signatures match → payment is genuine
//   If they don't match → someone tampered with the data
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    throw new Error('Razorpay secret not configured');
  }

  // Razorpay's signature format is: orderId|paymentId
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  // Use timingSafeEqual to prevent timing attacks
  // (comparing strings character by character can leak info)
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature)
    );
  } catch {
    return false;
  }
};

module.exports = {
  createRegistrationOrder,
  verifyPaymentSignature,
  REGISTRATION_AMOUNT,
};