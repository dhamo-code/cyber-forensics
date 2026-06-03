const express = require('express');
const router = express.Router();
const {
  generateReport,
  getReports,
  downloadReport,
} = require('../controllers/reports.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/generate', generateReport);
router.get('/', getReports);
router.get('/:id/download', downloadReport);

module.exports = router;