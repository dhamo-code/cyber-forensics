const requiredEnvVars = [
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

function validateEnv() {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error('FATAL: Missing required environment variables:');
    missing.forEach((key) => console.error(`  - ${key}`));
    console.error('Copy .env.example to .env and fill in the values.');
    process.exit(1);
  }
}

module.exports = { validateEnv };