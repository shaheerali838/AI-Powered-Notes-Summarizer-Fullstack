import { useEffect, useState } from "react";
import { Clock, ArrowRight, Trash2 } from "lucide-react";
import { useNotes } from "../context/NotesContext";
import { Link } from "react-router-dom";

const HistoryPage = () => {
  const { setOriginalNotes, setSummaryOutput } = useNotes();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "AI Notes Summarizer - History";
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/history");

      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }

      const data = await response.json();
      setHistory(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSummary = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/summary/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete summary");
      }

      // Remove the deleted item from local state
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
      console.error("Error deleting summary:", err);
    }
  };

  const handleViewSummary = (original, summary) => {
    setOriginalNotes(original);
    setSummaryOutput(summary);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";

    // If it's a Firestore Timestamp object
    if (timestamp._seconds) {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(timestamp._seconds * 1000));
    }

    // If it's already a JS Date string/number
    const date = new Date(timestamp);
    if (isNaN(date)) return "Invalid date";

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-semibold text-gray-900">
            Summary History
          </h1>
        </div>
        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
          <p className="text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-semibold text-gray-900">
            Summary History
          </h1>
        </div>
        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={fetchHistory}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
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

      {history.length === 0 ? (
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
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {typeof item.original === "string"
                      ? item.original.substring(0, 50) +
                        (item.original.length > 50 ? "..." : "")
                      : "No original notes available"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {item.timestamp
                      ? formatDate(item.timestamp)
                      : "Unknown date"}
                  </p>
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
                    onClick={() =>
                      handleViewSummary(item.original, item.summary)
                    }
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    View <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="text-sm text-gray-700 line-clamp-2">
                {typeof item.summary === "string"
                  ? item.summary
                  : item.summary?.summary || "No summary available"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
