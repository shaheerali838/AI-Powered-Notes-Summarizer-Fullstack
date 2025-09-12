import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async generateSummary(text) {
    try {
      const prompt = `Please summarize the following text in a clear and concise manner. 
      Focus on the main points and key ideas. Return only the summary without any introductory text:
      
      ${text}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to generate summary using Gemini API");
    }
  }

  async generateBulletPoints(text) {
    try {
      const prompt = `Please convert the following text into clear bullet points highlighting the main ideas:
      
      ${text}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to generate bullet points using Gemini API");
    }
  }
}

export default new GeminiService();
