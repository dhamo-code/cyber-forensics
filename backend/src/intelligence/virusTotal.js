const axios = require('axios');

const checkFileHash = async (sha256Hash) => {
  try {
    if (!process.env.VIRUSTOTAL_API_KEY) {
      return {
        detected: false,
        message: 'VirusTotal API key not configured',
        mock: true,
      };
    }

    const response = await axios.get(
      `https://www.virustotal.com/api/v3/files/${sha256Hash}`,
      {
        headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY },
      }
    );

    const stats = response.data.data.attributes.last_analysis_stats;
    return {
      detected: stats.malicious > 0,
      malicious: stats.malicious,
      suspicious: stats.suspicious,
      harmless: stats.harmless,
      total: Object.values(stats).reduce((a, b) => a + b, 0),
      permalink: `https://www.virustotal.com/gui/file/${sha256Hash}`,
    };
  } catch (err) {
    if (err.response?.status === 404) {
      return { detected: false, message: 'File not found in VirusTotal' };
    }
    throw new Error(`VirusTotal error: ${err.message}`);
  }
};

const checkURL = async (url) => {
  try {
    if (!process.env.VIRUSTOTAL_API_KEY) {
      return {
        isMalicious: false,
        message: 'VirusTotal API key not configured',
        mock: true,
      };
    }

    const urlId = Buffer.from(url)
      .toString('base64')
      .replace(/=/g, '');

    const response = await axios.get(
      `https://www.virustotal.com/api/v3/urls/${urlId}`,
      {
        headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY },
      }
    );

    const stats = response.data.data.attributes.last_analysis_stats;
    return {
      url,
      malicious: stats.malicious,
      suspicious: stats.suspicious,
      harmless: stats.harmless,
      isMalicious: stats.malicious > 0 || stats.suspicious > 2,
    };
  } catch (err) {
    throw new Error(`VirusTotal URL check error: ${err.message}`);
  }
};

module.exports = { checkFileHash, checkURL };