// src/pages/HistoryPage.jsx
import { useEffect, useState, useRef } from "react";
import { Clock, ArrowRight, Trash2, Lock, User, FileText, Upload } from "lucide-react";
import { useNotes } from "../context/NotesContext";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const HistoryPage = () => {
  const {
    summaryHistory,
    uploadedNotes,
    deleteSummary,
    loadSummary,
    fetchHistory,
    setCurrentNote,
  } = useNotes();
  const { user, isGuest, openAuthModal } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summaries');

  useEffect(() => {
    document.title = "AI Notes Summarizer - History";
    if (user || isGuest) {
      fetchHistory();
      setLoading(false);
    }
  }, [user, isGuest]);

  const handleViewSummary = (summaryItem) => {
    loadSummary(summaryItem);
  };

  const handleViewUploadedNote = (noteItem) => {
    setCurrentNote(noteItem);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date)) return "Invalid date";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!user) {
    return (
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-semibold text-gray-900">
            Summary History
          </h1>
        </div>
        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
          <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Sign In Required
          </h2>
          <p className="text-gray-600 mb-6">
            Sign in to view and manage your summary history
          </p>
          <button
            onClick={() => openAuthModal("login")}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl">
        <p className="text-gray-600 text-center py-8">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-semibold text-gray-900">
          Summary History
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        <button
          onClick={() => setActiveTab('summaries')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'summaries'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Text Summaries ({summaryHistory.length})
        </button>
        <button
          onClick={() => setActiveTab('uploads')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'uploads'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Uploaded Files ({uploadedNotes.length})
        </button>
      </div>

      {isGuest && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-5 w-5 text-yellow-600" />
            <h3 className="font-medium text-yellow-800">Guest Mode</h3>
          </div>
          <p className="text-sm text-yellow-700 mb-3">
            Your history is temporary. Sign in to save your summaries
            permanently.
          </p>
          <button
            onClick={() => openAuthModal("login")}
            className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200 transition-colors"
          >
            Sign In Now
          </button>
        </div>
      )}

      {activeTab === 'summaries' && summaryHistory.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
          <p className="text-gray-600 mb-4">
            You haven't created any summaries yet.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create your first summary
          </Link>
        </div>
      ) : activeTab === 'summaries' ? (
        <div className="space-y-4">
          {summaryHistory.map((item) => (
            <div
              key={item.id}
              className={`bg-white p-6 rounded-lg border transition-shadow ${
                "border-gray-200 shadow-sm hover:shadow-md"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {item.originalContent || item.original
                      ? (item.originalContent || item.original).substring(
                          0,
                          50
                        ) +
                        ((item.originalContent || item.original).length > 50
                          ? "..."
                          : "")
                      : "No original notes available"}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{formatDate(item.createdAt || item.timestamp)}</span>
                    {item.wordCount && <span>• {item.wordCount} words</span>}
                    {item.filename && <span>• {item.filename}</span>}
                    {item.fileType && item.fileType !== "text" && (
                      <span>• {item.fileType.toUpperCase()}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteSummary(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete summary"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <Link
                    to="/"
                    onClick={() => handleViewSummary(item)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    View <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="text-sm text-gray-700 line-clamp-2">
                {item.summarizedContent ||
                  item.summary ||
                  "No summary available"}
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'uploads' && uploadedNotes.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
          <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            You haven't uploaded any files yet.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload your first file
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {uploadedNotes.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900">
                      {item.filename}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{formatDate(item.uploadedAt)}</span>
                    {item.fileSize && <span>• {formatFileSize(item.fileSize)}</span>}
                    {item.fileType && (
                      <span>• {item.fileType.split('/')[1]?.toUpperCase()}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteSummary(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete uploaded file"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <Link
                    to="/"
                    onClick={() => handleViewUploadedNote(item)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    View <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Preview of extracted text */}
              <div className="text-sm text-gray-700 mb-3">
                <p className="font-medium text-gray-800 mb-1">Extracted Text:</p>
                <p className="line-clamp-2">
                  {item.extractedText ? 
                    item.extractedText.substring(0, 150) + (item.extractedText.length > 150 ? "..." : "")
                    : "No text extracted"}
                </p>
              </div>

              {/* Preview of summary */}
              {item.summary && (
                <div className="text-sm text-gray-700">
                  <p className="font-medium text-gray-800 mb-1">Summary:</p>
                  <p className="line-clamp-2">
                    {item.summary.substring(0, 150) + (item.summary.length > 150 ? "..." : "")}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;