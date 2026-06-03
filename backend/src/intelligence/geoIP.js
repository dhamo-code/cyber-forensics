const axios = require('axios');

const lookup = async (ipAddress) => {
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
      country: 'Local',
      city: 'Private Network',
      isPrivate: true,
    };
  }

  try {
    // Free GeoIP API - no key needed
    const response = await axios.get(
      `http://ip-api.com/json/${ipAddress}?fields=status,country,countryCode,regionName,city,lat,lon,isp,org,query`
    );

    if (response.data.status === 'fail') {
      return { ip: ipAddress, error: 'Lookup failed' };
    }

    return {
      ip: ipAddress,
      country: response.data.country,
      countryCode: response.data.countryCode,
      region: response.data.regionName,
      city: response.data.city,
      lat: response.data.lat,
      lon: response.data.lon,
      isp: response.data.isp,
      org: response.data.org,
    };
  } catch (err) {
    throw new Error(`GeoIP error: ${err.message}`);
  }
};

module.exports = { lookup };