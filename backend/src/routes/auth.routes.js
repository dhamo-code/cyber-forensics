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

// Debug middleware
router.use((req, res, next) => {
  console.log('Auth route hit:', req.method, req.path);
  next();
});

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;