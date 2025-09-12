import { useEffect } from 'react';
import UploadNotes from '../components/UploadNotes';
import NotesDisplay from '../components/NotesDisplay';
import SummaryDisplay from '../components/SummaryDisplay';
import GenerateButton from '../components/GenerateButton';

const HomePage = () => {
  useEffect(() => {
    document.title = 'AI Notes Summarizer - Home';
  }, []);
  
  return (
    <div className="container mx-auto max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <UploadNotes />
        </div>
        
        <div className="md:col-span-2 grid grid-rows-[1fr_auto_1fr] gap-6 h-[calc(100vh-7rem)]">
          <div className="h-full">
            <NotesDisplay />
          </div>
          
          <div className="flex justify-center">
            <GenerateButton />
          </div>
          
          <div className="h-full">
            <SummaryDisplay />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;