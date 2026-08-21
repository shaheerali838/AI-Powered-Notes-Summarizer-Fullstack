import { useEffect } from 'react';
import { Info, CheckCircle } from 'lucide-react';

const AboutPage = () => {
  useEffect(() => {
    document.title = 'AI Notes Summarizer - About';
  }, []);
  
  return (
    <div className="container mx-auto max-w-4xl py-2">
      <div className="flex items-center gap-2 mb-6">
        <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">About AI Notes Summarizer</h1>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-6">
          AI Notes Summarizer is a powerful tool designed to help students, professionals, and researchers 
          quickly extract the key points from their notes, documents, and research materials. 
          Our advanced AI technology analyzes your text and generates concise, accurate summaries 
          that capture the essential information.
        </p>
        
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Key Features</h2>
        
        <ul className="space-y-3 mb-6">
          {[
            'Instant summarization of notes, articles, and documents',
            'Support for text paste and file uploads (.txt, .pdf, .docx, images)',
            'Smart keyword extraction and hierarchical point identification',
            'Cloud sync and history tracking for your previous summaries',
            'Clean, distraction-free interface with Light & Dark mode support',
            'One-click copy and JSON data export functionality'
          ].map((feature, index) => (
            <li key={index} className="flex items-start gap-2.5">
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">{feature}</span>
            </li>
          ))}
        </ul>
        
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">How It Works</h2>
        
        <ol className="space-y-3.5 mb-6">
          {[
            'Upload your notes by pasting text or uploading a file',
            'Click "Generate Summary" to process your content with AI',
            'Review the AI-generated summary alongside structured key points',
            'Copy or save the summary for later reference in your history'
          ].map((step, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 font-bold text-2xs">
                {index + 1}
              </span>
              <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">{step}</span>
            </li>
          ))}
        </ol>
        
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
          Our mission is to help you save time and extract maximum value from your written content.
          Whether you're studying for an exam, preparing for a meeting, or conducting research,
          AI Notes Summarizer is the perfect companion for efficient information processing.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;