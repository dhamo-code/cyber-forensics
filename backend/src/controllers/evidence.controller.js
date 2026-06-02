const evidenceService = require('../services/evidence.service');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

exports.uploadEvidence = async (req, res) => {
  try {
    if (!req.file) {
      return ApiResponse.error(res, 'No file uploaded', 400);
    }
    if (!req.body.caseId || !req.body.title || !req.body.type) {
      return ApiResponse.error(res, 'caseId, title and type are required', 400);
    }

    const evidence = await evidenceService.uploadEvidence(
      req.file,
      req.body,
      req.user._id
    );

    logger.info(`Evidence uploaded: ${evidence._id} for case ${req.body.caseId}`);
    return ApiResponse.success(res, evidence, 'Evidence uploaded successfully', 201);
  } catch (err) {
    logger.error(`uploadEvidence error: ${err.message}`);
    return ApiResponse.error(res, err.message, 400);
  }
};

exports.getEvidenceByCase = async (req, res) => {
  try {
    const evidence = await evidenceService.getEvidenceByCase(req.params.caseId);
    return ApiResponse.success(res, evidence);
  } catch (err) {
    logger.error(`getEvidenceByCase error: ${err.message}`);
    return ApiResponse.error(res, err.message);
  }
};

exports.verifyEvidence = async (req, res) => {
  try {
    const result = await evidenceService.verifyEvidence(req.params.id);
    return ApiResponse.success(res, result, 'Integrity check complete');
  } catch (err) {
    logger.error(`verifyEvidence error: ${err.message}`);
    return ApiResponse.error(res, err.message);
  }
};

exports.deleteEvidence = async (req, res) => {
  try {
    await evidenceService.deleteEvidence(req.params.id);
    return ApiResponse.success(res, null, 'Evidence deleted successfully');
  } catch (err) {
    logger.error(`deleteEvidence error: ${err.message}`);
    return ApiResponse.error(res, err.message);
  }
};