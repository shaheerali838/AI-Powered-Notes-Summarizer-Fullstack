export const formatResponse = (success, message, data = null, meta = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  if (meta !== null) {
    response.meta = meta;
  }
  
  return response;
};

export const formatError = (message, statusCode = 500, details = null) => {
  const error = new Error(message);
  error.status = statusCode;
  if (details) {
    error.details = details;
  }
  return error;
};