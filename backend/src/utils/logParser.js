// Parses Apache/Nginx/JSON log files

const parseApacheLog = (line) => {
  const regex = /^(\S+)\s+\S+\s+(\S+)\s+\[([^\]]+)\]\s+"(\S+)\s+(\S+)\s+\S+"\s+(\d+)\s+(\d+)(?:\s+"([^"]*)")?(?:\s+"([^"]*)")?/;
  const match = line.match(regex);
  if (!match) return null;

  return {
    rawLog: line,
    sourceIP: match[1],
    timestamp: new Date(),
    method: match[4],
    url: match[5],
    statusCode: parseInt(match[6]),
    responseSize: parseInt(match[7]) || 0,
    userAgent: match[9] || null,
    logType: 'apache',
  };
};

const parseJSONLog = (line) => {
  try {
    const parsed = JSON.parse(line);
    return {
      rawLog: line,
      timestamp: new Date(parsed.timestamp || parsed.time || Date.now()),
      sourceIP: parsed.ip || parsed.remoteAddr || parsed.clientIP,
      url: parsed.url || parsed.path,
      method: parsed.method,
      statusCode: parsed.status || parsed.statusCode,
      duration: parsed.duration || parsed.responseTime,
      userAgent: parsed.userAgent || parsed.ua,
      logType: 'json',
    };
  } catch {
    return null;
  }
};

const parseLogFile = (content) => {
  const lines = content.split('\n').filter((l) => l.trim());
  const parsed = [];

  lines.forEach((line) => {
    let entry = parseApacheLog(line);
    if (!entry) entry = parseJSONLog(line);
    if (entry) parsed.push(entry);
  });

  return parsed;
};

module.exports = { parseLogFile, parseApacheLog, parseJSONLog };