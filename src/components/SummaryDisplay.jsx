import { Sparkles, Copy } from 'lucide-react';
import { useState } from 'react';
import { useNotes } from '../context/NotesContext';

const SummaryDisplay = () => {
  const { summaryOutput, isGenerating } = useNotes();
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    if (!summaryOutput) return;
    
    navigator.clipboard.writeText(summaryOutput);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-full relative">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Summarized Output</h2>
      </div>
      
      <div className="mt-4 h-[calc(100%-3rem)] overflow-auto">
        {isGenerating ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : summaryOutput ? (
          <p className="text-gray-700 whitespace-pre-line">{summaryOutput}</p>
        ) : (
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-4 bg-gray-100 rounded w-5/6"></div>
            <div className="h-4 bg-gray-100 rounded w-4/6"></div>
            <div className="h-4 bg-gray-100 rounded w-full"></div>
          </div>
        )}
      </div>
      
      {summaryOutput && (
        <button
          onClick={handleCopy}
          className="absolute bottom-6 right-6 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      )}
    </div>
  );
};

export default SummaryDisplay;