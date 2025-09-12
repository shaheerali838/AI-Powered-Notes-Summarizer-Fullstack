import geminiService from "../services/geminiService.js";

// In-memory storage for development (replace with database in production)
const summaries = [];

class SummaryController {
  async generateSummary(req, res, next) {
    try {
      const { text, type = "paragraph" } = req.body;

      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      let summary;
      if (type === "bullets") {
        summary = await geminiService.generateBulletPoints(text);
      } else {
        summary = await geminiService.generateSummary(text);
      }

      // Save the summary with a timestamp
      const summaryData = {
        id: Date.now(),
        original: text.substring(0, 200) + (text.length > 200 ? "..." : ""),
        summary,
        type,
        timestamp: new Date().toISOString(),
      };

      summaries.unshift(summaryData);
      if (summaries.length > 50) summaries.pop(); // Keep only last 50 summaries

      res.json({
        summary,
        id: summaryData.id,
        type,
      });
    } catch (error) {
      next(error);
    }
  }

  getHistory(req, res) {
    res.json(summaries);
  }

  getSummaryById(req, res) {
    const summary = summaries.find((s) => s.id === parseInt(req.params.id));
    if (!summary) {
      return res.status(404).json({ error: "Summary not found" });
    }
    res.json(summary);
  }

  deleteSummary(req, res) {
    const index = summaries.findIndex((s) => s.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ error: "Summary not found" });
    }
    summaries.splice(index, 1);
    res.json({ message: "Summary deleted successfully" });
  }
}

export default new SummaryController();
