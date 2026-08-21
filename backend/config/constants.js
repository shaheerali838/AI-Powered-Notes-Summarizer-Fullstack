// Application constants and configuration

// File upload limits
export const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB in bytes
export const FILE_SIZE_LIMIT_MB = 10;

// Text processing limits
export const TEXT_MIN_LENGTH = 10;
export const TEXT_MAX_LENGTH = 50000;

// Rate limiting
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per window

// Allowed file types
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/webp'
];

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
};

// Error messages
export const ERROR_MESSAGES = {
  NO_FILE: 'No file uploaded',
  INVALID_FILE_TYPE: 'Invalid file type. Only PDF, DOCX, and images are allowed',
  FILE_TOO_LARGE: 'File size too large. Maximum size is 10MB',
  TEXT_REQUIRED: 'Text is required',
  TEXT_TOO_SHORT: 'Text must be at least 10 characters long',
  TEXT_TOO_LONG: 'Text is too long. Maximum 50,000 characters allowed',
  INVALID_TEXT_TYPE: 'Text must be a string',
  NO_TOKEN: 'No authentication token provided',
  INVALID_TOKEN: 'Invalid or expired token',
  UNAUTHORIZED: 'User not authenticated',
  INTERNAL_ERROR: 'Internal server error occurred',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later'
};

// Success messages
export const SUCCESS_MESSAGES = {
  FILE_UPLOADED: 'File uploaded and processed successfully',
  TEXT_SUMMARIZED: 'Text summarized successfully',
  PROFILE_FETCHED: 'User profile fetched successfully',
  HISTORY_FETCHED: 'History fetched successfully',
  HISTORY_DELETED: 'History item deleted successfully'
};

// Environment
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
