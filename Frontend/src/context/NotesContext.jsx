import { createContext, useState, useContext } from "react";

const NotesContext = createContext();

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
};

export const NotesProvider = ({ children }) => {
  const [originalNotes, setOriginalNotes] = useState("");
  const [summaryOutput, setSummaryOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryHistory, setSummaryHistory] = useState([]);
  const [error, setError] = useState("");

  // Function to call the backend API for summarization
  const generateSummary = async () => {
    if (!originalNotes.trim()) {
      setError("Please enter some text to summarize");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: originalNotes }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      const data = await response.json();
      setSummaryOutput(data.summary);

      // Add to history
      addToHistory({
        originalText: originalNotes,
        summaryText: data.summary,
        id: data.id,
      });
    } catch (err) {
      setError(err.message);
      console.error("API Error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to fetch history from backend
  const fetchHistory = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/history");

      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }

      const data = await response.json();

      // Convert backend history format to frontend format
      const formattedHistory = data.map((item) => ({
        id: item.id.toString(),
        originalText: item.original,
        summaryText: item.summary,
        date: new Date(item.timestamp),
      }));

      setSummaryHistory(formattedHistory);
    } catch (err) {
      setError(err.message);
      console.error("API Error:", err);
    }
  };

  // Function to delete a summary from backend
  const deleteSummary = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/summary/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete summary");
      }

      // Remove from local history
      setSummaryHistory((prev) =>
        prev.filter((item) => item.id !== id.toString())
      );
    } catch (err) {
      setError(err.message);
      console.error("API Error:", err);
    }
  };

  const addToHistory = ({ originalText, summaryText, id }) => {
    const newSummary = {
      id: id.toString(),
      originalText,
      summaryText,
      date: new Date(),
    };
    setSummaryHistory((prev) => [newSummary, ...prev]);
  };

  const clearNotes = () => {
    setOriginalNotes("");
    setSummaryOutput("");
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
