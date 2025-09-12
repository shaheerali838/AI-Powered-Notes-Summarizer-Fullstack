import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only text and PDF files
    if (file.mimetype === 'text/plain' || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only .txt and .pdf files are allowed'), false);
    }
  }
});

// Upload and extract text from file
router.post('/', optionalAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let extractedText = '';
    const { originalname, mimetype, size } = req.file;

    if (mimetype === 'text/plain') {
      // Handle text files
      extractedText = req.file.buffer.toString('utf-8');
    } else if (mimetype === 'application/pdf') {
      // Handle PDF files
      try {
        const pdfData = await pdfParse(req.file.buffer);
        extractedText = pdfData.text;
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        return res.status(400).json({ error: 'Failed to extract text from PDF' });
      }
    }

    // Validate extracted text
    if (!extractedText.trim()) {
      return res.status(400).json({ error: 'No text content found in the file' });
    }

    if (extractedText.length > 50000) {
      return res.status(400).json({ 
        error: 'File content too large. Maximum 50,000 characters allowed.' 
      });
    }

    // Calculate word count
    const wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;

    res.json({
      message: 'File processed successfully',
      filename: originalname,
      fileSize: size,
      mimetype,
      text: extractedText,
      wordCount,
      characterCount: extractedText.length
    });

  } catch (error) {
    console.error('File upload error:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    
    if (error.message.includes('Only .txt and .pdf files are allowed')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Server error processing file' });
  }
});

// Get supported file types
router.get('/supported-types', (req, res) => {
  res.json({
    supportedTypes: [
      {
        extension: '.txt',
        mimetype: 'text/plain',
        description: 'Plain text files'
      },
      {
        extension: '.pdf',
        mimetype: 'application/pdf',
        description: 'PDF documents'
      }
    ],
    maxFileSize: '10MB',
    maxTextLength: '50,000 characters'
  });
});

export default router;