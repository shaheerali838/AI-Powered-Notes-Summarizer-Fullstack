import { formatError } from '../utils/responseFormatter.js';

export class SummarizerService {
  static async generateSummary(text) {
    try {
      // Basic text analysis
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const words = text.split(/\s+/).filter(w => w.length > 0);
      
      if (sentences.length === 0) {
        throw formatError('No content to summarize', 400);
      }
      
      // Generate summary based on text length
      let summary;
      let keyPoints = [];
      
      if (sentences.length <= 3) {
        // Short text - return as is
        summary = text.trim();
        keyPoints = sentences.map((s, i) => `${i + 1}. ${s.trim()}`);
      } else {
        // Longer text - create extractive summary
        summary = this.createExtractiveSummary(sentences, words);
        keyPoints = this.extractKeyPoints(sentences, words);
      }
      
      return {
        summary: summary.trim(),
        keyPoints,
        originalLength: words.length,
        summaryLength: summary.split(/\s+/).length,
        compressionRatio: Math.round((summary.split(/\s+/).length / words.length) * 100)
      };
    } catch (error) {
      console.error('Summarization error:', error);
      throw formatError('Failed to generate summary', 500);
    }
  }
  
  static createExtractiveSummary(sentences, words) {
    // Simple extractive summarization
    const targetLength = Math.max(2, Math.min(5, Math.floor(sentences.length * 0.3)));
    
    // Score sentences based on position and word frequency
    const wordFreq = this.calculateWordFrequency(words);
    const sentenceScores = sentences.map((sentence, index) => {
      const sentenceWords = sentence.toLowerCase().split(/\s+/);
      const score = sentenceWords.reduce((sum, word) => {
        return sum + (wordFreq[word] || 0);
      }, 0) / sentenceWords.length;
      
      // Boost first and last sentences
      const positionBoost = (index === 0 || index === sentences.length - 1) ? 1.2 : 1.0;
      
      return {
        sentence: sentence.trim(),
        score: score * positionBoost,
        index
      };
    });
    
    // Select top sentences
    const topSentences = sentenceScores
      .sort((a, b) => b.score - a.score)
      .slice(0, targetLength)
      .sort((a, b) => a.index - b.index);
    
    return topSentences.map(s => s.sentence).join('. ') + '.';
  }
  
  static extractKeyPoints(sentences, words) {
    const wordFreq = this.calculateWordFrequency(words);
    const keyWords = Object.entries(wordFreq)
      .filter(([word]) => word.length > 3)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
    
    // Find sentences containing key words
    const keyPointSentences = sentences
      .map((sentence, index) => {
        const sentenceWords = sentence.toLowerCase().split(/\s+/);
        const keyWordCount = sentenceWords.filter(word => keyWords.includes(word)).length;
        return {
          sentence: sentence.trim(),
          keyWordCount,
          index
        };
      })
      .filter(s => s.keyWordCount > 0)
      .sort((a, b) => b.keyWordCount - a.keyWordCount)
      .slice(0, 5);
    
    return keyPointSentences.map((s, i) => `${i + 1}. ${s.sentence}`);
  }
  
  static calculateWordFrequency(words) {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these',
      'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
      'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'
    ]);
    
    const frequency = {};
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      if (cleanWord.length > 2 && !stopWords.has(cleanWord)) {
        frequency[cleanWord] = (frequency[cleanWord] || 0) + 1;
      }
    });
    
    return frequency;
  }
}