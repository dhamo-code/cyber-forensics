const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    rawLog: { type: String, required: true },
    timestamp: { type: Date, required: true },
    sourceIP: String,
    method: String,
    url: String,
    statusCode: Number,
    userAgent: String,
    duration: Number,
    logType: {
      type: String,
      enum: ['apache', 'nginx', 'json', 'custom'],
      default: 'custom',
    },
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    fileHash: String,
    isAnalyzed: { type: Boolean, default: false },
    isSuspicious: { type: Boolean, default: false },
    threatIndicators: [
      {
        type: { type: String },
        confidence: Number,
        severity: String,
        matchedPattern: String,
      },
    ],
    threatScore: { type: Number, default: 0 },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
  },
  { timestamps: true }
);

logSchema.index({ timestamp: -1 });
logSchema.index({ sourceIP: 1 });
logSchema.index({ isSuspicious: 1 });
logSchema.index({ caseId: 1 });

module.exports = mongoose.model('Log', logSchema);