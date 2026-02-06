export const summarizeController = async (req, res) => {
  try {
    const { text } = req.body;
    
    // Input validation
    if (!text) {
      return res.status(400).json({ 
        success: false,
        error: "Text is required",
        statusCode: 400
      });
    }

    if (typeof text !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: "Text must be a string",
        statusCode: 400
      });
    }

    // Text length validation (min 10 chars, max 50000 chars)
    if (text.trim().length < 10) {
      return res.status(400).json({ 
        success: false,
        error: "Text must be at least 10 characters long",
        statusCode: 400
      });
    }

    if (text.length > 50000) {
      return res.status(400).json({ 
        success: false,
        error: "Text is too long. Maximum 50,000 characters allowed",
        statusCode: 400
      });
    }

    // Lazy load services
    const [{ summarizeWithGemini }, { saveSummary }] =
      await Promise.all([
        import("../services/summarizerService.js"),
        import("../services/historyServices.js"),
      ]);

    const { summary, keyPoints } = await summarizeWithGemini(text);

    // Save in Firebase Firestore
    const saved = await saveSummary(text, summary, keyPoints);

    res.json({
      success: true,
      data: {
        id: saved.id,
        original: text,
        summary,
        keyPoints,
        timestamp: saved.timestamp
      }
    });
  } catch (err) {
    console.error("❌ Summarize Controller Error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to summarize text",
      details: process.env.NODE_ENV !== 'production' ? err.message : undefined,
      statusCode: 500
    });
  }
};
