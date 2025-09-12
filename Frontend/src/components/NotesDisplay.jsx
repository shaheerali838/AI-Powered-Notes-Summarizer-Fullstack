import { FileText } from 'lucide-react';
import { useNotes } from '../context/NotesContext';

const NotesDisplay = () => {
  const { originalNotes } = useNotes();
  
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Original Notes</h2>
      </div>
      
      <div className="mt-4 h-[calc(100%-3rem)] overflow-auto">
        {originalNotes ? (
          <p className="text-gray-700 whitespace-pre-line">{originalNotes}</p>
        ) : (
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-4 bg-gray-100 rounded w-5/6"></div>
            <div className="h-4 bg-gray-100 rounded w-4/6"></div>
            <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesDisplay;