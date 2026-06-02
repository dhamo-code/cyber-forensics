const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    type: {
      type: String,
      enum: [
        'sql_injection', 'xss_attack', 'brute_force',
        'malicious_ip', 'suspicious_file',
        'unauthorized_access', 'anomaly_detected',
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ['new', 'acknowledged', 'resolved', 'false_positive'],
      default: 'new',
    },
    sourceIP: String,
    targetIP: String,
    url: String,
    payload: String,
    logId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Log',
    },
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
    },
    threatScore: { type: Number, min: 0, max: 100 },
    recommendations: [String],
    resolvedAt: Date,
  },
  { timestamps: true }
);

alertSchema.index({ severity: 1, status: 1 });
alertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);