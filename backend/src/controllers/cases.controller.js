const casesService = require('../services/cases.service');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

exports.getCases = async (req, res) => {
  try {
    const result = await casesService.getCases(
      req.query,
      req.user._id,
      req.user.role
    );
    return ApiResponse.paginated(
      res,
      result.cases,
      result.total,
      result.page,
      result.limit
    );
  } catch (err) {
    logger.error(`getCases error: ${err.message}`);
    return ApiResponse.error(res, err.message);
  }
};

exports.getCaseById = async (req, res) => {
  try {
    const caseItem = await casesService.getCaseById(req.params.id);
    if (!caseItem) {
      return ApiResponse.error(res, 'Case not found', 404);
    }
    return ApiResponse.success(res, caseItem);
  } catch (err) {
    logger.error(`getCaseById error: ${err.message}`);
    return ApiResponse.error(res, err.message);
  }
};

exports.createCase = async (req, res) => {
  try {
    const { title, description, priority, attackType, affectedSystems, sourceIPs } = req.body;

    if (!title || !description) {
      return ApiResponse.error(res, 'Title and description are required', 400);
    }

    const newCase = await casesService.createCase({
      title,
      description,
      priority,
      attackType,
      affectedSystems,
      sourceIPs,
      createdBy: req.user._id,
    });

    logger.info(`Case created: ${newCase.caseNumber} by ${req.user.email}`);
    return ApiResponse.success(res, newCase, 'Case created successfully', 201);
  } catch (err) {
    logger.error(`createCase error: ${err.message}`);
    return ApiResponse.error(res, err.message, 400);
  }
};

exports.updateCase = async (req, res) => {
  try {
    const updated = await casesService.updateCase(req.params.id, req.body);
    if (!updated) {
      return ApiResponse.error(res, 'Case not found', 404);
    }
    return ApiResponse.success(res, updated, 'Case updated successfully');
  } catch (err) {
    logger.error(`updateCase error: ${err.message}`);
    return ApiResponse.error(res, err.message, 400);
  }
};

exports.deleteCase = async (req, res) => {
  try {
    await casesService.deleteCase(req.params.id);
    return ApiResponse.success(res, null, 'Case deleted successfully');
  } catch (err) {
    logger.error(`deleteCase error: ${err.message}`);
    return ApiResponse.error(res, err.message);
  }
};

exports.getCaseStats = async (req, res) => {
  try {
    const stats = await casesService.getCaseStats();
    return ApiResponse.success(res, stats);
  } catch (err) {
    logger.error(`getCaseStats error: ${err.message}`);
    return ApiResponse.error(res, err.message);
  }
};