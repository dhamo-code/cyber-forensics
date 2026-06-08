const crypto = require('crypto');
const reportService = require('../services/report.service');
const Report = require('../models/Report');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');
const fs = require('fs');

exports.generateReport = async (req, res) => {
  try {
    const { caseId } = req.body;
    const report = await reportService.generateReport(req.user._id, caseId);
    logger.info(`Report generated: ${report._id} by ${req.user.email}`);
    return ApiResponse.success(res, report, 'Report generated successfully', 201);
  } catch (err) {
    logger.error(`generateReport error: ${err.message}`);
    return ApiResponse.error(res, err.message);
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await reportService.getReports(
      req.user._id,
      req.user.role
    );
    return ApiResponse.success(res, reports);
  } catch (err) {
    logger.error(`getReports error: ${err.message}`);
    return ApiResponse.error(res, err.message);
  }
};

exports.downloadReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return ApiResponse.error(res, 'Report not found', 404);
    }
    if (!fs.existsSync(report.filePath)) {
      return ApiResponse.error(res, 'Report file not found', 404);
    }

    if (report.isEncrypted) {
      const key = crypto.scryptSync(
        process.env.JWT_SECRET || 'defaultkey',
        'salt',
        32
      );

      const encryptedData = fs.readFileSync(report.filePath);
      const iv = encryptedData.slice(0, 16);
      const encrypted = encryptedData.slice(16);

      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="report-${report._id}.pdf"`
      );
      return res.send(decrypted);
    }

    res.download(report.filePath, `report-${report._id}.pdf`);
  } catch (err) {
    logger.error(`downloadReport error: ${err.message}`);
    return ApiResponse.error(res, err.message);
  }
};