import { useEffect, useState } from 'react';
import UploadNotes from '../components/UploadNotes';
import NotesDisplay from '../components/NotesDisplay';
import SummaryDisplay from '../components/SummaryDisplay';
import GenerateButton from '../components/GenerateButton';
import { useNotes } from '../context/NotesContext';
import { useUI } from '../context/UIContext';

const HomePage = () => {
  const { originalNotes, summaryOutput } = useNotes();
  const { isMobile } = useUI();
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    document.title = 'AI Notes Summarizer - Home';
  }, []);
  
  useEffect(() => {
    setShowResults(!!summaryOutput);
  }, [summaryOutput]);

  return (
    <div className="container mx-auto max-w-6xl">
      {!showResults ? (
        /* Initial Upload State */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
          {/* Upload Section */}
          <div className="lg:col-span-1 flex flex-col">
            <UploadNotes />
          </div>
          
          {/* Generate Button */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-6">
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Ready to Summarize</h2>
                  <p className="text-gray-600 mb-6">Enter your notes and click generate to create an AI-powered summary</p>
                  <GenerateButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Post-Generation State */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
          {/* Original Notes */}
          <div className="flex flex-col">
            <NotesDisplay />
          </div>
          
          {/* Summarized Output */}
          <div className="flex flex-col">
            <SummaryDisplay />
            
            {/* Generate New Summary Button */}
            <div className="mt-4 flex justify-center">
              <GenerateButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;