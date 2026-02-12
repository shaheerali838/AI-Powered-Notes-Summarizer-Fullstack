export const summarizeController = async (req, res) => {
  try {
    // Accept both 'text' and 'originalContent' for backward compatibility
    const { text, originalContent } = req.body;

    // Normalize input - prefer 'text' over 'originalContent'
    const inputText = text || originalContent;

    // Input validation
    if (!inputText) {
      return res.status(400).json({
        success: false,
        error: "Text or originalContent is required",
        statusCode: 400,
      });
    }

    if (typeof inputText !== "string") {
      return res.status(400).json({
        success: false,
        error: "Text must be a string",
        statusCode: 400,
      });
    }

    // Text length validation (min 10 chars, max 50000 chars)
    if (inputText.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: "Text must be at least 10 characters long",
        statusCode: 400,
      });
    }

    if (inputText.length > 50000) {
      return res.status(400).json({
        success: false,
        error: "Text is too long. Maximum 50,000 characters allowed",
        statusCode: 400,
      });
    }

    // Lazy load services
    const [{ summarizeWithGemini }, { saveSummary }] = await Promise.all([
      import("../services/summarizerService.js"),
      import("../services/historyServices.js"),
    ]);

    const { summary, keyPoints } = await summarizeWithGemini(inputText);

    // Save in Firebase Firestore
    const saved = await saveSummary(inputText, summary, keyPoints);

    res.json({
      success: true,
      data: {
        id: saved.id,
        originalContent: inputText, // Changed from 'original' to match frontend expectations
        summary,
        keyPoints,
        timestamp: saved.timestamp,
      },
    });
  } catch (err) {
    console.error("❌ Summarize Controller Error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to summarize text",
      details: process.env.NODE_ENV !== "production" ? err.message : undefined,
      statusCode: 500,
    });
  }
};
