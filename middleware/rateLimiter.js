import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS, ERROR_MESSAGES, HTTP_STATUS } from '../config/constants.js';

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */

const requestCounts = new Map();

// Clean up old entries every 5 minutes
// NOTE: In serverless environments (like Vercel), a live interval can keep
// the event loop active and cause requests to hang. `unref()` lets the
// runtime finish the request without waiting for this background timer.
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now - data.resetTime > RATE_LIMIT_WINDOW_MS) {
      requestCounts.delete(ip);
    }
  }
}, 5 * 60 * 1000);

if (typeof cleanupInterval.unref === 'function') {
  cleanupInterval.unref();
}

/**
 * Rate limiting middleware
 */
export const rateLimiter = (req, res, next) => {
  // Get client IP (handle proxies)
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
             req.headers['x-real-ip'] || 
             req.connection.remoteAddress ||
             req.socket.remoteAddress ||
             'unknown';
  
  const now = Date.now();
  const clientData = requestCounts.get(ip);
  
  if (!clientData) {
    // First request from this IP
    requestCounts.set(ip, {
      count: 1,
      resetTime: now
    });
    return next();
  }
  
  // Check if window has expired
  if (now - clientData.resetTime > RATE_LIMIT_WINDOW_MS) {
    // Reset the window
    requestCounts.set(ip, {
      count: 1,
      resetTime: now
    });
    return next();
  }
  
  // Increment count
  clientData.count++;
  
  // Check if limit exceeded
  if (clientData.count > RATE_LIMIT_MAX_REQUESTS) {
    const resetIn = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - clientData.resetTime)) / 1000);
    
    res.set({
      'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS,
      'X-RateLimit-Remaining': 0,
      'X-RateLimit-Reset': new Date(clientData.resetTime + RATE_LIMIT_WINDOW_MS).toISOString(),
      'Retry-After': resetIn
    });
    
    return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
      retryAfter: resetIn,
      statusCode: HTTP_STATUS.TOO_MANY_REQUESTS
    });
  }
  
  // Add rate limit headers
  res.set({
    'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS,
    'X-RateLimit-Remaining': RATE_LIMIT_MAX_REQUESTS - clientData.count,
    'X-RateLimit-Reset': new Date(clientData.resetTime + RATE_LIMIT_WINDOW_MS).toISOString()
  });
  
  next();
};

export default rateLimiter;
