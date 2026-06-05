const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  resource: String,
  method: String,
  endpoint: String,
  ipAddress: String,
  userAgent: String,
  statusCode: Number,
  timestamp: { type: Date, default: Date.now },
});

auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);