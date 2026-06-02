const express = require('express');
const router = express.Router();
const {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  getCaseStats,
} = require('../controllers/cases.controller');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getCaseStats);
router.get('/', getCases);
router.post('/', createCase);
router.get('/:id', getCaseById);
router.put('/:id', updateCase);
router.delete('/:id', authorize('admin'), deleteCase);

module.exports = router;