import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.OPENROUTER_API_KEY) {
  console.error("OPENROUTER_API_KEY is not set in environment variables");
}

export async function summarizeWithGemini(text) {
  try {
    const prompt = `
You are a professional note summarizer. Convert any text into clear, concise, and highly professional study notes. Follow these rules exactly:

1. Produce a Summary paragraph:
   - Start directly with the word "Summary" on its own line.
   - Write the main ideas clearly and professionally.
   - Keep sentences concise and easy to understand.
   - Do not include extra symbols, markdown characters, or unnecessary headings.
   - Do not use bold, italics, asterisks, bullets, or hashes anywhere.

2. Produce Key Points in a numbered, hierarchical format:
   - Start directly with the word "Key Points" on its own line.
   - Use numbers for main points (1., 2., 3., ...).
   - For sub-points, use nested numbering (1.1, 1.2, 1.2.1, 1.2.2, ...) to indicate hierarchy.
   - Indent each level of sub-points by two spaces per level.
   - Each point must be short, meaningful, and directly from the text.
   - Do not use bold, italics, asterisks, bullets, or hashes anywhere.

3. Do not add any introductory text like "Here are the summaries" or "Based on your text".

Text to summarize:  
${text}
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: Number(process.env.OPENROUTER_TIMEOUT_MS || 30000),
      },
    );

    const rawText = response.data.choices[0].message.content;
    const [summaryPart, keyPointsPart] = rawText.split("Key Points");

    const summary = summaryPart?.replace("Summary", "").trim() || "No summary";
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
    if (error.code === "ECONNABORTED") {
      throw new Error("AI service timeout. Please try again.");
    }
    console.log(
      "❌ SummarizerService Error: custom!!!",
      error.response?.status,

      error.response?.data || error.message,
    );
    throw error;
  }
}
