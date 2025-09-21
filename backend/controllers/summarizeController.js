import { SummarizerService } from '../services/summarizerService.js';
import { HistoryService } from '../services/historyService.js';
import { formatResponse } from '../utils/responseFormatter.js';

export const summarizeText = async (req, res, next) => {
  try {
    const { text } = req.body;
    const { user, isGuest } = req;
    
    // Generate summary
    const summaryResult = await SummarizerService.generateSummary(text);
    
    // Prepare response data
    const responseData = {
      original: text,
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
          originalContent: text,
          summarizedContent: summaryResult.summary,
          keyPoints: summaryResult.keyPoints,
          fileType: 'text',
          wordCount: summaryResult.originalLength,
          compressionRatio: summaryResult.compressionRatio
        };
        
        const summaryId = await HistoryService.saveSummary(user.uid, summaryData);
        responseData.meta.savedId = summaryId;
      } catch (saveError) {
        console.error('Failed to save summary to history:', saveError);
        // Don't fail the request if saving fails
      }
    }
    
    res.json(formatResponse(
      true,
      'Summary generated successfully',
      responseData
    ));
  } catch (error) {
    next(error);
  }
};