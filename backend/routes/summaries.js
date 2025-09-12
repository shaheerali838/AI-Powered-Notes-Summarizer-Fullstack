import express from 'express';
import Summary from '../models/Summary.js';
import User from '../models/User.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validateSummary, handleValidationErrors } from '../middleware/validation.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Initialize Google Gemini
let genAI;
let geminiAvailable = false;

try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key');
  geminiAvailable = !!process.env.GEMINI_API_KEY;
  console.log('Gemini AI initialized successfully');
} catch (error) {
  console.log('Gemini AI initialization failed, using mock mode');
}

// Helper function to generate mock summaries
function generateMockSummary(text) {
  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
  
  if (sentences.length <= 2) {
    return text;
  }
  
  const firstSentence = sentences[0].trim();
  const lastSentence = sentences[sentences.length - 1].trim();
  
  return `${firstSentence}. ${lastSentence}. [This is a mock summary. Gemini API is currently unavailable.]`;
}

// Create new summary
router.post('/', optionalAuth, validateSummary, handleValidationErrors, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { text, title, tags, isPublic = false } = req.body;
    let summary;
    let modelUsed = 'gemini-pro';

    // Generate summary using Gemini AI or mock
    if (!geminiAvailable) {
      summary = generateMockSummary(text);
      modelUsed = 'mock';
    } else {
      const prompt = `Please summarize the following text in a clear and concise manner. 
      Focus on the main points and key ideas. Return only the summary without any introductory text:
      
      ${text}`;

      try {
        console.log('Trying Gemini 2.5 Pro...');
        const model25Pro = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
        const result = await model25Pro.generateContent(prompt);
        const response = await result.response;
        summary = response.text();
        modelUsed = 'gemini-2.5-pro';
        console.log('Success with Gemini 2.5 Pro');
      } catch (error25Pro) {
        console.error('Gemini 2.5 Pro Error:', error25Pro.message);

        try {
          console.log('Trying standard Gemini Pro...');
          const modelPro = genAI.getGenerativeModel({ model: 'gemini-pro' });
          const result = await modelPro.generateContent(prompt);
          const response = await result.response;
          summary = response.text();
          modelUsed = 'gemini-pro';
          console.log('Success with Gemini Pro');
        } catch (errorPro) {
          console.error('Gemini Pro Error:', errorPro.message);
          summary = generateMockSummary(text);
          modelUsed = 'mock';
        }
      }
    }

    const processingTime = Date.now() - startTime;

    // Create summary document
    const summaryDoc = new Summary({
      user: req.user?._id,
      title,
      originalText: text,
      summaryText: summary,
      processingTime,
      model: modelUsed,
      tags: tags || [],
      isPublic
    });

    await summaryDoc.save();

    // Update user summary count if authenticated
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { summaryCount: 1 } });
    }

    res.status(201).json({
      id: summaryDoc._id,
      summary,
      model: modelUsed,
      processingTime,
      originalWordCount: summaryDoc.originalWordCount,
      summaryWordCount: summaryDoc.summaryWordCount,
      compressionRatio: summaryDoc.compressionRatio,
      note: modelUsed === 'mock' ? 'Using mock data - Gemini API unavailable' : undefined
    });

  } catch (error) {
    console.error('Summary creation error:', error);
    
    // Fallback to mock response
    const mockSummary = generateMockSummary(req.body.text);
    const processingTime = Date.now() - startTime;
    
    try {
      const summaryDoc = new Summary({
        user: req.user?._id,
        title: req.body.title,
        originalText: req.body.text,
        summaryText: mockSummary,
        processingTime,
        model: 'mock',
        tags: req.body.tags || [],
        isPublic: req.body.isPublic || false
      });

      await summaryDoc.save();

      if (req.user) {
        await User.findByIdAndUpdate(req.user._id, { $inc: { summaryCount: 1 } });
      }

      res.status(201).json({
        id: summaryDoc._id,
        summary: mockSummary,
        model: 'mock',
        processingTime,
        originalWordCount: summaryDoc.originalWordCount,
        summaryWordCount: summaryDoc.summaryWordCount,
        compressionRatio: summaryDoc.compressionRatio,
        note: 'Using mock data - Unexpected error occurred'
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      res.status(500).json({ error: 'Server error creating summary' });
    }
  }
});

// Get summaries with pagination and filtering
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const tags = req.query.tags;

    // Build query
    let query = {};
    
    if (req.user) {
      query.user = req.user._id;
    } else {
      query.isPublic = true;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    const summaries = await Summary.find(query)
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-originalText'); // Don't return full original text in list

    const total = await Summary.countDocuments(query);

    res.json({
      summaries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get summaries error:', error);
    res.status(500).json({ error: 'Server error fetching summaries' });
  }
});

// Get specific summary by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // If not authenticated, only show public summaries
    if (!req.user) {
      query.isPublic = true;
    } else {
      // If authenticated, show own summaries or public ones
      query.$or = [
        { user: req.user._id },
        { isPublic: true }
      ];
    }

    const summary = await Summary.findOne(query).populate('user', 'name');
    
    if (!summary) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    res.json(summary);
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Server error fetching summary' });
  }
});

// Update summary (only by owner)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, tags, isPublic } = req.body;
    
    const summary = await Summary.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, tags, isPublic },
      { new: true, runValidators: true }
    );

    if (!summary) {
      return res.status(404).json({ error: 'Summary not found or unauthorized' });
    }

    res.json({
      message: 'Summary updated successfully',
      summary
    });
  } catch (error) {
    console.error('Update summary error:', error);
    res.status(500).json({ error: 'Server error updating summary' });
  }
});

// Delete summary (only by owner)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const summary = await Summary.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!summary) {
      return res.status(404).json({ error: 'Summary not found or unauthorized' });
    }

    // Update user summary count
    await User.findByIdAndUpdate(req.user._id, { $inc: { summaryCount: -1 } });

    res.json({ message: 'Summary deleted successfully' });
  } catch (error) {
    console.error('Delete summary error:', error);
    res.status(500).json({ error: 'Server error deleting summary' });
  }
});

// Get user's summary statistics
router.get('/stats/user', authenticate, async (req, res) => {
  try {
    const stats = await Summary.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalSummaries: { $sum: 1 },
          totalWordsProcessed: { $sum: '$originalWordCount' },
          totalWordsSummarized: { $sum: '$summaryWordCount' },
          averageCompressionRatio: { $avg: '$compressionRatio' },
          averageProcessingTime: { $avg: '$processingTime' }
        }
      }
    ]);

    const result = stats[0] || {
      totalSummaries: 0,
      totalWordsProcessed: 0,
      totalWordsSummarized: 0,
      averageCompressionRatio: 0,
      averageProcessingTime: 0
    };

    res.json(result);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error fetching statistics' });
  }
});

export default router;