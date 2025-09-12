import { useEffect } from 'react';
import { Info, CheckCircle } from 'lucide-react';

const AboutPage = () => {
  useEffect(() => {
    document.title = 'AI Notes Summarizer - About';
  }, []);
  
  return (
    <div className="container mx-auto max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Info className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-semibold text-gray-900">About AI Notes Summarizer</h1>
      </div>
      
      <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
        <p className="text-gray-700 mb-6">
          AI Notes Summarizer is a powerful tool designed to help students, professionals, and researchers 
          quickly extract the key points from their notes, documents, and research materials. 
          Our advanced AI technology analyzes your text and generates concise, accurate summaries 
          that capture the essential information.
        </p>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h2>
        
        <ul className="space-y-3 mb-6">
          {[
            'Instant summarization of notes, articles, and documents',
            'Support for text paste and file uploads (.txt, .pdf)',
            'Smart keyword extraction and key point identification',
            'History tracking to access your previous summaries',
            'Clean, distraction-free interface for maximum productivity',
            'Copy functionality for easy sharing of summarized content'
          ].map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h2>
        
        <ol className="space-y-4 mb-6">
          {[
            'Upload your notes by pasting text or uploading a file',
            'Click "Generate Summary" to process your content',
            'Review the AI-generated summary alongside your original notes',
            'Copy or save the summary for later reference'
          ].map((step, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-medium">
                {index + 1}
              </span>
              <span className="text-gray-700">{step}</span>
            </li>
          ))}
        </ol>
        
        <p className="text-gray-700">
          Our mission is to help you save time and extract maximum value from your written content.
          Whether you're studying for an exam, preparing for a meeting, or conducting research,
          AI Notes Summarizer is the perfect companion for efficient information processing.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;