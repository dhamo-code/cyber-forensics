const crypto = require('crypto');
const fs = require('fs');

// Calculate SHA256 hash of a file
const hashFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
};

// Verify file integrity
const verifyIntegrity = async (filePath, expectedHash) => {
  const currentHash = await hashFile(filePath);
  return {
    isIntact: currentHash === expectedHash,
    expectedHash,
    currentHash,
    verifiedAt: new Date().toISOString(),
  };
};

// Generate random token
const generateToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

module.exports = { hashFile, verifyIntegrity, generateToken };