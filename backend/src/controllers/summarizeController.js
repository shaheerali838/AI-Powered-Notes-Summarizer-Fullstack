import { summarizeWithGemini } from "../services/summarizerService.js";
export const summarizeController = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const summaryResult = await summarizeWithGemini(text);

    res.json(summaryResult); // ✅ send the object directly
  } catch (err) {
    console.error("❌ Controller Error:", err);
    res
      .status(500)
      .json({ error: "Failed to summarize", details: err.message });
  }
};
