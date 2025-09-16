import { createContext, useState, useContext } from "react";

const NotesContext = createContext();

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) throw new Error("useNotes must be used within NotesProvider");
  return context;
};

export const NotesProvider = ({ children }) => {
  const [originalNotes, setOriginalNotes] = useState("");
  const [summaryOutput, setSummaryOutput] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryHistory, setSummaryHistory] = useState([]);
  const [error, setError] = useState("");

  // ✅ API base URL from env
  const API_URL = "https://ai-powered-notes-summarizer-backend.vercel.app";

  // Generate summary
  const generateSummary = async () => {
    if (!originalNotes.trim()) {
      setError("Please enter some text to summarize");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: originalNotes }),
      });

      if (!response.ok) throw new Error("Failed to generate summary");

      const data = await response.json();

      // data: { original, summary, keyPoints }
      setSummaryOutput({
        summary: data.summary,
        keyPoints: data.keyPoints || [],
        original: data.original,
      });

      addToHistory({
        id: data.id || Date.now(),
        original: data.original,
        summary: data.summary,
        keyPoints: data.keyPoints || [],
        date: new Date(),
      });
    } catch (err) {
      setError(err.message);
      console.error("API Error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Add summary to local history state
  const addToHistory = ({ id, original, summary, keyPoints, date }) => {
    const newSummary = {
      id: id.toString(),
      original,
      summary,
      keyPoints,
      date,
    };
    setSummaryHistory((prev) => [newSummary, ...prev]);
  };

  // Fetch history from backend
  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/history`);
      if (!response.ok) throw new Error("Failed to fetch history");
      const data = await response.json();

      const formattedHistory = data.map((item) => ({
        id: item.id.toString(),
        original: item.original,
        summary: item.summary,
        keyPoints: item.keyPoints || [],
        date: new Date(item.timestamp),
      }));

      setSummaryHistory(formattedHistory);
    } catch (err) {
      setError(err.message);
      console.error("API Error:", err);
    }
  };

  const deleteSummary = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/summary/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete summary");
      setSummaryHistory((prev) =>
        prev.filter((item) => item.id !== id.toString())
      );
    } catch (err) {
      setError(err.message);
      console.error("API Error:", err);
    }
  };

  const clearNotes = () => {
    setOriginalNotes("");
    setSummaryOutput(null);
    setError("");
  };

  return (
    <NotesContext.Provider
      value={{
        originalNotes,
        setOriginalNotes,
        summaryOutput,
        setSummaryOutput,
        isGenerating,
        summaryHistory,
        error,
        generateSummary,
        fetchHistory,
        deleteSummary,
        clearNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};
console.log(import.meta.env.VITE_APP_API_URL);
