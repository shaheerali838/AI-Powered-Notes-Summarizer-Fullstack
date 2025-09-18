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
  if (!context) {
    throw new Error("useNotes must be used within NotesProvider");
  }
  return context;
};

export const NotesProvider = ({ children }) => {
  const [originalNotes, setOriginalNotes] = useState("");
  const [summaryOutput, setSummaryOutput] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryHistory, setSummaryHistory] = useState([]);
  const [error, setError] = useState("");
  const { user, isGuest, loading: authLoading } = useAuth();

  const API_URL =
    import.meta.env.VITE_APP_API_URL ||
    "https://ai-powered-notes-summarizer-backend.vercel.app";

  // Save summary to Firestore for authenticated users
  const saveSummaryToFirestore = async (summaryData) => {
    if (!user || isGuest) return null;

    try {
      const docRef = await addDoc(
        collection(db, "users", user.uid, "summaries"),
        {
          ...summaryData,
          createdAt: new Date(),
          fileType: summaryData.fileType || "text",
        }
      );
      return docRef.id;
    } catch (error) {
      console.error("Error saving summary to Firestore:", error);
      throw error;
    }
  };

  // Save summary to sessionStorage for guests
  const saveSummaryToSessionStorage = (summaryData) => {
    try {
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
      if (guestSummaries.length > 10) guestSummaries.splice(10);
      sessionStorage.setItem("guestSummaries", JSON.stringify(guestSummaries));
      return newSummary.id;
    } catch (error) {
      console.error("Error saving to sessionStorage:", error);
      return null;
    }
  };

  // Fetch history from Firestore for authenticated users
  const fetchHistoryFromFirestore = () => {
    if (!user || isGuest || authLoading) return;

    try {
      const q = query(
        collection(db, "users", user.uid, "summaries"),
        orderBy("createdAt", "desc")
      );

      // Return the unsubscribe function
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const history = [];
          querySnapshot.forEach((doc) => {
            history.push({ id: doc.id, ...doc.data() });
          });
          setSummaryHistory(history);
        },
        (error) => {
          console.error("Error fetching history from Firestore:", error);
          setError("Failed to load history");
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up Firestore listener:", error);
      setError("Failed to setup history sync");
    }
  };

  // Fetch history from sessionStorage for guests
  const fetchHistoryFromSessionStorage = () => {
    try {
      const guestSummaries = JSON.parse(
        sessionStorage.getItem("guestSummaries") || "[]"
      );
      setSummaryHistory(guestSummaries);
    } catch (error) {
      console.error("Error fetching from sessionStorage:", error);
      setSummaryHistory([]);
    }
  };

  // Generate summary (no changes needed)
  const generateSummary = async () => {
    if (!originalNotes.trim()) {
      setError("Please enter some text to summarize");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const headers = { "Content-Type": "application/json" };

      if (user && !isGuest) {
        try {
          const token = await user.getIdToken();
          headers["Authorization"] = `Bearer ${token}`;
        } catch (tokenError) {
          console.error("Failed to get auth token:", tokenError);
        }
      }

      const response = await fetch(`${API_URL}/api/summarize`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: originalNotes }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to generate summary");
      }

      const data = await response.json();

      const summaryData = {
        originalContent: data.original,
        summarizedContent: data.summary,
        keyPoints: data.keyPoints || [],
        wordCount: data.original ? data.original.split(" ").length : 0,
      };

      setSummaryOutput({
        summary: data.summary,
        keyPoints: data.keyPoints || [],
        original: data.original,
      });

      if (user && !isGuest) {
        await saveSummaryToFirestore(summaryData);
      } else {
        saveSummaryToSessionStorage(summaryData);
        fetchHistoryFromSessionStorage();
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
    if (authLoading) return;
    if (user && !isGuest) return fetchHistoryFromFirestore();
    if (isGuest) fetchHistoryFromSessionStorage();
    if (!user) setSummaryHistory([]);
  };

  // Delete summary (no changes)
  const deleteSummary = async (id) => {
    try {
      if (user && !isGuest) {
        await deleteDoc(doc(db, "users", user.uid, "summaries", id));
      } else {
        const guestSummaries = JSON.parse(
          sessionStorage.getItem("guestSummaries") || "[]"
        );
        const updatedSummaries = guestSummaries.filter(
          (item) => item.id !== id
        );
        sessionStorage.setItem(
          "guestSummaries",
          JSON.stringify(updatedSummaries)
        );
        setSummaryHistory(updatedSummaries);
      }
    } catch (err) {
      setError("Failed to delete summary");
      console.error("Error deleting summary:", err);
    }
  };

  // Load summary (no changes)
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

  // Effect to fetch history when auth state changes (fixed unsubscribe)
  useEffect(() => {
    if (authLoading) return;

    let unsubscribe;
    if (user && !isGuest) {
      unsubscribe = fetchHistoryFromFirestore();
    } else if (isGuest) {
      fetchHistoryFromSessionStorage();
    } else {
      setSummaryHistory([]);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, isGuest, authLoading]);

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
