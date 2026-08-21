import { 
  TEXT_MIN_LENGTH, 
  TEXT_MAX_LENGTH,
  ALLOWED_MIME_TYPES,
  ERROR_MESSAGES 
} from '../config/constants.js';

/**
 * Validation utilities
 */

/**
 * Validate text input
 */
export function validateText(text) {
  const errors = [];

  if (!text) {
    errors.push(ERROR_MESSAGES.TEXT_REQUIRED);
  }

  if (typeof text !== 'string') {
    errors.push(ERROR_MESSAGES.INVALID_TEXT_TYPE);
  }

  if (text && typeof text === 'string') {
    if (text.trim().length < TEXT_MIN_LENGTH) {
      errors.push(ERROR_MESSAGES.TEXT_TOO_SHORT);
    }

    if (text.length > TEXT_MAX_LENGTH) {
      errors.push(ERROR_MESSAGES.TEXT_TOO_LONG);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate file mimetype
 */
export function validateMimeType(mimetype) {
  return ALLOWED_MIME_TYPES.includes(mimetype);
}

/**
 * Validate email format
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize text input (remove dangerous characters)
 */
export function sanitizeText(text) {
  if (typeof text !== 'string') return text;
  
  // Remove null bytes and other potentially dangerous characters
  return text
    .replace(/\0/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Validate object has required fields
 */
export function hasRequiredFields(obj, requiredFields) {
  const missing = requiredFields.filter(field => !obj[field]);
  
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Validate pagination parameters
 */
export function validatePagination(page, limit) {
  const errors = [];
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);

  if (isNaN(parsedPage) || parsedPage < 1) {
    errors.push('Page must be a positive integer');
  }

  if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
    errors.push('Limit must be between 1 and 100');
  }

  return {
    valid: errors.length === 0,
    errors,
    page: parsedPage || 1,
    limit: parsedLimit || 10
  };
}
