const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Log = require('../models/Log');
const Alert = require('../models/Alert');
const { parseLogFile } = require('../utils/logParser');
const { hashFile } = require('../utils/crypto');
const patternMatcher = require('../ai/patternMatcher');
const threatScorer = require('../ai/threatScorer');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

exports.uploadAndAnalyzeLogs = async (req, res) => {
  try {
    if (!req.file) {
      return ApiResponse.error(res, 'No file uploaded', 400);
    }

    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    const parsedLogs = parseLogFile(fileContent);

    if (parsedLogs.length === 0) {
      return ApiResponse.error(res, 'No valid log entries found in file', 400);
    }

    const fileHash = await hashFile(req.file.path);
    const savedLogs = [];
    const alertsCreated = [];

    for (const logEntry of parsedLogs.slice(0, 500)) {
      const threats = patternMatcher.scanLog(logEntry);
      const isSuspicious = threats.length > 0;
      let threatScore = 0;
      let severity = 'low';

      if (isSuspicious) {
        const scoreResult = threatScorer.calculateScore({
          attackType: threats[0]?.type,
          confidence: threats[0]?.confidence || 50,
        });
        threatScore = scoreResult.score;
        severity = scoreResult.severity;
      }

      const savedLog = await Log.create({
        ...logEntry,
        caseId: req.body.caseId || null,
        uploadedBy: req.user._id,
        fileHash,
        isAnalyzed: true,
        isSuspicious,
        threatIndicators: threats,
        threatScore,
        severity,
      });

      savedLogs.push(savedLog);

      // Create alert for high/critical threats
      if (isSuspicious && (severity === 'high' || severity === 'critical')) {
        const alert = await Alert.create({
          title: `${threats[0]?.type?.replace(/_/g, ' ').toUpperCase()} Detected`,
          description: `Suspicious activity detected from IP ${logEntry.sourceIP}`,
          severity,
          type: threats[0]?.type || 'anomaly_detected',
          sourceIP: logEntry.sourceIP,
          url: logEntry.url,
          payload: logEntry.rawLog?.substring(0, 200),
          logId: savedLog._id,
          caseId: req.body.caseId || null,
          threatScore,
          recommendations: threatScorer.getRecommendations(threats[0]?.type, threatScore),
        });
        alertsCreated.push(alert);
      }
    }

    const summary = {
      totalParsed: parsedLogs.length,
      totalSaved: savedLogs.length,
      suspicious: savedLogs.filter((l) => l.isSuspicious).length,
      alertsCreated: alertsCreated.length,
      critical: savedLogs.filter((l) => l.severity === 'critical').length,
      high: savedLogs.filter((l) => l.severity === 'high').length,
    };

    logger.info(`Logs analyzed: ${JSON.stringify(summary)}`);
    return ApiResponse.success(res, { summary, alerts: alertsCreated }, 'Logs analyzed successfully', 201);
  } catch (err) {
    logger.error(`uploadLogs error: ${err.message}`);
    return ApiResponse.error(res, err.message, 400);
  }
};

exports.getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, isSuspicious, severity } = req.query;
    const query = {};
    if (isSuspicious !== undefined) query.isSuspicious = isSuspicious === 'true';
    if (severity) query.severity = severity;
    if (req.user.role !== 'admin') {
      query.uploadedBy = req.user._id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      Log.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Log.countDocuments(query),
    ]);

    return ApiResponse.paginated(res, logs, total, page, limit);
  } catch (err) {
    logger.error(`getLogs error: ${err.message}`);
    return ApiResponse.error(res, err.message);
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const { page = 1, limit = 20, severity, status } = req.query;
    const query = {};
    if (severity) query.severity = severity;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [alerts, total] = await Promise.all([
      Alert.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Alert.countDocuments(query),
    ]);

    return ApiResponse.paginated(res, alerts, total, page, limit);
  } catch (err) {
    logger.error(`getAlerts error: ${err.message}`);
    return ApiResponse.error(res, err.message);
  }
};