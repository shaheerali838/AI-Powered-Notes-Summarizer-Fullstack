import { FileText } from 'lucide-react';
import { useNotes } from '../context/NotesContext';

const NotesDisplay = () => {
  const { originalNotes, currentNote } = useNotes();
  
  const displayText = originalNotes || currentNote?.extractedText || '';
  const filename = currentNote?.filename;
  
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs h-full transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        <div className="flex-1">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Original Notes</h2>
          {filename && (
            <p className="text-xs text-slate-500 dark:text-slate-400">From: {filename}</p>
          )}
        </div>
      </div>
      
      <div className="mt-4 h-[calc(100%-3rem)] overflow-auto">
        {displayText ? (
          <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-line">{displayText}</p>
        ) : (
          <div className="space-y-2">
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-5/6"></div>
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-4/6"></div>
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesDisplay;