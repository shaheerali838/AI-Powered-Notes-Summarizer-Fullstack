// src/context/NotesContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../config/firebaseClient";

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
  const { user, isGuest } = useAuth();

  const API_URL =
    import.meta.env.VITE_APP_API_URL ||
    "https://ai-powered-notes-summarizer-backend.vercel.app";

  // Save summary to Firestore for authenticated users
  const saveSummaryToFirestore = async (summaryData) => {
    try {
      const docRef = await addDoc(collection(db, "users", user.uid, "summaries"), {
        ...summaryData,
        createdAt: new Date(),
        fileType: summaryData.fileType || "text",
      });
      return docRef.id;
    } catch (error) {
      console.error("Error saving summary to Firestore:", error);
      throw error;
    }
  };

  // Save summary to sessionStorage for guests
  const saveSummaryToSessionStorage = (summaryData) => {
    const guestSummaries = JSON.parse(
      sessionStorage.getItem("guestSummaries") || "[]"
    );
    const newSummary = {
      id: Date.now().toString(),
      ...summaryData,
      createdAt: new Date(),
      fileType: summaryData.fileType || "text",
    };
    guestSummaries.unshift(newSummary);
    // Keep only last 10 summaries for guests
    if (guestSummaries.length > 10) {
      guestSummaries.splice(10);
    }
    sessionStorage.setItem("guestSummaries", JSON.stringify(guestSummaries));
    return newSummary.id;
  };

  // Fetch history from Firestore for authenticated users
  const fetchHistoryFromFirestore = () => {
    if (!user || isGuest) return;

    const q = query(
      collection(db, "users", user.uid, "summaries"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const history = [];
      querySnapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() });
      });
      setSummaryHistory(history);
    }, (error) => {
      console.error("Error fetching history from Firestore:", error);
      setError("Failed to load history");
    });

    return unsubscribe;
  };

  // Fetch history from sessionStorage for guests
  const fetchHistoryFromSessionStorage = () => {
    const guestSummaries = JSON.parse(
      sessionStorage.getItem("guestSummaries") || "[]"
    );
    setSummaryHistory(guestSummaries);
  };

  // Generate summary
  const generateSummary = async () => {
    if (!originalNotes.trim()) {
      setError("Please enter some text to summarize");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const headers = { "Content-Type": "application/json" };

      // Add auth header for authenticated users
      if (user && !isGuest) {
        headers["Authorization"] = `Bearer ${await user.getIdToken()}`;
      }

      const response = await fetch(`${API_URL}/api/summarize`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: originalNotes }),
      });

      if (!response.ok) throw new Error("Failed to generate summary");

      const data = await response.json();

      // data: { original, summary, keyPoints }
      const summaryData = {
        originalContent: data.original,
        summarizedContent: data.summary,
        keyPoints: data.keyPoints || [],
        wordCount: data.original ? data.original.split(' ').length : 0,
      };

      setSummaryOutput({
        summary: data.summary,
        keyPoints: data.keyPoints || [],
        original: data.original,
      });

      let summaryId;
      if (user && !isGuest) {
        // Save to Firestore for authenticated users
        summaryId = await saveSummaryToFirestore(summaryData);
      } else {
        // Save to sessionStorage for guests
        summaryId = saveSummaryToSessionStorage(summaryData);
      }

    } catch (err) {
      setError(err.message);
      console.error("API Error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Fetch history based on user type
  const fetchHistory = () => {
    if (user && !isGuest) {
      return fetchHistoryFromFirestore();
    } else if (isGuest) {
      fetchHistoryFromSessionStorage();
    } else {
      setSummaryHistory([]);
    }
  };

  // Delete summary
  const deleteSummary = async (id) => {
    if (user && !isGuest) {
      // Delete from Firestore
      try {
        await deleteDoc(doc(db, "users", user.uid, "summaries", id));
        // The onSnapshot listener will update the history
      } catch (err) {
        setError(err.message);
        console.error("Error deleting summary:", err);
      }
    } else {
      // Delete from sessionStorage
      const guestSummaries = JSON.parse(
        sessionStorage.getItem("guestSummaries") || "[]"
      );
      const updatedSummaries = guestSummaries.filter((item) => item.id !== id);
      sessionStorage.setItem(
        "guestSummaries",
        JSON.stringify(updatedSummaries)
      );
      setSummaryHistory(updatedSummaries);
    }
  };

  // Load a specific summary from history
  const loadSummary = (summaryItem) => {
    setOriginalNotes(summaryItem.originalContent || summaryItem.original || "");
    setSummaryOutput({
      summary: summaryItem.summarizedContent || summaryItem.summary,
      keyPoints: summaryItem.keyPoints || [],
      original: summaryItem.originalContent || summaryItem.original,
    });
    setError("");
  };

  const clearNotes = () => {
    setOriginalNotes("");
    setSummaryOutput(null);
    setError("");
  };

  // Effect to fetch history when authentication state changes
  useEffect(() => {
    let unsubscribe;
    if (user && !isGuest) {
      unsubscribe = fetchHistory();
    } else if (isGuest) {
      fetchHistory();
    } else {
      setSummaryHistory([]);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, isGuest]);

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
        loadSummary,
        clearNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};
