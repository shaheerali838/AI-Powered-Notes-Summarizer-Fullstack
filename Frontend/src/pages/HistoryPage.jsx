// src/pages/HistoryPage.jsx
import { useEffect, useState, useRef } from "react";
import { Clock, ArrowRight, Trash2, Lock, User } from "lucide-react";
import { useNotes } from "../context/NotesContext";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const HistoryPage = () => {
  const {
    summaryHistory,
    deleteSummary,
    loadSummary,
    fetchHistory,
    selectedSummary,
  } = useNotes();
  const { user, isGuest, openAuthModal } = useAuth();
  const [loading, setLoading] = useState(true);
  const summaryRefs = useRef({}); // store refs for each summary item

  useEffect(() => {
    document.title = "AI Notes Summarizer - History";
    if (user || isGuest) {
      fetchHistory();
      setLoading(false);
    }
  }, [user, isGuest]);

  // Scroll to selected summary when it changes
  useEffect(() => {
    if (selectedSummary && summaryRefs.current[selectedSummary.id]) {
      summaryRefs.current[selectedSummary.id].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedSummary]);

  const handleViewSummary = (summaryItem) => {
    loadSummary(summaryItem);
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

      {summaryHistory.length === 0 ? (
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
      ) : (
        <div className="space-y-4">
          {summaryHistory.map((item) => (
            <div
              key={item.id}
              ref={(el) => (summaryRefs.current[item.id] = el)}
              className={`bg-white p-6 rounded-lg border transition-shadow ${
                selectedSummary?.id === item.id
                  ? "border-blue-500 shadow-md"
                  : "border-gray-200 shadow-sm"
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
      )}
    </div>
  );
};

export default HistoryPage;
