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

  // 1️⃣ Define all functions first

  const generateSummary = async () => {
    if (!originalNotes.trim()) {
      setError("Please enter some text to summarize");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: originalNotes }),
      });
      // console.log(response);

      if (!response.ok) throw new Error("Failed to generate summary");

      const data = await response.json();

      setSummaryOutput({
        original: data.original,
        summary: data.summary,
        keyPoints: data.keyPoints || [],
      });

      addToHistory({
        originalText: data.original,
        summaryText: data.summary,
        keyPoints: data.keyPoints || [],
        id: data.id || Date.now(),
      });
    } catch (err) {
      setError(err.message);
      console.error("API Error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const addToHistory = ({ originalText, summaryText, keyPoints, id }) => {
    const newSummary = {
      id: id.toString(),
      originalText,
      summaryText,
      keyPoints,
      date: new Date(),
    };
    setSummaryHistory((prev) => [newSummary, ...prev]);
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/history");
      if (!response.ok) throw new Error("Failed to fetch history");
      const data = await response.json();
      const formattedHistory = data.map((item) => ({
        id: item.id.toString(),
        originalText: item.original,
        summaryText: item.summary,
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
      const response = await fetch(`/api/summary/${id}`, { method: "DELETE" });
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

  // 2️⃣ Then use them in the provider value
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
