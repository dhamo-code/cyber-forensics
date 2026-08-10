const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
} = require('../controllers/auth.controller');

// Public routes — no JWT needed
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected routes — JWT required
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;