export const generateSummary = (text) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sentences = text.split(/[.!?]+/).filter(Boolean);
      let summary = '';
      
      if (sentences.length <= 3) {
        summary = text;
      } else {
        const firstSentence = sentences[0];
        const middleSentence = sentences[Math.floor(sentences.length / 2)];
        const lastSentence = sentences[sentences.length - 1];
        
        summary = `${firstSentence.trim()}. ${middleSentence.trim()}. ${lastSentence.trim()}.`;
        
        summary += '\n\nKey points:\n';
        
        const words = text.split(' ');
        for (let i = 0; i < 3; i++) {
          const startIdx = Math.floor(Math.random() * (words.length - 5));
          summary += `- ${words.slice(startIdx, startIdx + 5).join(' ')}...\n`;
        }
      }
      
      resolve(summary);
    }, 1500);
  });
};