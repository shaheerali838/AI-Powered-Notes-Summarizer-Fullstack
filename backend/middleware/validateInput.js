import { formatResponse } from '../utils/responseFormatter.js';

export const validateText = (req, res, next) => {
  const { text } = req.body;
  
  if (!text || typeof text !== 'string') {
    return res.status(400).json(
      formatResponse(false, 'Text content is required and must be a string')
    );
  }
  
  if (text.trim().length === 0) {
    return res.status(400).json(
      formatResponse(false, 'Text content cannot be empty')
    );
  }
  
  if (text.length > 50000) {
    return res.status(400).json(
      formatResponse(false, 'Text content is too long (maximum 50,000 characters)')
    );
  }
  
  next();
};

export const validateFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json(
      formatResponse(false, 'No file uploaded')
    );
  }
  
  const allowedTypes = [
    'text/plain',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp'
  ];
  
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json(
      formatResponse(false, 'Unsupported file type. Allowed types: TXT, PDF, DOCX, and images')
    );
  }
  
  if (req.file.size > 10 * 1024 * 1024) {
    return res.status(400).json(
      formatResponse(false, 'File size too large. Maximum size is 10MB')
    );
  }
  
  next();
};

export const validateAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No auth header - treat as guest
      req.user = null;
      req.isGuest = true;
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    // Import auth here to avoid circular dependency
    const { auth } = await import('../config/firebase.js');
    
    if (!auth) {
      // Firebase not configured - treat as guest
      req.user = null;
      req.isGuest = true;
      return next();
    }
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      req.user = decodedToken;
      req.isGuest = false;
    } catch (authError) {
      console.error('Auth verification error:', authError);
      // Invalid token - treat as guest
      req.user = null;
      req.isGuest = true;
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    // On error, treat as guest
    req.user = null;
    req.isGuest = true;
    next();
  }
};