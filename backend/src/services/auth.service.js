const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

const register = async (
  name,
  email,
  password,
  paymentDetails = null
) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error('Email already registered');
  }

  const userData = {
    name,
    email,
    password,
    role: 'viewer',
  };

  if (paymentDetails) {
    userData.payment = {
      orderId: paymentDetails.orderId,
      paymentId: paymentDetails.paymentId,
      amount: paymentDetails.amount,
      currency: paymentDetails.currency || 'INR',
      status: 'completed',
      paidAt: new Date(),
    };
  }

  const user = await User.create(userData);

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  await User.findByIdAndUpdate(user._id, {
    $push: { refreshTokens: refreshToken }
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

const login = async (email, password) => {
  const user = await User.findOne({ email }).select(
    '+password +refreshTokens'
  );

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (user.isLocked()) {
    const waitMinutes = Math.ceil(
      (user.lockUntil - Date.now()) / 1000 / 60
    );
    throw new Error(
      `Account locked. Try again in ${waitMinutes} minutes.`
    );
  }

  if (!user.isActive) {
    throw new Error('Account deactivated. Contact admin.');
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      await user.save({ validateBeforeSave: false });
      throw new Error(
        'Too many failed attempts. Account locked for 15 minutes.'
      );
    }
    await user.save({ validateBeforeSave: false });
    throw new Error('Invalid email or password');
  }

  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLogin = new Date();

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshTokens = [
    ...(user.refreshTokens || []).slice(-4),
    refreshToken,
  ];
  await user.save({ validateBeforeSave: false });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin,
    },
    accessToken,
    refreshToken,
  };
};

const refreshAccessToken = async (refreshToken) => {
  let decoded;
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );
  } catch {
    throw new Error('Invalid refresh token');
  }

  const user = await User.findById(decoded.userId).select(
    '+refreshTokens'
  );

  if (!user || !user.refreshTokens.includes(refreshToken)) {
    throw new Error('Refresh token not found');
  }

  const newAccessToken = generateAccessToken(user._id, user.role);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshTokens = user.refreshTokens.filter(
    (t) => t !== refreshToken
  );
  user.refreshTokens.push(newRefreshToken);
  await user.save({ validateBeforeSave: false });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

const logout = async (userId, refreshToken) => {
  const user = await User.findById(userId).select('+refreshTokens');
  if (user) {
    user.refreshTokens = (user.refreshTokens || []).filter(
      (t) => t !== refreshToken
    );
    await user.save({ validateBeforeSave: false });
  }
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
};