const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const ApiResponse = require('../utils/apiResponse');

const router = express.Router();

// Every route below requires a valid session (protect) AND the admin
// role specifically (authorize('admin')) — enforced here on the
// backend, matching the same pattern your other protected routes use.
router.use(protect, authorize('admin'));

// GET /api/admin/users - list all users (paginated)
router.get('/users', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);

    const [users, total] = await Promise.all([
      User.find()
        .select('-password -refreshTokenHashes')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(),
    ]);

    return ApiResponse.success(res, {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/users/:id - update role or active status
router.patch('/users/:id', async (req, res, next) => {
  try {
    const { role, isActive } = req.body;
    const updates = {};

    // req.user is the full Mongoose doc here (set by `protect`), and
    // Mongoose documents expose `.id` as a string getter over `_id` —
    // safe to compare directly against req.params.id.
    const isSelf = req.params.id === req.user.id;

    if (role !== undefined) {
      if (!['admin', 'analyst', 'viewer'].includes(role)) {
        return ApiResponse.error(res, 'Invalid role', 400);
      }
      if (isSelf && role !== 'admin') {
        return ApiResponse.error(res, "You can't remove your own admin role", 400);
      }
      updates.role = role;
    }

    if (isActive !== undefined) {
      if (isSelf && isActive === false) {
        return ApiResponse.error(res, "You can't deactivate your own account", 400);
      }
      updates.isActive = isActive;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true })
      .select('-password -refreshTokenHashes');

    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    return ApiResponse.success(res, { user });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/stats - system-wide counts for the admin dashboard
router.get('/stats', async (req, res, next) => {
  try {
    const [totalUsers, activeUsers, adminCount, analystCount, viewerCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'analyst' }),
      User.countDocuments({ role: 'viewer' }),
    ]);

    return ApiResponse.success(res, {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      byRole: { admin: adminCount, analyst: analystCount, viewer: viewerCount },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;