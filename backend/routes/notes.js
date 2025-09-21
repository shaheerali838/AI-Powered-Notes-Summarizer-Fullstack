import express from 'express';
import multer from 'multer';
import { validateFile, validateAuth } from '../middleware/validateInput.js';
import { FileProcessorService } from '../services/fileProcessorService.js';
import { SummarizerService } from '../services/summarizerService.js';
import { HistoryService } from '../services/historyService.js';
import { formatResponse } from '../utils/responseFormatter.js';

const router = express.Router();

// Configure multer for file uploads
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
      cb(new Error('Unsupported file type'), false);
    }
  }
});

// POST /api/notes/upload - Upload and process file
router.post('/upload', validateAuth, upload.single('file'), validateFile, async (req, res, next) => {
  try {
    const { user, isGuest } = req;
    const file = req.file;
    
    // Process the file to extract text
    const extractedText = await FileProcessorService.processFile(file);
    
    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json(formatResponse(
        false,
        'No text could be extracted from the file'
      ));
    }
    
    // Generate summary
    const summaryResult = await SummarizerService.generateSummary(extractedText);
    
    // Prepare response data
    const responseData = {
      filename: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      extractedText,
      summary: summaryResult.summary,
      keyPoints: summaryResult.keyPoints,
      meta: {
        originalLength: summaryResult.originalLength,
        summaryLength: summaryResult.summaryLength,
        compressionRatio: summaryResult.compressionRatio
      }
    };
    
    // Save to history for authenticated users
    if (user && !isGuest) {
      try {
        const summaryData = {
          originalContent: extractedText,
          summarizedContent: summaryResult.summary,
          keyPoints: summaryResult.keyPoints,
          filename: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          wordCount: summaryResult.originalLength,
          compressionRatio: summaryResult.compressionRatio
        };
        
        const summaryId = await HistoryService.saveSummary(user.uid, summaryData);
        responseData.meta.savedId = summaryId;
      } catch (saveError) {
        console.error('Failed to save file summary to history:', saveError);
        // Don't fail the request if saving fails
      }
    }
    
    res.json(formatResponse(
      true,
      'File processed and summarized successfully',
      responseData
    ));
  } catch (error) {
    next(error);
  }
});

export default router;