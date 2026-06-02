const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  uploadEvidence,
  getEvidenceByCase,
  verifyEvidence,
  deleteEvidence,
} = require('../controllers/evidence.controller');
const { protect } = require('../middleware/auth');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.use(protect);

router.post('/upload', upload.single('file'), uploadEvidence);
router.get('/case/:caseId', getEvidenceByCase);
router.get('/:id/verify', verifyEvidence);
router.delete('/:id', deleteEvidence);

module.exports = router;