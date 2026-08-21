import { summarizeWithGemini } from "../services/summarizerService.js";
import { saveSummary } from "../services/historyServices.js";

export const summarizeController = async (req, res) => {
  try {
    const { text, originalContent, tone = "academic", length = "balanced", model } = req.body;
    const inputText = text || originalContent;

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

    if (inputText.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: "Text must be at least 5 characters long",
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

    const summarizeTimeoutMs = Number(process.env.SUMMARIZE_TIMEOUT_MS || 35000);
    const { summary, keyPoints, model: usedModel } = await Promise.race([
      summarizeWithGemini(inputText, { tone, length, model }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Summarization timed out")), summarizeTimeoutMs)
      ),
    ]);

    let saved = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    try {
      const saveTimeoutMs = Number(process.env.FIRESTORE_SAVE_TIMEOUT_MS || 5000);
      saved = await Promise.race([
        saveSummary(inputText, summary, keyPoints),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Save timed out")), saveTimeoutMs),
        ),
      ]);
    } catch (saveErr) {
      console.warn("⚠️ Server-side history save skipped/failed:", saveErr.message);
    }

    res.json({
      success: true,
      data: {
        id: saved?.id || Date.now().toString(),
        originalContent: inputText,
        summary,
        keyPoints: keyPoints || [],
        timestamp: saved?.timestamp || new Date().toISOString(),
        model: usedModel,
        options: { tone, length },
      },
    });
  } catch (err) {
    console.error("Summarize Controller Error:", err);
    const isTimeout = /timed out|timeout/i.test(err.message || "");
    res.status(isTimeout ? 504 : 500).json({
      success: false,
      error: isTimeout
        ? "Request timed out. Please try again."
        : `Failed to summarize text: ${err.message}`,
      details: process.env.NODE_ENV !== "production" ? err.message : undefined,
      statusCode: isTimeout ? 504 : 500,
    });
  }
};
