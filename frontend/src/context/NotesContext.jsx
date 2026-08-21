// src/context/NotesContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  collection,
  addDoc,
  query,
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
  const [currentNote, setCurrentNote] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [summaryHistory, setSummaryHistory] = useState([]);
  const [uploadedNotes, setUploadedNotes] = useState([]);
  const [error, setError] = useState("");
  const { user, isGuest, loading: authLoading } = useAuth();

  const rawApiUrl = import.meta.env.VITE_APP_API_URL || "";
  const cleanApiUrl = rawApiUrl.replace(/\/+$/, "");
  // In production, fallback to relative path if not configured or pointing to localhost
  const API_URL =
    import.meta.env.PROD && (cleanApiUrl.includes("localhost") || cleanApiUrl.includes("127.0.0.1"))
      ? ""
      : (cleanApiUrl || (import.meta.env.DEV ? "http://localhost:5000" : ""));

  // Upload file to backend
  const uploadFile = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError("");

    try {
      const tone = localStorage.getItem("pref_summary_tone") || "academic";
      const length = localStorage.getItem("pref_summary_length") || "balanced";
      const model = localStorage.getItem("pref_gemini_model") || "gemini-3.5-flash-lite";

      const formData = new FormData();
      formData.append("file", file);
      formData.append("tone", tone);
      formData.append("length", length);
      formData.append("model", model);

      const headers = {};
      if (user && !isGuest) {
        try {
          const token = await user.getIdToken();
          headers["Authorization"] = `Bearer ${token}`;
        } catch (tokenError) {
          console.error("Failed to get auth token:", tokenError);
        }
      }

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(`${API_URL}/api/notes/upload`, {
        method: "POST",
        headers,
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Failed to upload file");
      }

      const responseJson = await response.json();
      const data = responseJson.data || responseJson;

      const extracted = data.extractedText || "";
      const summaryText = data.summary || "";
      const points = Array.isArray(data.keyPoints) ? data.keyPoints : [];

      const noteData = {
        id: Date.now().toString(),
        filename: data.filename || file.name,
        extractedText: extracted,
        summary: summaryText,
        keyPoints: points,
        uploadedAt: new Date(),
        fileType: file.type || file.name.split(".").pop(),
        fileSize: file.size,
        model: data.model || model,
      };

      setCurrentNote(noteData);
      setOriginalNotes(extracted);
      setSummaryOutput({
        summary: summaryText,
        keyPoints: points,
        original: extracted,
        model: data.model || model,
      });

      setUploadedNotes((prev) => [noteData, ...prev]);

      if (localStorage.getItem("pref_auto_copy") === "true" && summaryText) {
        try {
          const fullCopy = `${summaryText}\n\nKey Points:\n${points.join("\n")}`;
          navigator.clipboard.writeText(fullCopy);
        } catch (copyErr) {
          console.warn("Auto copy failed:", copyErr);
        }
      }

      try {
        if (user && !isGuest) {
          await saveSummaryToFirestore({
            originalContent: extracted,
            summarizedContent: summaryText,
            keyPoints: points,
            filename: data.filename || file.name,
            fileType: file.type || file.name.split(".").pop(),
            fileSize: file.size,
            model: data.model || model,
          });
        } else {
          saveSummaryToSessionStorage({
            originalContent: extracted,
            summarizedContent: summaryText,
            keyPoints: points,
            filename: data.filename || file.name,
            fileType: file.type || file.name.split(".").pop(),
            fileSize: file.size,
            model: data.model || model,
          });
          fetchHistoryFromSessionStorage();
        }
      } catch (saveError) {
        console.error("Failed to save uploaded note:", saveError);
      }

      return { success: true, data: { ...data, extractedText: extracted } };
    } catch (err) {
      setError(err.message);
      console.error("Upload Error:", err);
      return { success: false, error: err.message };
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const saveSummaryToFirestore = async (summaryData) => {
    if (!user || isGuest) return null;

    try {
      const docRef = await addDoc(
        collection(db, "users", user.uid, "summaries"),
        {
          ...summaryData,
          createdAt: new Date(),
          fileType: summaryData.fileType || "text",
        },
      );
      return docRef.id;
    } catch (error) {
      console.error("Error saving summary to Firestore:", error);
      throw error;
    }
  };

  const saveSummaryToSessionStorage = (summaryData) => {
    try {
      const guestSummaries = JSON.parse(
        sessionStorage.getItem("guestSummaries") || "[]",
      );
      const newSummary = {
        id: Date.now().toString(),
        ...summaryData,
        createdAt: new Date(),
        fileType: summaryData.fileType || "text",
      };
      guestSummaries.unshift(newSummary);
      if (guestSummaries.length > 25) guestSummaries.splice(25);
      sessionStorage.setItem("guestSummaries", JSON.stringify(guestSummaries));
      return newSummary.id;
    } catch (error) {
      console.error("Error saving to sessionStorage:", error);
      return null;
    }
  };

  const fetchHistoryFromFirestore = () => {
    if (!user || isGuest || authLoading) return;

    try {
      const q = query(
        collection(db, "users", user.uid, "summaries"),
        orderBy("createdAt", "desc"),
      );

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
          console.error("Error fetching history:", error);
          setError("Failed to load history");
        },
      );

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up Firestore listener:", error);
      setError("Failed to setup history sync");
    }
  };

  const fetchHistoryFromSessionStorage = () => {
    try {
      const guestSummaries = JSON.parse(
        sessionStorage.getItem("guestSummaries") || "[]",
      );
      setSummaryHistory(guestSummaries);
    } catch (error) {
      console.error("Error fetching from sessionStorage:", error);
      setSummaryHistory([]);
    }
  };

  const fetchHistory = () => {
    if (authLoading) return;
    if (user && !isGuest) return fetchHistoryFromFirestore();
    if (isGuest) fetchHistoryFromSessionStorage();
    else setSummaryHistory([]);
  };

  const generateSummary = async () => {
    if (!originalNotes.trim()) {
      setError("Please enter some text to summarize");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const tone = localStorage.getItem("pref_summary_tone") || "academic";
      const length = localStorage.getItem("pref_summary_length") || "balanced";
      const model = localStorage.getItem("pref_gemini_model") || "gemini-3.5-flash-lite";

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
        body: JSON.stringify({
          text: originalNotes,
          tone,
          length,
          model,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.details ||
          errorData.error ||
          errorData.message ||
          "Failed to generate summary";
        throw new Error(errorMessage);
      }

      const response_data = await response.json();
      const data = response_data.data || response_data;

      if (!data.summary || typeof data.summary !== "string") {
        throw new Error("Invalid API response format");
      }

      const summaryData = {
        originalContent: originalNotes,
        summarizedContent: data.summary,
        keyPoints: Array.isArray(data.keyPoints) ? data.keyPoints : [],
        wordCount: originalNotes.split(/\s+/).filter(Boolean).length,
        model: data.model || model,
      };

      setSummaryOutput({
        summary: data.summary,
        keyPoints: Array.isArray(data.keyPoints) ? data.keyPoints : [],
        original: originalNotes,
        model: data.model || model,
      });

      if (localStorage.getItem("pref_auto_copy") === "true" && data.summary) {
        try {
          const fullCopy = `${data.summary}\n\nKey Points:\n${(data.keyPoints || []).join("\n")}`;
          navigator.clipboard.writeText(fullCopy);
        } catch (copyErr) {
          console.warn("Auto-copy failed:", copyErr);
        }
      }

      try {
        if (user && !isGuest) await saveSummaryToFirestore(summaryData);
        else {
          saveSummaryToSessionStorage(summaryData);
          fetchHistoryFromSessionStorage();
        }
      } catch (saveError) {
        console.error("Failed to save summary:", saveError);
      }
    } catch (err) {
      setError(err.message);
      console.error("API Error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteSummary = async (id) => {
    try {
      if (user && !isGuest) {
        await deleteDoc(doc(db, "users", user.uid, "summaries", id));
      } else {
        const guestSummaries = JSON.parse(
          sessionStorage.getItem("guestSummaries") || "[]",
        );
        const updatedSummaries = guestSummaries.filter((item) => item.id !== id);
        sessionStorage.setItem("guestSummaries", JSON.stringify(updatedSummaries));
        setSummaryHistory(updatedSummaries);
      }
    } catch (err) {
      setError("Failed to delete summary");
      console.error("Error deleting summary:", err);
    }
  };

  const loadSummary = (summaryItem) => {
    setOriginalNotes(summaryItem.originalContent || summaryItem.original || "");
    setSummaryOutput({
      summary: summaryItem.summarizedContent || summaryItem.summary,
      keyPoints: summaryItem.keyPoints || [],
      original: summaryItem.originalContent || summaryItem.original,
      model: summaryItem.model,
    });
    setError("");
  };

  const clearNotes = () => {
    setOriginalNotes("");
    setSummaryOutput(null);
    setCurrentNote(null);
    setError("");
  };

  useEffect(() => {
    if (authLoading) return;

    let unsubscribe;
    if (user && !isGuest) unsubscribe = fetchHistory();
    else fetchHistory();

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
        currentNote,
        setCurrentNote,
        isGenerating,
        isUploading,
        uploadProgress,
        summaryHistory,
        uploadedNotes,
        error,
        uploadFile,
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
