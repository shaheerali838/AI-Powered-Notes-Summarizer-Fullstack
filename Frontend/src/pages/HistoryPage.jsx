import { useEffect } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { useNotes } from '../context/NotesContext';
import { Link } from 'react-router-dom';

const HistoryPage = () => {
  const { summaryHistory, setOriginalNotes, setSummaryOutput } = useNotes();
  
  useEffect(() => {
    document.title = 'AI Notes Summarizer - History';
  }, []);
  
  const handleViewSummary = (originalText, summaryText) => {
    setOriginalNotes(originalText);
    setSummaryOutput(summaryText);
  };
  
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };
  
  return (
    <div className="container mx-auto max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-semibold text-gray-900">Summary History</h1>
      </div>
      
      {summaryHistory.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
          <p className="text-gray-600 mb-4">You haven't created any summaries yet.</p>
          <Link 
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create your first summary
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {summaryHistory.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {item.originalText.substring(0, 50)}
                    {item.originalText.length > 50 ? '...' : ''}
                  </h3>
                  <p className="text-sm text-gray-500">{formatDate(item.date)}</p>
                </div>
                
                <Link
                  to="/"
                  onClick={() => handleViewSummary(item.originalText, item.summaryText)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  View <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              
              <div className="text-sm text-gray-700 line-clamp-2">
                {item.summaryText}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;