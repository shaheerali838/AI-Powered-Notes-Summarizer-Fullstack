/**
 * Format success response
 */
export function formatSuccessResponse(data, message = null) {
  return {
    success: true,
    data,
    ...(message && { message }),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Format basic response (deprecated - use formatSuccessResponse)
 */
export function formatResponse(original, summary) {
  return {
    success: true,
    data: {
      original,
      summary
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Format file upload response
 */
export function formatFileUploadResponse(filename, extractedText, summary, keyPoints) {
  return {
    success: true,
    data: {
      filename,
      extractedText,
      summary,
      keyPoints
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Format error response
 */
export function formatErrorResponse(error, statusCode = 500) {
  return {
    success: false,
    error: error.message || error,
    statusCode,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Format paginated response
 */
export function formatPaginatedResponse(items, page, limit, total) {
  return {
    success: true,
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    },
    timestamp: new Date().toISOString(),
  };
}
