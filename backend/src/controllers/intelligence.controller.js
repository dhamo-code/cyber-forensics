const abuseIPDB = require('../intelligence/abuseIPDB');
const virusTotal = require('../intelligence/virusTotal');
const geoIP = require('../intelligence/geoIP');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

exports.checkIP = async (req, res) => {
  try {
    const { ip } = req.body;
    if (!ip) {
      return ApiResponse.error(res, 'IP address is required', 400);
    }

    const [abuseResult, geoResult] = await Promise.all([
      abuseIPDB.checkIP(ip),
      geoIP.lookup(ip),
    ]);

    return ApiResponse.success(res, {
      ip,
      abuse: abuseResult,
      geo: geoResult,
    });
  } catch (err) {
    logger.error(`checkIP error: ${err.message}`);
    return ApiResponse.error(res, err.message);
  }
};

exports.checkFile = async (req, res) => {
  try {
    const { hash } = req.body;
    if (!hash) {
      return ApiResponse.error(res, 'File hash is required', 400);
    }

    const result = await virusTotal.checkFileHash(hash);
    return ApiResponse.success(res, result);
  } catch (err) {
    logger.error(`checkFile error: ${err.message}`);
    return ApiResponse.error(res, err.message);
  }
};

exports.checkURL = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return ApiResponse.error(res, 'URL is required', 400);
    }

    const result = await virusTotal.checkURL(url);
    return ApiResponse.success(res, result);
  } catch (err) {
    logger.error(`checkURL error: ${err.message}`);
    return ApiResponse.error(res, err.message);
  }
};

exports.geoLookup = async (req, res) => {
  try {
    const { ip } = req.params;
    const result = await geoIP.lookup(ip);
    return ApiResponse.success(res, result);
  } catch (err) {
    logger.error(`geoLookup error: ${err.message}`);
    return ApiResponse.error(res, err.message);
  }
};