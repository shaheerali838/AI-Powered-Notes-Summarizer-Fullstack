// src/controllers/summarizeController.js
import { summarizeWithGemini } from "../services/summarizerService.js";
import { addToHistory } from "../services/historyService.js";

export const summarizeController = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const summary = await summarizeWithGemini(text);

    // ✅ Save to history
    addToHistory({
      original: text,
      summary: summary.summary,
      keyPoints: summary.keyPoints,
    });

    res.json(summary);
  } catch (err) {
    console.error("❌ Controller Error:", err);
    res
      .status(500)
      .json({ error: "Failed to summarize", details: err.message });
  }
};
