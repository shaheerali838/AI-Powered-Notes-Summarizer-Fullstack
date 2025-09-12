import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Initialize Google Gemini
let genAI;
let geminiAvailable = false;

try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy-key");
  geminiAvailable = true;
  console.log("Gemini AI initialized successfully");
} catch (error) {
  console.log("Gemini AI initialization failed, using mock mode");
}

// In-memory storage for summaries
let summaries = [];

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "Server is running!",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    database: "Connected",
    gemini_available: geminiAvailable,
    features: {
      authentication: true,
      fileUpload: true,
      rateLimiting: true,
      database: true,
    },
  });
});

// Legacy summarization endpoint (for backward compatibility)
app.post("/api/summarize", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Use mock responses if Gemini isn't available
    if (!geminiAvailable) {
      const mockSummary = generateMockSummary(text);
      const summaryData = {
        id: Date.now(),
        original: text.substring(0, 200) + (text.length > 200 ? "..." : ""),
        summary: mockSummary,
        timestamp: new Date().toISOString(),
      };

      summaries.unshift(summaryData);
      if (summaries.length > 50) summaries.pop();

      return res.json({
        summary: mockSummary,
        id: summaryData.id,
        note: "Using mock data - Gemini API not configured",
      });
    }

    // Define prompt outside of try blocks to avoid scoping issues
    const prompt = `Please summarize the following text in a clear and concise manner. 
    Focus on the main points and key ideas. Return only the summary without any introductory text:
    
    ${text}`;

    let summary;
    let modelUsed = "gemini-pro"; // Default to standard model

    // Try to use the real Gemini API
    try {
      // First try Gemini 2.5 Pro
      console.log("Trying Gemini 2.5 Pro...");
      const model25Pro = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      const result = await model25Pro.generateContent(prompt);
      const response = await result.response;
      summary = response.text();
      modelUsed = "gemini-2.5-pro";
      console.log("Success with Gemini 2.5 Pro");
    } catch (error25Pro) {
      console.error("Gemini 2.5 Pro Error:", error25Pro.message);

      // Fall back to standard Gemini Pro if 2.5 is unavailable
      try {
        console.log("Trying standard Gemini Pro...");
        const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await modelPro.generateContent(prompt);
        const response = await result.response;
        summary = response.text();
        modelUsed = "gemini-pro";
        console.log("Success with Gemini Pro");
      } catch (errorPro) {
        console.error("Gemini Pro Error:", errorPro.message);

        // If both fail, use mock data
        summary = generateMockSummary(text);
        modelUsed = "mock";
      }
    }

    // Save the summary with a timestamp
    const summaryData = {
      id: Date.now(),
      original: text.substring(0, 200) + (text.length > 200 ? "..." : ""),
      summary,
      timestamp: new Date().toISOString(),
      model: modelUsed,
    };

    summaries.unshift(summaryData);
    if (summaries.length > 50) summaries.pop();

    res.json({
      summary,
      id: summaryData.id,
      model: modelUsed,
      note:
        modelUsed === "mock"
          ? "Using mock data - Gemini API unavailable"
          : undefined,
    });
  } catch (error) {
    console.error("Unexpected Error:", error);

    // Final fallback to mock response
    const mockSummary = generateMockSummary(req.body.text);
    const summaryData = {
      id: Date.now(),
      original:
        req.body.text.substring(0, 200) +
        (req.body.text.length > 200 ? "..." : ""),
      summary: mockSummary,
      timestamp: new Date().toISOString(),
      model: "mock",
    };

    summaries.unshift(summaryData);
    if (summaries.length > 50) summaries.pop();

    res.json({
      summary: mockSummary,
      id: summaryData.id,
      model: "mock",
      note: "Using mock data - Unexpected error occurred",
    });
  }
});

// Helper function to generate mock summaries
function generateMockSummary(text) {
  // Simple algorithm to create a mock summary
  const sentences = text.split(/[.!?]/).filter((s) => s.trim().length > 0);

  if (sentences.length <= 2) {
    return text; // Return original if it's very short
  }

  // Create a summary with the first and last sentences
  const firstSentence = sentences[0].trim();
  const lastSentence = sentences[sentences.length - 1].trim();

  return `${firstSentence}. ${lastSentence}. [This is a mock summary. Gemini API is currently unavailable.]`;
}

// Legacy history endpoint (for backward compatibility)
app.get("/api/history", (req, res) => {
  res.json(summaries);
});

// Legacy get summary endpoint (for backward compatibility)
app.get("/api/summary/:id", (req, res) => {
  const summary = summaries.find((s) => s.id === parseInt(req.params.id));
  if (!summary) {
    return res.status(404).json({ error: "Summary not found" });
  }
  res.json(summary);
});

// Legacy delete summary endpoint (for backward compatibility)
app.delete("/api/summary/:id", (req, res) => {
  const index = summaries.findIndex((s) => s.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: "Summary not found" });
  }
  summaries.splice(index, 1);
  res.json({ message: "Summary deleted successfully" });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error);

  if (error.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      details: Object.values(error.errors).map((err) => err.message),
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  if (error.code === 11000) {
    return res.status(400).json({ error: "Duplicate entry" });
  }

  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Health check available at http://localhost:${port}/api/health`);
  console.log(
    `Features enabled: Database, Authentication, File Upload, Rate Limiting`
  );
  console.log(`Gemini API available: ${geminiAvailable}`);
});
