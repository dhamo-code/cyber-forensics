const BASE_SCORES = {
  sql_injection: 85,
  command_injection: 95,
  xss: 70,
  path_traversal: 75,
  brute_force: 65,
  malicious_file: 90,
  anomaly_detected: 40,
};

const calculateScore = ({ attackType, confidence = 50, requestCount = 1, isRepeatOffender = false }) => {
  let score = BASE_SCORES[attackType] || 40;
  score = score * (confidence / 100);
  if (requestCount > 100) score += 10;
  if (isRepeatOffender) score += 15;
  score = Math.min(Math.max(Math.round(score), 0), 100);

  return { score, severity: getSeverityLabel(score) };
};

const getSeverityLabel = (score) => {
  if (score >= 76) return 'critical';
  if (score >= 51) return 'high';
  if (score >= 26) return 'medium';
  return 'low';
};

const getRecommendations = (attackType, score) => {
  const recs = {
    sql_injection: [
      'Block source IP immediately',
      'Audit database query logs',
      'Verify parameterized queries are used',
    ],
    xss: [
      'Sanitize all user inputs',
      'Implement Content Security Policy headers',
      'Review affected pages for injected scripts',
    ],
    brute_force: [
      'Block source IP for 24 hours',
      'Enable CAPTCHA on login endpoint',
      'Notify targeted account owner',
    ],
    command_injection: [
      'Isolate affected server immediately',
      'Audit system for unauthorized processes',
      'Check for data exfiltration',
    ],
  };

  return recs[attackType] || ['Monitor activity', 'Block IP if attacks persist'];
};

module.exports = { calculateScore, getSeverityLabel, getRecommendations };