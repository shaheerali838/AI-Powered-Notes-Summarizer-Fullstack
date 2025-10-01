const { Configuration, OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function summarizeText(text) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return generateBasicSummary(text);
    }

    const prompt = `Please provide a concise summary of the following text and extract 3-5 key points.

Text:
${text}

Respond in JSON format:
{
  "summary": "A concise summary of the text (2-3 paragraphs)",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates concise summaries and extracts key points from text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0].message.content;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || responseText,
        keyPoints: parsed.keyPoints || extractKeyPoints(text),
      };
    }

    return {
      summary: responseText,
      keyPoints: extractKeyPoints(text),
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return generateBasicSummary(text);
  }
}

function generateBasicSummary(text) {
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  let summary = "";

  if (sentences.length <= 3) {
    summary = text;
  } else {
    const firstSentence = sentences[0];
    const middleIndex = Math.floor(sentences.length / 2);
    const middleSentence = sentences[middleIndex];
    const lastSentence = sentences[sentences.length - 1];

    summary = `${firstSentence}. ${middleSentence}. ${lastSentence}.`;
  }

  const keyPoints = extractKeyPoints(text);

  return { summary, keyPoints };
}

function extractKeyPoints(text) {
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  const keyPoints = [];
  const step = Math.max(1, Math.floor(sentences.length / 3));

  for (let i = 0; i < 3 && i * step < sentences.length; i++) {
    const sentence = sentences[i * step];
    if (sentence) {
      keyPoints.push(
        sentence.length > 100 ? sentence.substring(0, 100) + "..." : sentence
      );
    }
  }

  return keyPoints.length > 0 ? keyPoints : ["Summary generated from text"];
}

module.exports = { summarizeText };
