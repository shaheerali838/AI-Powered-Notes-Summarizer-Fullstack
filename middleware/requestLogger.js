import { logRequest } from '../utils/logger.js';

/**
 * Request logging middleware
 * Logs all incoming requests with method, path, status code, and response time
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Store original res.json to intercept response
  const originalJson = res.json;
  
  res.json = function(data) {
    const duration = Date.now() - startTime;
    logRequest(req.method, req.path, res.statusCode, duration);
    return originalJson.call(this, data);
  };
  
  // Also log when response finishes (for non-JSON responses)
  res.on('finish', () => {
    if (!res.headersSent || res.statusCode) {
      const duration = Date.now() - startTime;
      // Only log if not already logged via json
      if (res.get('Content-Type') !== 'application/json; charset=utf-8') {
        logRequest(req.method, req.path, res.statusCode, duration);
      }
    }
  });
  
  next();
};

export default requestLogger;
