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

  const addToHistory = ({ originalText, summaryText }) => {
    const newSummary = {
      id: Date.now().toString(),
      originalText,
      summaryText,
      date: new Date(),
    };
    setSummaryHistory((prev) => [newSummary, ...prev]);
  };

  const clearNotes = () => {
    setOriginalNotes("");
    setSummaryOutput("");
  };

  return (
    <NotesContext.Provider
      value={{
        originalNotes,
        setOriginalNotes,
        summaryOutput,
        setSummaryOutput,
        isGenerating,
        setIsGenerating,
        summaryHistory,
        addToHistory,
        clearNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};
