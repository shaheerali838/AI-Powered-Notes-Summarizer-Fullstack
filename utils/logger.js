import { IS_PRODUCTION } from '../config/constants.js';

/**
 * Logger utility for consistent logging across the application
 */

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Log info message
 */
export function logInfo(message, ...args) {
  const timestamp = new Date().toISOString();
  console.log(`${colors.cyan}ℹ️ [${timestamp}] INFO:${colors.reset}`, message, ...args);
}

/**
 * Log success message
 */
export function logSuccess(message, ...args) {
  const timestamp = new Date().toISOString();
  console.log(`${colors.green}✅ [${timestamp}] SUCCESS:${colors.reset}`, message, ...args);
}

/**
 * Log warning message
 */
export function logWarning(message, ...args) {
  const timestamp = new Date().toISOString();
  console.warn(`${colors.yellow}⚠️ [${timestamp}] WARNING:${colors.reset}`, message, ...args);
}

/**
 * Log error message
 */
export function logError(message, error) {
  const timestamp = new Date().toISOString();
  console.error(`${colors.red}❌ [${timestamp}] ERROR:${colors.reset}`, message);
  
  if (error) {
    if (!IS_PRODUCTION) {
      console.error(colors.red, error.stack || error, colors.reset);
    } else {
      console.error(colors.red, error.message, colors.reset);
    }
  }
}

/**
 * Log debug message (only in development)
 */
export function logDebug(message, ...args) {
  if (!IS_PRODUCTION) {
    const timestamp = new Date().toISOString();
    console.log(`${colors.magenta}🐛 [${timestamp}] DEBUG:${colors.reset}`, message, ...args);
  }
}

/**
 * Log HTTP request
 */
export function logRequest(method, path, statusCode, duration) {
  const timestamp = new Date().toISOString();
  const statusColor = statusCode >= 500 ? colors.red : 
                      statusCode >= 400 ? colors.yellow : 
                      colors.green;
  
  console.log(
    `${colors.blue}📝 [${timestamp}]${colors.reset}`,
    `${method} ${path}`,
    `${statusColor}${statusCode}${colors.reset}`,
    `${duration}ms`
  );
}

export default {
  info: logInfo,
  success: logSuccess,
  warning: logWarning,
  error: logError,
  debug: logDebug,
  request: logRequest
};
