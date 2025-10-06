require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function summarizeText(text) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("❌ Missing GEMINI_API_KEY in .env file");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
  You are an AI notes summarizer. 
  Summarize the following text into a clear, concise summary and extract 3–5 key points.
  
  Text:
  ${text}
  
  Return the response **strictly as JSON** (no markdown, no code blocks) in this structure:
  {
    "summary": "...",
    "keyPoints": ["...", "...", "..."]
  }`;

  try {
    const result = await model.generateContent(prompt);
    let response = await result.response.text();

    // 🧹 Clean up Gemini's markdown formatting (handles ```json, ``` and other edge cases)
    response = response
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .replace(/^\s+|\s+$/g, "");

    // 🧩 Try parsing JSON again
    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch (err) {
      console.warn("⚠️ Gemini did not return strict JSON. Parsed manually.");
      parsed = {
        summary: response,
        keyPoints: [],
      };
    }

    return parsed;
  } catch (error) {
    console.error("❌ Gemini summarization failed:", error);
    return {
      summary: "Error generating summary. Please try again later.",
      keyPoints: [],
    };
  }
}

module.exports = { summarizeText };
