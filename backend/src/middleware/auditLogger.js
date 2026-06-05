const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

const auditLogger = (req, res, next) => {
  const originalSend = res.json.bind(res);

  res.json = function (data) {
    AuditLog.create({
      userId: req.user?._id,
      action: `${req.method} ${req.originalUrl}`,
      method: req.method,
      endpoint: req.originalUrl,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      statusCode: res.statusCode,
      timestamp: new Date(),
    }).catch((err) => logger.error(`Audit log error: ${err.message}`));

    return originalSend(data);
  };

  next();
};

module.exports = auditLogger;