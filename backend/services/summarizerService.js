import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

export async function summarizeWithGemini(text) {
  const currentKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!currentKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please set it in your backend .env file.",
    );
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  try {
    const prompt = `You are an expert academic summarizer. Your task is to extract the core ideas from the provided text and convert them into highly structured, professional study notes.

CRITICAL CONSTRAINTS:
- ZERO MARKDOWN: Absolutely no bold (**), italics (*), hashes (#), or bullet points (-) are allowed anywhere in your output. Use plain text only.
- ZERO FILLER: Do not include conversational filler, introductions, or conclusions (e.g., "Here is the summary"). 

OUTPUT TEMPLATE:
You must strictly follow this exact format and spacing:

Summary
[Write a single, concise paragraph capturing the main ideas. Keep sentences professional and easy to understand.]

Key Points
1. [Main point 1]
  1.1 [Sub-point 1 - indented with exactly 2 spaces]
  1.2 [Sub-point 2 - indented with exactly 2 spaces]
    1.2.1 [Nested sub-point - indented with exactly 4 spaces]
2. [Main point 2]
  2.1 [Sub-point 1]

Text to summarize:
${text}`;

    const client = new GoogleGenAI({ apiKey: currentKey });
    const response = await client.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    const rawText = response.text || "";
    const [summaryPart, keyPointsPart] = rawText.split("Key Points");

    const summary =
      summaryPart?.replace(/Summary/i, "").trim() || "No summary available";
    const keyPoints = keyPointsPart
      ? keyPointsPart
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
      : [];

    return {
      original: text,
      summary,
      keyPoints,
    };
  } catch (error) {
    console.error(
      "❌ Gemini Summarizer Service Error:",
      error.message || error,
    );
    throw new Error(
      `AI Summarization failed: ${error.message || "Unknown error"}`,
    );
  }
}
