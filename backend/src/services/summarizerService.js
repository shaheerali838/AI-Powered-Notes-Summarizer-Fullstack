import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

export async function summarizeWithGemini(text) {
  try {
    const prompt = `
You are a professional note summarizer. Convert any text into clear, concise, and highly professional study notes. Follow these rules exactly:

1. Produce a **Summary** paragraph but dont use any other extra word in start just directly start from summary:
   - Write the main ideas clearly and professionally.
   - Keep sentences concise and easy to understand.
   - Do not include extra symbols, markdown characters, or unnecessary headings.

2. Produce **Key Points** in a numbered, hierarchical format:
   - Use numbers for main points (1., 2., 3., ...).
   - For sub-points, use nested numbering (1.1, 1.2, 1.2.1, 1.2.2, ...) to indicate hierarchy.
   - Indent each level of sub-points by two spaces per level.
   - Each point must be short, meaningful, and directly from the text.
   - Include important terms, definitions, and examples clearly.
   - Do not use asterisks, bullets, or hashes.

3. Do not add any introductory text like "Here are the summaries" or "Based on your text".

4. Format the output exactly like this example:

Summary  
[Write a concise, professional paragraph summarizing the text.]

Key Points  
1. Topic: [Main topic]  
2. Key Researcher: [Name]  
3. Experiment: [Brief description]  
4. Basic Concept: [Explanation]  
5. Key Terms:  
  5.1 Term 1: [Definition/example]  
    5.1.1 Sub-term A: [Definition/example]  
    5.1.2 Sub-term B: [Definition/example]  
  5.2 Term 2: [Definition/example]  
6. Real-World Example: [Example relevant to the topic]

Text to summarize:  
${text}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", text: prompt }],
    });

    // ✅ Extract the raw text
    const rawText = response.candidates[0].content.parts[0].text;

    // ✅ Split into summary and keyPoints
    const [summaryPart, keyPointsPart] = rawText.split("**Key Points");

    // Clean summary
    const summary = summaryPart
      .replace("**Simple Summary (Easy to Understand):**", "")
      .trim();

    // Clean keyPoints array
    const keyPoints = keyPointsPart
      ? keyPointsPart
          .split("\n")
          .map((line) => line.replace(/^[-*•\s]+/, "").trim())
          .filter((line) => line.length > 0)
      : [];

    return {
      original: text,
      summary,
      keyPoints,
    };
  } catch (error) {
    console.error("❌ SummarizerService Error:", error);
    throw error;
  }
}
