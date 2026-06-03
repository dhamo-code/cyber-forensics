const axios = require('axios');

const checkIP = async (ipAddress) => {
  // Skip private IPs
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^127\./,
  ];

  if (privateRanges.some((r) => r.test(ipAddress))) {
    return {
      ip: ipAddress,
      isPrivate: true,
      abuseScore: 0,
      isMalicious: false,
      message: 'Private IP address',
    };
  }

  try {
    const response = await axios.get(
      'https://api.abuseipdb.com/api/v2/check',
      {
        headers: {
          Key: process.env.ABUSEIPDB_API_KEY,
          Accept: 'application/json',
        },
        params: {
          ipAddress,
          maxAgeInDays: 90,
        },
      }
    );

    const data = response.data.data;
    return {
      ip: data.ipAddress,
      abuseScore: data.abuseConfidenceScore,
      country: data.countryCode,
      isp: data.isp,
      totalReports: data.totalReports,
      lastReportedAt: data.lastReportedAt,
      isMalicious: data.abuseConfidenceScore >= 50,
      riskLevel:
        data.abuseConfidenceScore >= 80
          ? 'critical'
          : data.abuseConfidenceScore >= 50
          ? 'high'
          : data.abuseConfidenceScore >= 25
          ? 'medium'
          : 'low',
    };
  } catch (err) {
    // If API key not set, return mock data for development
    if (!process.env.ABUSEIPDB_API_KEY) {
      return {
        ip: ipAddress,
        abuseScore: 0,
        isMalicious: false,
        message: 'AbuseIPDB API key not configured',
        mock: true,
      };
    }
    throw new Error(`AbuseIPDB error: ${err.message}`);
  }
};

module.exports = { checkIP };