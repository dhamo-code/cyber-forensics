const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportType: { type: String, enum: ['full', 'summary', 'alerts'], default: 'full' },
    filePath: String,
    fileSize: Number,
    status: { type: String, enum: ['generating', 'ready', 'failed'], default: 'generating' },
    isEncrypted: { type: Boolean, default: false },
    summary: {
      totalCases: Number,
      totalAlerts: Number,
      criticalThreats: Number,
      resolvedCases: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);