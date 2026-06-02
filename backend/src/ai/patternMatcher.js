const ATTACK_PATTERNS = {
  sql_injection: {
    patterns: [
      /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
      /(union|select|insert|update|delete|drop|create|alter|exec)/i,
      /sleep\s*\(\s*\d+\s*\)/i,
      /(\bOR\b|\bAND\b).*?[=<>]/i,
    ],
    severity: 'critical',
  },
  xss: {
    patterns: [
      /<script[\s\S]*?>[\s\S]*?<\/script>/i,
      /javascript\s*:/i,
      /<[^>]+on\w+\s*=\s*['"][^'"]*['"]/i,
      /document\.(cookie|write|location)/i,
    ],
    severity: 'high',
  },
  path_traversal: {
    patterns: [
      /\.\.\//g,
      /%2e%2e%2f/i,
      /etc\/passwd/i,
      /windows\/system32/i,
    ],
    severity: 'high',
  },
  command_injection: {
    patterns: [
      /[;&|`].*?(ls|cat|pwd|whoami|id)/i,
      /\/bin\/(bash|sh)/i,
      /\$\(.*?\)/,
    ],
    severity: 'critical',
  },
  brute_force: {
    patterns: [
      /failed.*login/i,
      /invalid.*password/i,
      /authentication.*failed/i,
    ],
    severity: 'high',
  },
};

const scanLog = (log) => {
  const threats = [];
  const target = [
    log.url || '',
    log.userAgent || '',
    log.rawLog || '',
  ].join(' ');

  Object.entries(ATTACK_PATTERNS).forEach(([attackType, config]) => {
    const matchCount = config.patterns.filter((p) => p.test(target)).length;
    if (matchCount > 0) {
      threats.push({
        type: attackType,
        severity: config.severity,
        confidence: Math.min((matchCount / config.patterns.length) * 100, 95),
      });
    }
  });

  return threats;
};

module.exports = { scanLog };