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
      <div className="container mx-auto max-w-4xl py-2">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Summary History
          </h1>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center">
          <Lock className="h-16 w-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Sign In Required
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
            Sign in to view and manage your summary history across devices.
          </p>
          <button
            onClick={() => openAuthModal("login")}
            className="inline-flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-2">
        <p className="text-slate-500 dark:text-slate-400 text-center py-8 text-sm">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-2">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Summary History
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6">
        <button
          onClick={() => setActiveTab('summaries')}
          className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'summaries'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Text Summaries ({summaryHistory.length})
        </button>
        <button
          onClick={() => setActiveTab('uploads')}
          className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'uploads'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Uploaded Files ({uploadedNotes.length})
        </button>
      </div>

      {isGuest && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <User className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <h3 className="font-bold text-sm text-amber-800 dark:text-amber-300">Guest Mode</h3>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
            Your history is stored locally. Sign in to sync your summaries
            permanently to the cloud.
          </p>
          <button
            onClick={() => openAuthModal("login")}
            className="text-xs bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors cursor-pointer"
          >
            Sign In Now
          </button>
        </div>
      )}

      {activeTab === 'summaries' && summaryHistory.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
            You haven't created any summaries yet.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs shadow-blue-500/20"
          >
            Create your first summary
          </Link>
        </div>
      ) : activeTab === 'summaries' ? (
        <div className="space-y-3.5">
          {summaryHistory.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3 gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                    {item.filename ||
                      item.originalContent ||
                      item.original ||
                      "Untitled Note"}
                  </h3>
                  <div className="flex items-center gap-2 text-2xs sm:text-xs text-slate-400 dark:text-slate-500 mt-1">
                    <span>{formatDate(item.createdAt || item.timestamp)}</span>
                    {item.wordCount && <span>• {item.wordCount} words</span>}
                    {item.filename && <span>• {item.filename}</span>}
                    {item.fileType && item.fileType !== "text" && (
                      <span>• {item.fileType.toUpperCase()}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => deleteSummary(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    title="Delete summary"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <Link
                    to="/"
                    onClick={() => handleViewSummary(item)}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1"
                  >
                    View <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {item.summarizedContent ||
                  item.summary ||
                  "No summary available"}
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'uploads' && uploadedNotes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center">
          <Upload className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
            You haven't uploaded any files yet.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs shadow-blue-500/20"
          >
            Upload your first file
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {uploadedNotes.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3 gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                      {item.filename}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-2xs sm:text-xs text-slate-400 dark:text-slate-500">
                    <span>{formatDate(item.uploadedAt)}</span>
                    {item.fileSize && <span>• {formatFileSize(item.fileSize)}</span>}
                    {item.fileType && (
                      <span>• {item.fileType.split('/')[1]?.toUpperCase()}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => deleteSummary(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    title="Delete uploaded file"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <Link
                    to="/"
                    onClick={() => handleViewUploadedNote(item)}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1"
                  >
                    View <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Preview of extracted text */}
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-2.5">
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs mb-0.5">Extracted Text:</p>
                <p className="line-clamp-2 leading-relaxed">
                  {item.extractedText ? 
                    item.extractedText.substring(0, 150) + (item.extractedText.length > 150 ? "..." : "")
                    : "No text extracted"}
                </p>
              </div>

              {/* Preview of summary */}
              {item.summary && (
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs mb-0.5">Summary:</p>
                  <p className="line-clamp-2 leading-relaxed">
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