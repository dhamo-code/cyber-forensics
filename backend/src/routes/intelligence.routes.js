const express = require('express');
const router = express.Router();
const {
  checkIP,
  checkFile,
  checkURL,
  geoLookup,
} = require('../controllers/intelligence.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/check-ip', checkIP);
router.post('/check-file', checkFile);
router.post('/check-url', checkURL);
router.get('/geo/:ip', geoLookup);

module.exports = router;