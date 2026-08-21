import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

export async function summarizeWithGemini(text, options = {}) {
  const currentKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!currentKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please set it in your backend .env file."
    );
  }

  const modelName = options.model || process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  const { tone = "academic", length = "balanced" } = options;

  let toneInstruction = "Adopt an academic and analytical tone suitable for professional study guides.";
  if (tone === "executive") {
    toneInstruction = "Adopt a crisp, high-impact executive tone focused on key strategic takeaways and actions.";
  } else if (tone === "simple") {
    toneInstruction = "Adopt a clear, simple, plain English tone that explains concepts with zero unnecessary jargon.";
  }

  let lengthInstruction = "Produce a standard overview paragraph and structured hierarchical points (e.g. 1., 1.1, 1.2).";
  if (length === "concise") {
    lengthInstruction = "Produce a short 2-3 sentence summary paragraph and 3 to 5 high-priority numbered points.";
  } else if (length === "deep") {
    lengthInstruction = "Produce an in-depth comprehensive summary paragraph and detailed multi-level hierarchical points (1., 1.1, 1.2, 1.2.1).";
  }

  try {
    const prompt = `You are an expert notes summarizer. Your task is to extract the core ideas from the provided text and convert them into structured notes.

INSTRUCTIONS:
- Tone: ${toneInstruction}
- Depth & Length: ${lengthInstruction}

CRITICAL CONSTRAINTS:
- ZERO MARKDOWN: Absolutely no bold (**), italics (*), hashes (#), or bullet points (-) anywhere in your output. Use plain text only.
- ZERO FILLER: Do not include conversational filler, introductions, or conclusions (e.g. "Here is the summary"). 

OUTPUT TEMPLATE:
You must strictly follow this exact format:

Summary
[Write the summary paragraph here based on the requested tone and depth.]

Key Points
1. [Main point 1]
  1.1 [Sub-point 1 - indented with 2 spaces]
  1.2 [Sub-point 2 - indented with 2 spaces]
    1.2.1 [Nested sub-point - indented with 4 spaces]
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
      model: modelName,
      options: { tone, length },
    };
  } catch (error) {
    console.error("❌ Gemini Summarizer Service Error:", error.message || error);
    throw new Error(`AI Summarization failed (${modelName}): ${error.message || "Unknown error"}`);
  }
}
