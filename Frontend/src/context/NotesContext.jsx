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
      const docRef = await addDoc(collection(db, "summaries"), {
        userId: user.uid,
        ...summaryData,
        timestamp: new Date(),
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
      timestamp: new Date(),
    };
    guestSummaries.unshift(newSummary);
    sessionStorage.setItem("guestSummaries", JSON.stringify(guestSummaries));
    return newSummary.id;
  };

  // Fetch history from Firestore for authenticated users
  const fetchHistoryFromFirestore = () => {
    if (!user) return;

    const q = query(
      collection(db, "summaries"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const history = [];
      querySnapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() });
      });
      setSummaryHistory(history);
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
        original: data.original,
        summary: data.summary,
        keyPoints: data.keyPoints || [],
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

      // Add to local state
      addToHistory({
        id: summaryId,
        ...summaryData,
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
        await deleteDoc(doc(db, "summaries", id));
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
        clearNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};
