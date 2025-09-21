import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Firebase configuration
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  
  // File upload limits
  fileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp'
    ]
  },
  
  // CORS origins
  corsOrigins: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://ai-notes-summarizer.vercel.app',
    'https://ai-powered-notes-summarizer-frontend.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // requests per window
  }
};