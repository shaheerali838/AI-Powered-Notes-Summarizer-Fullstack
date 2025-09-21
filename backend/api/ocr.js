import express from 'express';
import multer from 'multer';
import { validateFile, validateAuth } from '../middleware/validateInput.js';
import { FileProcessorService } from '../services/fileProcessorService.js';
import { formatResponse } from '../utils/responseFormatter.js';

const router = express.Router();

// Configure multer for OCR uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
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
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type for OCR'), false);
    }
  }
});

// POST /api/ocr - Extract text from uploaded file
router.post('/', validateAuth, upload.single('file'), validateFile, async (req, res, next) => {
  try {
    const file = req.file;
    
    // Process the file to extract text
    const extractedText = await FileProcessorService.processFile(file);
    
    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json(formatResponse(
        false,
        'No text could be extracted from the file'
      ));
    }
    
    const responseData = {
      filename: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      text: extractedText,
      wordCount: extractedText.split(/\s+/).length
    };
    
    res.json(formatResponse(
      true,
      'Text extracted successfully',
      responseData
    ));
  } catch (error) {
    next(error);
  }
});

export default router;